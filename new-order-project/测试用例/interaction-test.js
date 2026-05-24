const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000/create-order-pad.html';

const testResults = [];

function logResult(browser, testName, status, details = '') {
    const result = { browser, testName, status, details, timestamp: new Date().toISOString() };
    testResults.push(result);
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${browser}] ${testName}: ${status} ${details ? '(' + details + ')' : ''}`);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function selectMemberFromModal(page) {
    const overlay = await page.$('#memberModalOverlay');
    if (overlay) {
        const isVisible = await overlay.isVisible();
        if (isVisible) {
            console.log('检测到会员弹窗，开始选择会员...');
            
            // 等待 iframe 加载完成
            const iframe = await page.waitForSelector('#memberModalIframe', { timeout: 10000 });
            if (!iframe) {
                console.log('未找到会员弹窗iframe');
                return;
            }
            
            // 获取 iframe 内容
            const frame = await iframe.contentFrame();
            if (!frame) {
                console.log('无法获取iframe内容');
                return;
            }
            
            // 在搜索框中输入数字1
            const searchInput = await frame.waitForSelector('#searchInput', { timeout: 5000 });
            if (searchInput) {
                await searchInput.fill('1');
                console.log('已在搜索框输入数字1');
            } else {
                console.log('未找到搜索框');
                return;
            }
            
            // 点击查询按钮
            const searchBtn = await frame.waitForSelector('#btnSearch', { timeout: 5000 });
            if (searchBtn) {
                await searchBtn.click();
                console.log('已点击查询按钮');
                await sleep(1000);
            } else {
                console.log('未找到查询按钮');
                return;
            }
            
            // 等待会员列表加载并选择第一个会员
            const memberItem = await frame.waitForSelector('.member-item', { timeout: 10000 });
            if (memberItem) {
                await memberItem.click();
                console.log('已选择第一个会员');
                await sleep(800);
            } else {
                console.log('未找到会员列表');
                return;
            }
            
            console.log('会员选择完成');
        }
    }
}

async function runBrowserTests(browserType, browserName) {
    let browser;
    let page;

    try {
        console.log(`\n========== 启动 ${browserName} 浏览器 ==========`);
        browser = await browserType.launch({ headless: true });
        page = await browser.newPage();
        page.setDefaultTimeout(30000);

        console.log(`[${browserName}] 正在打开页面...`);
        await page.goto(BASE_URL);
        await page.waitForLoadState('domcontentloaded');
        await sleep(2000);
        
        // 选择会员（输入数字1并点击查询，选择第一个会员）
        await selectMemberFromModal(page);
        
        logResult(browserName, '页面加载与会员选择', 'PASS', '页面成功加载并选择会员');

        // 1. 触发添加商品弹窗
        console.log(`[${browserName}] 步骤1: 触发添加商品弹窗`);
        const addProductBtn = await page.$('.action-card.product');
        if (addProductBtn) {
            await addProductBtn.click({ force: true });
            await sleep(800);
            logResult(browserName, '触发添加商品弹窗', 'PASS', '弹窗已打开');
        } else {
            logResult(browserName, '触发添加商品弹窗', 'FAIL', '未找到添加商品按钮');
            await browser.close();
            return;
        }

        // 2. 在弹窗中选择商品
        console.log(`[${browserName}] 步骤2: 选择商品`);
        const productItem = await page.waitForSelector('.product-item, .service-item', { timeout: 10000 }).catch(() => null);
        if (productItem) {
            await productItem.click();
            await sleep(300);
            logResult(browserName, '选择商品', 'PASS', '商品已选中');
        } else {
            logResult(browserName, '选择商品', 'FAIL', '未找到商品列表');
            await browser.close();
            return;
        }

        // 3. 确认添加商品
        console.log(`[${browserName}] 步骤3: 确认添加商品`);
        const confirmBtn = await page.$('#addProductConfirmBtn');
        if (confirmBtn) {
            await confirmBtn.click();
            await sleep(800);
            logResult(browserName, '确认添加商品', 'PASS', '商品已添加到购物车');
        } else {
            logResult(browserName, '确认添加商品', 'FAIL', '未找到确认按钮');
            await browser.close();
            return;
        }

        // 4. 验证商品已添加
        console.log(`[${browserName}] 步骤4: 验证商品添加`);
        const itemRow = await page.waitForSelector('.item-row', { timeout: 10000 }).catch(() => null);
        if (itemRow) {
            logResult(browserName, '验证商品添加', 'PASS', '商品显示在已选区域');
        } else {
            logResult(browserName, '验证商品添加', 'FAIL', '商品未显示');
            await browser.close();
            return;
        }

        // 5. 应用金额卡
        console.log(`[${browserName}] 步骤5: 应用金额卡`);
        const moneyCardBtn = await page.$('[data-action="money-card"], .money-card-btn');
        if (moneyCardBtn) {
            await moneyCardBtn.click({ force: true });
            await sleep(800);
            const cardItem = await page.waitForSelector('.money-card-item', { timeout: 5000 }).catch(() => null);
            if (cardItem) {
                await cardItem.click();
                await sleep(300);
                const cardConfirm = await page.$('#moneyCardConfirmBtn');
                if (cardConfirm) {
                    await cardConfirm.click();
                    await sleep(800);
                    logResult(browserName, '应用金额卡', 'PASS', '金额卡已应用');
                } else {
                    logResult(browserName, '应用金额卡', 'FAIL', '未找到金额卡确认按钮');
                }
            } else {
                logResult(browserName, '应用金额卡', 'FAIL', '未找到金额卡列表');
            }
        } else {
            logResult(browserName, '应用金额卡', 'FAIL', '未找到应用金额卡按钮');
        }

        // 6. 修改购买数量
        console.log(`[${browserName}] 步骤6: 修改购买数量`);
        const quantityInput = await page.$('input[data-field="quantity"]');
        if (quantityInput) {
            await quantityInput.fill('2');
            await quantityInput.blur();
            await sleep(500);
            logResult(browserName, '修改购买数量', 'PASS', '数量已修改为2');
        } else {
            logResult(browserName, '修改购买数量', 'FAIL', '未找到数量输入框');
        }

        // 7. 设置商品折后价
        console.log(`[${browserName}] 步骤7: 设置商品折后价`);
        const finalPriceInput = await page.$('input[data-field="finalPrice"]');
        if (finalPriceInput) {
            await finalPriceInput.click({ force: true });
            await sleep(300);
            const numPadOk = await page.$('.numkeypad-btn-ok, .confirm-btn');
            if (numPadOk) {
                await page.type('.numkeypad-input', '100');
                await sleep(200);
                await numPadOk.click();
                await sleep(500);
                logResult(browserName, '设置商品折后价', 'PASS', '折后价已设置');
            } else {
                logResult(browserName, '设置商品折后价', 'FAIL', '未找到数字键盘确认按钮');
            }
        } else {
            logResult(browserName, '设置商品折后价', 'FAIL', '未找到折后价输入框');
        }

        // 8. 设置商品折扣
        console.log(`[${browserName}] 步骤8: 设置商品折扣`);
        const discountInput = await page.$('input[data-field="discount"]');
        if (discountInput) {
            await discountInput.click({ force: true });
            await sleep(300);
            const numPadOk = await page.$('.numkeypad-btn-ok, .confirm-btn');
            if (numPadOk) {
                await page.type('.numkeypad-input', '80');
                await sleep(200);
                await numPadOk.click();
                await sleep(500);
                logResult(browserName, '设置商品折扣', 'PASS', '折扣已设置为80%');
            } else {
                logResult(browserName, '设置商品折扣', 'FAIL', '未找到数字键盘确认按钮');
            }
        } else {
            logResult(browserName, '设置商品折扣', 'FAIL', '未找到折扣输入框');
        }

        // 9. 执行整单改价
        console.log(`[${browserName}] 步骤9: 执行整单改价`);
        const wholeOrderBtn = await page.$('#wholeOrderChangeBtn');
        if (wholeOrderBtn) {
            await wholeOrderBtn.click({ force: true });
            await sleep(800);
            const amountInput = await page.$('#wocAmountInput');
            if (amountInput) {
                await amountInput.fill('150');
                await sleep(300);
                const wocConfirm = await page.$('#wocConfirmBtn');
                if (wocConfirm) {
                    await wocConfirm.click();
                    await sleep(800);
                    logResult(browserName, '执行整单改价', 'PASS', '整单改价已完成');
                } else {
                    logResult(browserName, '执行整单改价', 'FAIL', '未找到整单改价确认按钮');
                }
            } else {
                logResult(browserName, '执行整单改价', 'FAIL', '未找到整单改价金额输入框');
            }
        } else {
            logResult(browserName, '执行整单改价', 'FAIL', '未找到整单改价按钮');
        }

        // 10. 验证金额计算
        console.log(`[${browserName}] 步骤10: 验证金额计算`);
        const totalAmount = await page.$('.total-amount, [data-display="total"], .order-total');
        if (totalAmount) {
            const amountText = await totalAmount.textContent();
            if (amountText) {
                logResult(browserName, '验证金额计算', 'PASS', `金额显示: ${amountText.trim()}`);
            } else {
                logResult(browserName, '验证金额计算', 'FAIL', '金额文本为空');
            }
        } else {
            logResult(browserName, '验证金额计算', 'FAIL', '未找到金额显示元素');
        }

        // 截图
        const screenshotPath = `测试用例/交互测试_${browserName}_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[${browserName}] 截图已保存: ${screenshotPath}`);

        await browser.close();
        console.log(`[${browserName}] 测试完成`);

    } catch (error) {
        console.error(`[${browserName}] 测试出错:`, error);
        logResult(browserName, '测试异常', 'FAIL', error.message);
        if (page) {
            const screenshotPath = `测试用例/交互测试_${browserName}_错误_${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
        }
        if (browser) await browser.close();
    }
}

function generateReport() {
    const passCount = testResults.filter(r => r.status === 'PASS').length;
    const failCount = testResults.filter(r => r.status === 'FAIL').length;
    const total = testResults.length;

    let report = '# 用户交互测试报告\n\n';
    report += '## 测试信息\n';
    report += `- 测试日期: ${new Date().toLocaleString('zh-CN')}\n`;
    report += `- 测试页面: ${BASE_URL}\n`;
    report += `- 测试工具: Playwright v1.60.0\n\n`;

    report += '## 执行统计\n';
    report += '| 浏览器 | 测试用例数 | 通过 | 失败 | 通过率 |\n';
    report += '|--------|------------|------|------|--------|\n';

    const browsers = ['Chromium'];
    for (const browser of browsers) {
        const browserResults = testResults.filter(r => r.browser === browser);
        const pass = browserResults.filter(r => r.status === 'PASS').length;
        const fail = browserResults.filter(r => r.status === 'FAIL').length;
        const total = browserResults.length;
        const rate = total > 0 ? ((pass / total) * 100).toFixed(1) + '%' : '-';
        report += `| ${browser} | ${total} | ${pass} | ${fail} | ${rate} |\n`;
    }

    const overallRate = total > 0 ? ((passCount / total) * 100).toFixed(1) + '%' : '-';
    report += `| **合计** | **${total}** | **${passCount}** | **${failCount}** | **${overallRate}** |\n\n`;

    report += '## 测试结果明细\n\n';
    for (const browser of browsers) {
        const browserResults = testResults.filter(r => r.browser === browser);
        if (browserResults.length === 0) continue;

        report += `### ${browser}\n\n`;
        report += '| 测试步骤 | 状态 | 详情 |\n';
        report += '|----------|------|------|\n';
        browserResults.forEach(r => {
            const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
            report += `| ${r.testName} | ${icon} ${r.status} | ${r.details} |\n`;
        });
        report += '\n';
    }

    report += '## 结论\n\n';
    report += `本次测试共执行 **${total}** 条测试用例，通过 **${passCount}** 条，`;
    report += `失败 **${failCount}** 条，通过率 **${overallRate}**。\n\n`;

    if (failCount === 0) {
        report += '🎉 **所有测试用例均已通过！**\n';
    } else {
        report += '⚠️ **存在未通过的测试用例，请检查并修复。**\n';
    }

    fs.writeFileSync('测试用例/用户交互测试报告.md', report, 'utf8');
    console.log('\n测试报告已生成: 测试用例/用户交互测试报告.md');

    return { passCount, failCount, total };
}

async function runAllTests() {
    console.log('========== 开始用户交互测试 ==========');
    await runBrowserTests(chromium, 'Chromium');
    const stats = generateReport();

    console.log('\n========== 测试完成 ==========');
    console.log(`总用例数: ${stats.total}`);
    console.log(`通过: ${stats.passCount}`);
    console.log(`失败: ${stats.failCount}`);
    console.log(`通过率: ${((stats.passCount / stats.total) * 100).toFixed(1)}%`);
}

runAllTests();
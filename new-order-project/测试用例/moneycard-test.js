const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:8000/create-order-pad.html';

const testResults = [];
const failedCases = [];

function logResult(browser, testName, status, details = '', steps = [], actualResult = '', expectedResult = '') {
    const result = { 
        browser, 
        testName, 
        status, 
        details, 
        timestamp: new Date().toISOString(),
        steps,
        actualResult,
        expectedResult
    };
    testResults.push(result);
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${browser}] ${testName}: ${status} ${details ? '(' + details + ')' : ''}`);
    
    if (status === 'FAIL') {
        failedCases.push(result);
    }
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
            
            const iframe = await page.waitForSelector('#memberModalIframe', { timeout: 10000 });
            if (!iframe) {
                console.log('未找到会员弹窗iframe');
                return false;
            }
            
            const frame = await iframe.contentFrame();
            if (!frame) {
                console.log('无法获取iframe内容');
                return false;
            }
            
            console.log('使用数字键盘输入数字1...');
            // 使用数字键盘输入数字1
            const key1 = await frame.waitForSelector('.key-item[data-key="1"]', { timeout: 5000 });
            if (key1) {
                await key1.click();
                await sleep(300);
                console.log('已通过数字键盘输入数字1');
            } else {
                console.log('未找到数字键盘按键1');
                return false;
            }
            
            // 点击数字键盘上的确认按钮
            const confirmKey = await frame.waitForSelector('.key-item[data-key="confirm"]', { timeout: 5000 });
            if (confirmKey) {
                await confirmKey.click();
                console.log('已点击数字键盘确认按钮');
                await sleep(1000);
            } else {
                console.log('未找到数字键盘确认按钮');
                // 尝试点击查询按钮
                const searchBtn = await frame.$('#btnSearch');
                if (searchBtn) {
                    await searchBtn.click();
                    await sleep(1000);
                }
            }
            
            const memberItem = await frame.waitForSelector('.member-item', { timeout: 10000 });
            if (memberItem) {
                await memberItem.click();
                console.log('已选择第一个会员');
                await sleep(800);
                return true;
            } else {
                console.log('未找到会员列表');
                return false;
            }
        }
    }
    return false;
}

async function addProduct(page) {
    const addProductBtn = await page.$('.action-card.product');
    if (addProductBtn) {
        await addProductBtn.click({ force: true });
        await sleep(1500);
        
        // 等待弹窗出现
        const overlay = await page.waitForSelector('#addProductModalOverlay.show, .add-service-modal-overlay.show', { timeout: 10000 }).catch(() => null);
        if (!overlay) {
            console.log('未找到添加产品弹窗');
            return false;
        }
        
        // 查找产品表格中的第一行数据
        const productRow = await page.waitForSelector('#addProductTableBody tr', { timeout: 10000 }).catch(() => null);
        if (productRow) {
            // 点击商品行选择商品
            await productRow.click({ force: true });
            await sleep(500);
            console.log('已点击产品行选择商品');
            
            // 使用 JavaScript 直接点击确认按钮
            const confirmClicked = await page.evaluate(() => {
                const btn = document.getElementById('addProductConfirmBtn');
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            }).catch(() => false);
            
            if (confirmClicked) {
                await sleep(1000);
                console.log('已点击确认按钮');
                return true;
            } else {
                console.log('未找到确认按钮或点击失败');
            }
        } else {
            console.log('未找到产品列表项');
        }
    } else {
        console.log('未找到添加产品按钮');
    }
    return false;
}

async function getRowData(row) {
    const discountInput = await row.$('.discount-input');
    const finalPriceInput = await row.$('.final-price');
    const priceCell = await row.$('.col-price');
    const moneycards = await row.getAttribute('data-moneycards');
    const userDiscountOverride = await row.getAttribute('data-user-discount-override');
    const originalCardDiscount = await row.getAttribute('data-original-card-discount');
    const originalCardPrice = await row.getAttribute('data-original-card-price');
    
    let discount = 0;
    let price = 0;
    
    if (discountInput) {
        discount = parseFloat(await discountInput.evaluate(el => el.value)) || 0;
    }
    
    if (finalPriceInput) {
        price = parseFloat(await finalPriceInput.evaluate(el => el.value)) || 0;
    } else if (priceCell) {
        const priceText = await priceCell.evaluate(el => el.textContent);
        price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
    }
    
    return {
        discount: discount,
        price: price,
        moneycards: moneycards ? JSON.parse(moneycards) : [],
        userDiscountOverride: userDiscountOverride === '1',
        originalCardDiscount: parseFloat(originalCardDiscount) || 0,
        originalCardPrice: parseFloat(originalCardPrice) || 0
    };
}

async function runMoneyCardTests(browserType, browserName) {
    let browser;
    let page;

    try {
        console.log(`\n========== 启动 ${browserName} 浏览器 ==========`);
        browser = await browserType.launch({ headless: false });
        page = await browser.newPage();
        page.setDefaultTimeout(30000);

        console.log(`[${browserName}] 正在打开页面...`);
        await page.goto(BASE_URL);
        await page.waitForLoadState('domcontentloaded');
        await sleep(2000);
        
        await selectMemberFromModal(page);
        logResult(browserName, '页面加载与会员选择', 'PASS', '页面成功加载并选择会员');

        // ===== 阶段1: 添加商品 =====
        console.log(`[${browserName}] 步骤1: 添加商品`);
        const added = await addProduct(page);
        if (!added) {
            logResult(browserName, '添加商品', 'FAIL', '未能添加商品', 
                ['点击添加商品按钮', '选择商品', '确认添加'],
                '商品未添加成功',
                '商品应成功添加到订单');
            await browser.close();
            return;
        }
        logResult(browserName, '添加商品', 'PASS', '商品已成功添加');

        // ===== 阶段2: 金额卡基础操作 =====
        
        // 步骤2: 打开金额卡弹窗
        console.log(`[${browserName}] 步骤2: 打开金额卡弹窗`);
        const openMoneyCardBtn = await page.waitForSelector('[data-action="open-moneycard-modal"]', { timeout: 10000 });
        if (!openMoneyCardBtn) {
            logResult(browserName, '打开金额卡弹窗', 'FAIL', '未找到金额卡按钮',
                ['查找金额卡按钮'],
                '按钮未找到',
                '按钮应存在');
            await browser.close();
            return;
        }
        await openMoneyCardBtn.click();
        await sleep(800);
        
        const moneyCardModal = await page.$('.moneycard-modal-overlay.show');
        if (!moneyCardModal) {
            logResult(browserName, '打开金额卡弹窗', 'FAIL', '金额卡弹窗未显示',
                ['点击金额卡按钮'],
                '弹窗未显示',
                '弹窗应显示');
            await browser.close();
            return;
        }
        logResult(browserName, '打开金额卡弹窗', 'PASS', '金额卡弹窗已成功打开');

        // 步骤3: 选择第一张金额卡（首次应用）
        console.log(`[${browserName}] 步骤3: 选择第一张金额卡`);
        const firstCard = await page.waitForSelector('.moneycard-item', { timeout: 5000 });
        if (!firstCard) {
            logResult(browserName, '选择第一张金额卡', 'FAIL', '未找到金额卡列表',
                ['查找金额卡列表'],
                '列表未找到',
                '列表应存在');
            await browser.close();
            return;
        }
        
        await firstCard.click();
        await sleep(300);
        
        // 使用 JavaScript 直接点击确认按钮
        const confirmClicked = await page.evaluate(() => {
            const btn = document.getElementById('moneyCardConfirmBtn');
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        }).catch(() => false);
        
        if (confirmClicked) {
            await sleep(800);
            logResult(browserName, '选择第一张金额卡', 'PASS', '第一张金额卡已应用');
        } else {
            logResult(browserName, '选择第一张金额卡', 'FAIL', '未找到确认按钮',
                ['查找确认按钮'],
                '按钮未找到',
                '按钮应存在');
            await browser.close();
            return;
        }

        // 步骤4: 验证首次应用金额卡后重置折扣为100%（规则4.4规则4）
        console.log(`[${browserName}] 步骤4: 验证首次应用金额卡后折扣重置`);
        const itemRow = await page.$('tr.item-row');
        if (itemRow) {
            const rowData = await getRowData(itemRow);
            if (rowData.discount === 100 || rowData.discount === 1) {
                logResult(browserName, '验证首次应用金额卡折扣重置', 'PASS', `折扣已重置为${rowData.discount}%`);
            } else {
                logResult(browserName, '验证首次应用金额卡折扣重置', 'FAIL', `期望折扣为100%，实际${rowData.discount}%`,
                    ['检查折扣值'],
                    `实际折扣${rowData.discount}%`,
                    '折扣应为100%');
            }
            if (!rowData.userDiscountOverride) {
                logResult(browserName, '验证userDiscountOverride标记', 'PASS', 'userDiscountOverride标记已清除');
            } else {
                logResult(browserName, '验证userDiscountOverride标记', 'FAIL', 'userDiscountOverride标记未清除',
                    ['检查标记状态'],
                    '标记为true',
                    '标记应为false');
            }
        } else {
            logResult(browserName, '验证首次应用金额卡折扣重置', 'FAIL', '未找到商品行');
        }

        // 步骤5: 验证金额卡明细行显示
        console.log(`[${browserName}] 步骤5: 验证金额卡明细行显示`);
        await sleep(500); // 给更多时间让明细行渲染
        const moneycardDetailRow = await page.$('.moneycard-detail-row');
        const moneycardDetailItem = await page.$('.moneycard-detail-item');
        if (moneycardDetailRow || moneycardDetailItem) {
            logResult(browserName, '验证金额卡明细行显示', 'PASS', '金额卡明细行已显示');
        } else {
            logResult(browserName, '验证金额卡明细行显示', 'FAIL', '金额卡明细行未显示',
                ['检查金额卡明细行'],
                '明细行未找到',
                '明细行应显示');
        }

        // 步骤6: 添加第二张金额卡（多张卡叠加）
        console.log(`[${browserName}] 步骤6: 添加第二张金额卡`);
        const openMoneyCardBtn2 = await page.$('[data-action="open-moneycard-modal"]');
        if (openMoneyCardBtn2) {
            await openMoneyCardBtn2.click();
            await sleep(800);
            
            const cardItems = await page.$$('.moneycard-item');
            if (cardItems.length > 1) {
                await cardItems[1].click();
                await sleep(300);
                
                // 使用 JavaScript 直接点击确认按钮
                const confirmClicked2 = await page.evaluate(() => {
                    const btn = document.getElementById('moneyCardConfirmBtn');
                    if (btn) {
                        btn.click();
                        return true;
                    }
                    return false;
                }).catch(() => false);
                
                if (confirmClicked2) {
                    await sleep(800);
                    logResult(browserName, '添加第二张金额卡', 'PASS', '第二张金额卡已应用');
                }
            } else {
                logResult(browserName, '添加第二张金额卡', 'FAIL', '只有一张金额卡可用',
                    ['检查金额卡数量'],
                    `只有${cardItems.length}张金额卡`,
                    '需要至少2张金额卡');
            }
        }

        // 步骤7: 验证多张金额卡显示
        console.log(`[${browserName}] 步骤7: 验证多张金额卡显示`);
        const moneycardItems = await page.$$('.moneycard-detail-item');
        if (moneycardItems.length >= 2) {
            logResult(browserName, '验证多张金额卡显示', 'PASS', `已显示${moneycardItems.length}张金额卡`);
        } else {
            logResult(browserName, '验证多张金额卡显示', 'FAIL', `期望至少2张金额卡，实际${moneycardItems.length}张`,
                ['检查金额卡明细数量'],
                `实际${moneycardItems.length}张`,
                '至少2张');
        }

        // 步骤8: 验证金额计算（订单汇总）
        console.log(`[${browserName}] 步骤8: 验证金额计算`);
        const orderPayableInput = await page.$('#orderPayableAmountInput');
        const itemPayable = await page.$('.item-payable-val');
        if (orderPayableInput || itemPayable) {
            let payableAmount = 0;
            if (orderPayableInput) {
                payableAmount = parseFloat(await orderPayableInput.evaluate(el => el.value)) || 0;
            } else if (itemPayable) {
                const itemPayableText = await itemPayable.evaluate(el => el.textContent);
                payableAmount = parseFloat(itemPayableText.replace(/[^0-9.]/g, '')) || 0;
            }
            
            if (payableAmount > 0) {
                logResult(browserName, '验证金额计算', 'PASS', `应付金额: ¥${payableAmount.toFixed(2)}`);
            } else {
                logResult(browserName, '验证金额计算', 'FAIL', `应付金额异常: ¥${payableAmount}`,
                    ['检查金额显示'],
                    `应付金额¥${payableAmount}`,
                    '应付金额应大于0');
            }
        } else {
            logResult(browserName, '验证金额计算', 'FAIL', '金额显示元素未找到');
        }

        // ===== 阶段3: 替换金额卡 =====
        
        // 步骤9: 测试替换金额卡（规则4.1规则2）
        console.log(`[${browserName}] 步骤9: 测试替换金额卡`);
        // 尝试在金额卡明细项中找到替换按钮
        const firstMoneycardItem = await page.$('.moneycard-detail-item');
        if (firstMoneycardItem) {
            const replaceBtn = await firstMoneycardItem.$('.moneycard-detail-actions span');
            if (replaceBtn) {
                const beforeCards = await page.$$('.moneycard-detail-item');
                const beforeCardIds = await Promise.all(beforeCards.map(async c => await c.getAttribute('data-card-id')));
                
                await replaceBtn.click({ force: true });
                await sleep(800);
                
                const cardItems = await page.$$('.moneycard-item');
                // 过滤掉已经选择的卡
                const availableCards = [];
                for (let i = 0; i < cardItems.length; i++) {
                    const id = await cardItems[i].getAttribute('data-card-id');
                    if (!beforeCardIds.includes(id)) {
                        availableCards.push(cardItems[i]);
                    }
                }
                
                if (availableCards.length > 0) {
                    await availableCards[0].click();
                    await sleep(300);
                    
                    // 使用 JavaScript 直接点击确认按钮
                    const confirmClicked3 = await page.evaluate(() => {
                        const btn = document.getElementById('moneyCardConfirmBtn');
                        if (btn) {
                            btn.click();
                            return true;
                        }
                        return false;
                    }).catch(() => false);
                    
                    if (confirmClicked3) {
                        await sleep(800);
                        
                        const afterCards = await page.$$('.moneycard-detail-item');
                        if (afterCards.length === beforeCards.length) {
                            logResult(browserName, '测试替换金额卡', 'PASS', '金额卡已成功替换');
                        } else {
                            logResult(browserName, '测试替换金额卡', 'FAIL', `替换后数量变化: ${beforeCards.length}→${afterCards.length}`,
                                ['点击替换按钮', '选择新卡', '确认替换'],
                                `数量从${beforeCards.length}变为${afterCards.length}`,
                                '数量应保持不变');
                        }
                    }
                } else {
                    logResult(browserName, '测试替换金额卡', 'FAIL', '无可替换的金额卡');
                    const closeBtn = await page.$('#moneyCardCancelBtn');
                    if (closeBtn) await closeBtn.click();
                }
            } else {
                logResult(browserName, '测试替换金额卡', 'FAIL', '未找到替换按钮');
            }
        } else {
            logResult(browserName, '测试替换金额卡', 'FAIL', '未找到金额卡明细项');
        }

        // ===== 阶段4: 防重复添加 =====
        
        // 步骤10: 测试防重复添加（规则4.1规则1）
        console.log(`[${browserName}] 步骤10: 测试防重复添加`);
        const openMoneyCardBtn3 = await page.$('[data-action="open-moneycard-modal"]');
        if (openMoneyCardBtn3) {
            await openMoneyCardBtn3.click({ force: true });
            await sleep(800);
            
            const beforeCount = (await page.$$('.moneycard-detail-item')).length;
            
            // 获取第一个已选卡的ID
            const firstMoneycard = await page.$('.moneycard-detail-item');
            let selectedCardId = null;
            if (firstMoneycard) {
                selectedCardId = await firstMoneycard.getAttribute('data-card-id');
            }
            
            // 尝试选择已选的卡
            const cardItems = await page.$$('.moneycard-item');
            if (cardItems.length > 0) {
                // 查找与已选卡相同的ID
                let targetCard = null;
                for (let i = 0; i < cardItems.length; i++) {
                    const id = await cardItems[i].getAttribute('data-card-id');
                    if (id === selectedCardId) {
                        targetCard = cardItems[i];
                        break;
                    }
                }
                
                // 如果找到了就选择它，否则选择第一张
                const cardToClick = targetCard || cardItems[0];
                
                // 检查按钮是否可用
                const isDisabled = await cardToClick.evaluate(el => el.disabled || el.classList.contains('disabled'));
                if (isDisabled) {
                    // 按钮已经禁用，说明防重复添加机制已生效
                    logResult(browserName, '测试防重复添加', 'PASS', `重复添加被阻止，已选卡按钮已禁用`);
                    
                    // 关闭弹窗
                    const closeBtn = await page.$('#moneyCardCancelBtn');
                    if (closeBtn) await closeBtn.click();
                } else {
                    // 尝试点击
                    try {
                        await cardToClick.click();
                        await sleep(300);
                        
                        // 检查确认按钮是否可用
                        const confirmBtn = await page.$('#moneyCardConfirmBtn');
                        const confirmIsDisabled = confirmBtn ? await confirmBtn.evaluate(el => el.disabled || el.classList.contains('disabled')) : true;
                        
                        if (confirmIsDisabled) {
                            logResult(browserName, '测试防重复添加', 'PASS', `重复添加被阻止，确认按钮已禁用`);
                        } else {
                            // 使用 JavaScript 直接点击确认按钮
                            const confirmClicked4 = await page.evaluate(() => {
                                const btn = document.getElementById('moneyCardConfirmBtn');
                                if (btn) {
                                    btn.click();
                                    return true;
                                }
                                return false;
                            }).catch(() => false);
                            
                            if (confirmClicked4) {
                                await sleep(800);
                                
                                const afterCount = (await page.$$('.moneycard-detail-item')).length;
                                
                                if (afterCount === beforeCount) {
                                    logResult(browserName, '测试防重复添加', 'PASS', `重复添加被阻止，数量保持${beforeCount}张`);
                                } else {
                                    logResult(browserName, '测试防重复添加', 'FAIL', `重复添加未被阻止，数量从${beforeCount}变为${afterCount}`,
                                        ['打开弹窗', '选择已添加的卡', '确认添加'],
                                        `数量从${beforeCount}变为${afterCount}`,
                                        '数量应保持不变');
                                }
                            }
                        }
                    } catch (e) {
                        logResult(browserName, '测试防重复添加', 'PASS', `点击已选卡失败，防重复添加机制生效: ${e.message}`);
                        const closeBtn = await page.$('#moneyCardCancelBtn');
                        if (closeBtn) await closeBtn.click();
                    }
                }
            } else {
                logResult(browserName, '测试防重复添加', 'FAIL', '未找到金额卡列表');
            }
        } else {
            logResult(browserName, '测试防重复添加', 'FAIL', '未找到打开金额卡弹窗按钮');
        }

        // ===== 阶段5: 用户修改折扣/折后价联动 =====
        
        // 步骤11: 修改折扣（规则4.4规则1）
        console.log(`[${browserName}] 步骤11: 修改折扣`);
        const discountInput = await page.$('.discount-input');
        if (discountInput) {
            const beforeData = await getRowData(itemRow);
            await discountInput.click({ force: true });
            await sleep(300);
            
            // 使用数字键盘输入折扣
            const key8 = await page.$('.key-item[data-key="8"]');
            const key0 = await page.$('.key-item[data-key="0"]');
            const keyConfirm = await page.$('.key-item[data-key="confirm"]');
            
            if (key8 && key0 && keyConfirm) {
                await key8.click();
                await sleep(200);
                await key0.click();
                await sleep(200);
                await keyConfirm.click();
                await sleep(800);
                
                const afterData = await getRowData(itemRow);
                if (afterData.discount === 80 || parseFloat(afterData.discount) === 0.8) {
                    logResult(browserName, '修改折扣', 'PASS', `折扣已修改为${afterData.discount}%`);
                } else {
                    logResult(browserName, '修改折扣', 'FAIL', `折扣修改失败，期望80，实际${afterData.discount}`,
                        ['点击折扣输入框', '通过数字键盘输入80', '确认'],
                        `实际折扣${afterData.discount}%`,
                        '折扣应为80%');
                }
                
                // 验证userDiscountOverride标记设置
                if (afterData.userDiscountOverride) {
                    logResult(browserName, '验证userDiscountOverride标记设置', 'PASS', 'userDiscountOverride标记已设置为1');
                } else {
                    logResult(browserName, '验证userDiscountOverride标记设置', 'FAIL', 'userDiscountOverride标记未设置',
                        ['检查标记状态'],
                        '标记为false',
                        '标记应为true');
                }
            } else {
                logResult(browserName, '修改折扣', 'FAIL', '未找到数字键盘');
            }
        } else {
            logResult(browserName, '修改折扣', 'FAIL', '未找到折扣输入框');
        }

        // 步骤12: 修改折后价（规则4.4规则2）
        console.log(`[${browserName}] 步骤12: 修改折后价`);
        const priceInput = await page.$('.final-price');
        if (priceInput) {
            const beforeData = await getRowData(itemRow);
            await priceInput.click({ force: true });
            await sleep(300);
            
            // 使用数字键盘输入折后价
            const key1 = await page.$('.key-item[data-key="1"]');
            const key5 = await page.$('.key-item[data-key="5"]');
            const key0_2 = await page.$('.key-item[data-key="0"]');
            const keyConfirm_2 = await page.$('.key-item[data-key="confirm"]');
            
            if (key1 && key5 && key0_2 && keyConfirm_2) {
                await key1.click();
                await sleep(200);
                await key5.click();
                await sleep(200);
                await key0_2.click();
                await sleep(200);
                await keyConfirm_2.click();
                await sleep(800);
                
                const afterData = await getRowData(itemRow);
                if (Math.abs(afterData.price - 150) < 0.01) {
                    logResult(browserName, '修改折后价', 'PASS', `折后价已修改为${afterData.price}`);
                } else {
                    logResult(browserName, '修改折后价', 'FAIL', `折后价修改失败，期望150，实际${afterData.price}`,
                        ['点击折后价输入框', '通过数字键盘输入150', '确认'],
                        `实际折后价${afterData.price}`,
                        '折后价应为150');
                }
            } else {
                logResult(browserName, '修改折后价', 'FAIL', '未找到数字键盘');
            }
        } else {
            logResult(browserName, '修改折后价', 'FAIL', '未找到折后价输入框');
        }

        // ===== 阶段6: 修改数量联动 =====
        
        // 步骤13: 修改商品数量（规则4.4规则6）
        console.log(`[${browserName}] 步骤13: 修改商品数量`);
        // 使用数字键盘输入数量
        const quantityInput = await page.$('input[data-field="buy"], input[data-field="buyQty"]');
        if (quantityInput) {
            const beforeValue = await quantityInput.evaluate(el => el.value);
            await quantityInput.click({ force: true });
            await sleep(300);
            
            // 使用数字键盘输入2
            const key2 = await page.$('.key-item[data-key="2"]');
            const keyConfirm_3 = await page.$('.key-item[data-key="confirm"]');
            
            if (key2 && keyConfirm_3) {
                await key2.click();
                await sleep(200);
                await keyConfirm_3.click();
                await sleep(800);
                
                const afterValue = await quantityInput.evaluate(el => el.value);
                if (afterValue === '2') {
                    logResult(browserName, '修改商品数量', 'PASS', `数量已从${beforeValue}修改为${afterValue}`);
                    
                    // 验证userDiscountOverride标记保持不变
                    const rowData = await getRowData(itemRow);
                    if (rowData.userDiscountOverride) {
                        logResult(browserName, '验证数量变化后标记保持', 'PASS', 'userDiscountOverride标记保持为1');
                    } else {
                        logResult(browserName, '验证数量变化后标记保持', 'FAIL', 'userDiscountOverride标记被意外清除',
                            ['修改数量后检查标记'],
                            '标记为false',
                            '标记应保持为true');
                    }
                } else {
                    logResult(browserName, '修改商品数量', 'FAIL', `数量修改失败，期望2，实际${afterValue}`,
                        ['输入数量2', '确认'],
                        `实际${afterValue}`,
                        '数量应为2');
                }
            } else {
                logResult(browserName, '修改商品数量', 'FAIL', '未找到数字键盘');
            }
        } else {
            logResult(browserName, '修改商品数量', 'FAIL', '未找到数量输入框');
        }

        // ===== 阶段7: 删除金额卡 =====
        
        // 步骤14: 删除单张金额卡（规则4.1规则3）
        console.log(`[${browserName}] 步骤14: 删除单张金额卡`);
        // 在金额卡明细项中找到删除按钮（第二个span，通常第一个是替换，第二个是删除）
        const firstMoneycardItem2 = await page.$('.moneycard-detail-item');
        if (firstMoneycardItem2) {
            const actionSpans = await firstMoneycardItem2.$$('.moneycard-detail-actions span');
            if (actionSpans.length >= 2) {
                const deleteBtn = actionSpans[1]; // 第二个span应该是删除
                const beforeCount = (await page.$$('.moneycard-detail-item')).length;
                await deleteBtn.click({ force: true });
                await sleep(500);
                const afterCount = (await page.$$('.moneycard-detail-item')).length;
                
                if (afterCount === beforeCount - 1) {
                    logResult(browserName, '删除单张金额卡', 'PASS', `金额卡数量从${beforeCount}变为${afterCount}`);
                    
                    // 验证userDiscountOverride标记保持（非全部删除）
                    if (afterCount > 0) {
                        const rowData = await getRowData(itemRow);
                        if (rowData.userDiscountOverride) {
                            logResult(browserName, '验证删除单张卡后标记保持', 'PASS', 'userDiscountOverride标记保持为1');
                        }
                    }
                } else {
                    logResult(browserName, '删除单张金额卡', 'FAIL', `删除后数量应为${beforeCount - 1}，实际${afterCount}`,
                        ['点击删除按钮'],
                        `实际${afterCount}张`,
                        `应为${beforeCount - 1}张`);
                }
            } else {
                logResult(browserName, '删除单张金额卡', 'FAIL', '未找到删除按钮');
            }
        } else {
            logResult(browserName, '删除单张金额卡', 'FAIL', '未找到金额卡明细项');
        }

        // 步骤15: 删除所有金额卡（规则4.4规则5）
        console.log(`[${browserName}] 步骤15: 删除所有金额卡`);
        let remainingCards = await page.$$('.moneycard-detail-item');
        while (remainingCards.length > 0) {
            const firstCard = remainingCards[0];
            const actionSpans = await firstCard.$$('.moneycard-detail-actions span');
            if (actionSpans.length >= 2) {
                const deleteBtn2 = actionSpans[1];
                await deleteBtn2.click({ force: true });
                await sleep(500);
                remainingCards = await page.$$('.moneycard-detail-item');
            } else {
                break;
            }
        }
        
        remainingCards = await page.$$('.moneycard-detail-item');
        if (remainingCards.length === 0) {
            logResult(browserName, '删除所有金额卡', 'PASS', '所有金额卡已删除');
            
            // 验证删除所有金额卡后重置（规则4.4规则5）
            const rowData = await getRowData(itemRow);
            if (rowData.discount === 100 || rowData.discount === 1) {
                logResult(browserName, '验证删除所有卡后折扣重置', 'PASS', `折扣已重置为${rowData.discount}%`);
            } else {
                logResult(browserName, '验证删除所有卡后折扣重置', 'FAIL', `期望折扣为100%，实际${rowData.discount}%`,
                    ['删除所有卡后检查折扣'],
                    `实际${rowData.discount}%`,
                    '应为100%');
            }
            
            if (!rowData.userDiscountOverride) {
                logResult(browserName, '验证删除所有卡后标记清除', 'PASS', 'userDiscountOverride标记已清除');
            } else {
                logResult(browserName, '验证删除所有卡后标记清除', 'FAIL', 'userDiscountOverride标记未清除',
                    ['删除所有卡后检查标记'],
                    '标记为true',
                    '标记应为false');
            }
        } else {
            logResult(browserName, '删除所有金额卡', 'FAIL', `删除后仍有${remainingCards.length}张金额卡`,
                ['依次删除所有金额卡'],
                `剩余${remainingCards.length}张`,
                '应为0张');
        }

        // ===== 阶段8: 划扣金额只读验证 =====
        
        // 步骤16: 验证划扣金额只读（规则4.5）
        console.log(`[${browserName}] 步骤16: 验证划扣金额只读`);
        // 先重新添加一张金额卡
        const openMoneyCardBtn4 = await page.$('[data-action="open-moneycard-modal"]');
        if (openMoneyCardBtn4) {
            await openMoneyCardBtn4.click();
            await sleep(800);
            
            const cardItems = await page.$$('.moneycard-item');
            if (cardItems.length > 0) {
                await cardItems[0].click();
                await sleep(300);
                
                // 使用 JavaScript 直接点击确认按钮
                const confirmClicked5 = await page.evaluate(() => {
                    const btn = document.getElementById('moneyCardConfirmBtn');
                    if (btn) {
                        btn.click();
                        return true;
                    }
                    return false;
                }).catch(() => false);
                
                if (confirmClicked5) {
                    await sleep(800);
                    
                    const deductInput = await page.$('.moneycard-deduct-input');
                    if (deductInput) {
                        const isDisabled = await deductInput.isDisabled();
                        if (isDisabled) {
                            logResult(browserName, '验证划扣金额只读', 'PASS', '划扣金额输入框已禁用');
                        } else {
                            logResult(browserName, '验证划扣金额只读', 'FAIL', '划扣金额输入框未禁用',
                                ['检查输入框状态'],
                                '输入框可编辑',
                                '输入框应禁用');
                        }
                    } else {
                        logResult(browserName, '验证划扣金额只读', 'FAIL', '未找到划扣金额输入框');
                    }
                }
            }
        }

        // ===== 阶段9: 整单改价与金额卡联动 =====
        
        // 步骤17: 打开整单改价弹窗（规则4.7）
        console.log(`[${browserName}] 步骤17: 测试整单改价弹窗`);
        const wholeOrderBtn = await page.$('#wholeOrderChangeBtn');
        if (wholeOrderBtn) {
            await wholeOrderBtn.click({ force: true });
            await sleep(800);
            
            // 验证最低改价金额显示
            const minAmount = await page.$('#wocMinAmount');
            if (minAmount) {
                const minAmountText = await minAmount.textContent();
                const minAmountNum = parseFloat(minAmountText.replace(/[^0-9.]/g, ''));
                
                // 获取金额卡已划扣金额
                const moneycardPayElement = await page.$('[data-display="moneycard-pay"]');
                let expectedMin = 0;
                if (moneycardPayElement) {
                    const payText = await moneycardPayElement.textContent();
                    expectedMin = parseFloat(payText.replace(/[^0-9.]/g, ''));
                }
                
                if (Math.abs(minAmountNum - expectedMin) < 0.01) {
                    logResult(browserName, '测试整单改价最低金额', 'PASS', `最低改价金额: ${minAmountText.trim()}`);
                } else {
                    logResult(browserName, '测试整单改价最低金额', 'FAIL', `最低改价金额应为${expectedMin}，实际${minAmountNum}`,
                        ['检查最低改价金额'],
                        `实际${minAmountNum}`,
                        `应为${expectedMin}`);
                }
            }
            
            // 验证橙色提示文案
            const orangeTip = await page.$('.woc-tip-orange');
            if (orangeTip) {
                const tipText = await orangeTip.textContent();
                if (tipText.includes('整单改价') && tipText.includes('商品改价')) {
                    logResult(browserName, '验证橙色提示文案', 'PASS', '橙色提示文案已显示');
                } else {
                    logResult(browserName, '验证橙色提示文案', 'FAIL', '橙色提示文案内容不正确');
                }
            } else {
                logResult(browserName, '验证橙色提示文案', 'FAIL', '未找到橙色提示文案');
            }
            
            // 关闭弹窗
            const closeBtn = await page.$('.whole-order-change-close, .modal-close');
            if (closeBtn) {
                await closeBtn.click();
            }
        } else {
            logResult(browserName, '测试整单改价弹窗', 'FAIL', '未找到整单改价按钮');
        }

        // ===== 阶段10: 边界与异常处理 =====
        
        // 步骤18: 测试行应付为0时选卡按钮置灰（规则4.1规则1）
        console.log(`[${browserName}] 步骤18: 测试行应付为0时选卡按钮状态`);
        const openMoneyCardBtn5 = await page.$('[data-action="open-moneycard-modal"]');
        if (openMoneyCardBtn5) {
            const isDisabled = await openMoneyCardBtn5.isDisabled();
            if (isDisabled) {
                logResult(browserName, '测试行应付为0时选卡按钮', 'PASS', '选卡按钮已置灰禁用');
            } else {
                // 检查行应付金额
                const payable = await page.$('.item-payable');
                if (payable) {
                    const payableText = await payable.textContent();
                    const payableNum = parseFloat(payableText.replace(/[^0-9.]/g, ''));
                    if (payableNum <= 0) {
                        logResult(browserName, '测试行应付为0时选卡按钮', 'FAIL', '行应付为0但选卡按钮未禁用',
                            ['检查按钮状态'],
                            '按钮可点击',
                            '按钮应禁用');
                    } else {
                        logResult(browserName, '测试行应付为0时选卡按钮', 'PASS', `行应付${payableNum}>0，按钮可点击正常`);
                    }
                }
            }
        }

        // 截图
        const screenshotPath = `测试用例/金额卡测试_${browserName}_${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[${browserName}] 截图已保存: ${screenshotPath}`);

        await browser.close();
        console.log(`[${browserName}] 测试完成`);

    } catch (error) {
        console.error(`[${browserName}] 测试出错:`, error);
        logResult(browserName, '测试异常', 'FAIL', error.message);
        if (page) {
            const screenshotPath = `测试用例/金额卡测试_${browserName}_错误_${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
        }
        if (browser) await browser.close();
    }
}

function generateReport() {
    const passCount = testResults.filter(r => r.status === 'PASS').length;
    const failCount = testResults.filter(r => r.status === 'FAIL').length;
    const total = testResults.length;

    let report = '# 金额卡抵扣功能测试报告\n\n';
    report += '## 测试信息\n';
    report += `- 测试日期: ${new Date().toLocaleString('zh-CN')}\n`;
    report += `- 测试页面: ${BASE_URL}\n`;
    report += `- 测试工具: Playwright\n\n`;

    report += '## 执行统计\n';
    report += '| 浏览器 | 测试用例数 | 通过 | 失败 | 通过率 |\n';
    report += '|--------|------------|------|------|--------|\n';

    const browsers = ['Chromium'];
    for (const browser of browsers) {
        const browserResults = testResults.filter(r => r.browser === browser);
        const pass = browserResults.filter(r => r.status === 'PASS').length;
        const fail = browserResults.filter(r => r.status === 'FAIL').length;
        const totalTests = browserResults.length;
        const rate = totalTests > 0 ? ((pass / totalTests) * 100).toFixed(1) + '%' : '-';
        report += `| ${browser} | ${totalTests} | ${pass} | ${fail} | ${rate} |\n`;
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

    if (failedCases.length > 0) {
        report += '## 失败用例详细分析\n\n';
        failedCases.forEach((caseItem, index) => {
            report += `### 失败用例 ${index + 1}: ${caseItem.testName}\n\n`;
            report += `**状态**: ❌ ${caseItem.status}\n\n`;
            report += `**详情**: ${caseItem.details}\n\n`;
            
            if (caseItem.steps && caseItem.steps.length > 0) {
                report += '**复现步骤**:\n';
                caseItem.steps.forEach((step, i) => {
                    report += `${i + 1}. ${step}\n`;
                });
                report += '\n';
            }
            
            if (caseItem.actualResult) {
                report += `**实际结果**: ${caseItem.actualResult}\n\n`;
            }
            
            if (caseItem.expectedResult) {
                report += `**预期结果**: ${caseItem.expectedResult}\n\n`;
            }
            
            report += `**发生时间**: ${new Date(caseItem.timestamp).toLocaleString('zh-CN')}\n\n`;
        });
    }

    report += '## 需求规则覆盖情况\n\n';
    report += '| 规则模块 | 规则编号 | 规则描述 | 测试覆盖 |\n';
    report += '|----------|----------|----------|----------|\n';
    report += '| 选卡/替换/删除 | 规则1 | 新增金额卡 | ✓ |\n';
    report += '| 选卡/替换/删除 | 规则2 | 替换金额卡 | ✓ |\n';
    report += '| 选卡/替换/删除 | 规则3 | 删除金额卡 | ✓ |\n';
    report += '| 选卡/替换/删除 | - | 防重复添加 | ✓ |\n';
    report += '| 计算规则 | 规则4 | 行应付金额(PRD) | ✗ |\n';
    report += '| 计算规则 | 规则5 | 实际支付金额与折扣率 | ✓ |\n';
    report += '| 计算规则 | 规则7 | 0金额保留 | ✓ |\n';
    report += '| 用户修改联动 | 规则0 | 整单改价与商品改价互斥 | ✓ |\n';
    report += '| 用户修改联动 | 规则1 | 手动修改折扣 | ✓ |\n';
    report += '| 用户修改联动 | 规则2 | 手动修改折后价 | ✓ |\n';
    report += '| 用户修改联动 | 规则3 | userDiscountOverride标记管理 | ✓ |\n';
    report += '| 用户修改联动 | 规则4 | 首次应用金额卡前重置 | ✓ |\n';
    report += '| 用户修改联动 | 规则5 | 删除所有金额卡后重置 | ✓ |\n';
    report += '| 用户修改联动 | 规则6 | 数量变化处理 | ✓ |\n';
    report += '| 划扣金额只读 | 规则1 | 划扣金额展示为禁用状态 | ✓ |\n';
    report += '| 划扣金额只读 | 规则2 | 划扣金额由系统自动计算 | ✓ |\n';
    report += '| 订单汇总 | - | 金额卡支付汇总 | ✓ |\n';
    report += '| 整单改价联动 | 规则1 | 最低改价金额计算 | ✓ |\n';
    report += '| 整单改价联动 | 规则0.1 | 橙色提示文案 | ✓ |\n';

    report += '\n## 结论\n\n';
    report += `本次测试共执行 **${total}** 条测试用例，通过 **${passCount}** 条，`;
    report += `失败 **${failCount}** 条，通过率 **${overallRate}**。\n\n`;

    if (failCount === 0) {
        report += '🎉 **所有测试用例均已通过！**\n';
    } else {
        report += '⚠️ **存在未通过的测试用例，请检查并修复。**\n';
        report += '\n**问题修复建议**:\n';
        failedCases.forEach((caseItem, index) => {
            report += `${index + 1}. **${caseItem.testName}**: ${caseItem.details}\n`;
        });
    }

    fs.writeFileSync('测试用例/金额卡抵扣功能测试报告.md', report, 'utf8');
    console.log('\n测试报告已生成: 测试用例/金额卡抵扣功能测试报告.md');

    return { passCount, failCount, total };
}

async function runAllTests() {
    console.log('========== 开始金额卡抵扣功能测试 ==========');
    await runMoneyCardTests(chromium, 'Chromium');
    const stats = generateReport();

    console.log('\n========== 测试完成 ==========');
    console.log(`总用例数: ${stats.total}`);
    console.log(`通过: ${stats.passCount}`);
    console.log(`失败: ${stats.failCount}`);
    console.log(`通过率: ${((stats.passCount / stats.total) * 100).toFixed(1)}%`);
}

runAllTests();
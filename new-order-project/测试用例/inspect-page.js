const { chromium } = require('playwright');

async function inspectPage() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:8000/create-order-pad.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // 获取页面上所有按钮
    const buttons = await page.$$eval('button', (btns) => {
        return btns.map(btn => ({
            text: btn.textContent,
            className: btn.className,
            attributes: Array.from(btn.attributes).map(a => `${a.name}="${a.value}"`)
        }));
    });

    console.log('=== 页面上的所有按钮 ===');
    buttons.forEach((btn, index) => {
        console.log(`\n按钮 ${index + 1}:`);
        console.log(`  文本: "${btn.text}"`);
        console.log(`  类名: ${btn.className}`);
        console.log(`  属性: ${btn.attributes.join(', ')}`);
    });

    // 获取页面上所有可点击元素
    const clickableElements = await page.$$eval('[onclick], [data-action], .btn, .button', (els) => {
        return els.map(el => ({
            tagName: el.tagName,
            text: el.textContent?.substring(0, 50),
            className: el.className,
            dataAction: el.getAttribute('data-action'),
            onClick: el.getAttribute('onclick')?.substring(0, 50)
        }));
    });

    console.log('\n=== 可点击元素 ===');
    clickableElements.forEach((el, index) => {
        console.log(`\n元素 ${index + 1}:`);
        console.log(`  标签: ${el.tagName}`);
        console.log(`  文本: "${el.text}"`);
        console.log(`  类名: ${el.className}`);
        console.log(`  data-action: ${el.dataAction}`);
        console.log(`  onclick: ${el.onClick}`);
    });

    await browser.close();
}

inspectPage();
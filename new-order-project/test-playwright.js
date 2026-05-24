const { chromium } = require('playwright');

(async () => {
  console.log('正在启动浏览器...');
  const browser = await chromium.launch({ headless: true });
  console.log('浏览器启动成功！');

  const page = await browser.newPage();
  console.log('正在打开页面...');

  await page.goto('http://localhost:8000/create-order-pad.html');
  console.log('页面加载成功！');

  const title = await page.title();
  console.log('页面标题:', title);

  await browser.close();
  console.log('测试完成！');
})();
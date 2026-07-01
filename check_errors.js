const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('https://asel-butik.netlify.app', { waitUntil: 'networkidle' });

    console.log('Page loaded.');
    await browser.close();
})();

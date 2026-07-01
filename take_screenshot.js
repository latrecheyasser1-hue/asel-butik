const { chromium } = require('playwright');
const path = require('path');

(async () => {
    // We launch Electron via playwright.
    // However, playwright._electron is the correct way, but I used `chromium` in test_playwright.js and it failed.
    const { _electron: electron } = require('playwright');
    
    const app = await electron.launch({ args: ['.'] });
    const page = await app.firstWindow();
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshot.png' });
    console.log("Screenshot taken.");
    await app.close();
})();

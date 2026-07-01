const { _electron: electron } = require('playwright');

(async () => {
    const app = await electron.launch({ args: ['.'] });
    const page = await app.firstWindow();
    
    await page.waitForTimeout(4000);
    
    console.log("URL is:", page.url());
    console.log("Title is:", await page.title());
    
    await app.close();
})();

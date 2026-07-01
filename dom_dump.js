const { _electron: electron } = require('playwright');

(async () => {
    const app = await electron.launch({ args: ['.'] });
    const page = await app.firstWindow();
    
    // Wait for the app to initialize
    await page.waitForTimeout(4000);
    
    // Dump the body innerHTML to see what's actually rendered
    const html = await page.evaluate(() => document.body.innerHTML);
    const fs = require('fs');
    fs.writeFileSync('dom_dump.html', html);
    
    console.log("DOM dumped.");
    await app.close();
})();

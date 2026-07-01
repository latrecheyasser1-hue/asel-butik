const { _electron: electron } = require('playwright');

(async () => {
    const app = await electron.launch({ args: ['.'] });
    await app.waitForEvent('window'); // wait for any window to open
    
    // give it some time
    await new Promise(r => setTimeout(r, 4000));
    
    const windows = app.windows();
    console.log(`Found ${windows.length} windows`);
    
    for (let i = 0; i < windows.length; i++) {
        const page = windows[i];
        console.log(`Window ${i} URL: ${page.url()}`);
        console.log(`Window ${i} Title: ${await page.title()}`);
        
        // if it's the main app window, log the console
        if (page.url().includes('index.html')) {
            const html = await page.evaluate(() => document.body.innerHTML);
            const fs = require('fs');
            fs.writeFileSync(`dom_dump_${i}.html`, html);
            
            // get screenshot
            await page.screenshot({ path: `screenshot_${i}.png` });
            
            const logs = await page.evaluate(() => {
                return window.__logs || []; // assuming we didn't inject this, let's just dump innerText of body
            });
        }
    }
    
    await app.close();
})();

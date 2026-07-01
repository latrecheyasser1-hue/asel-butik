const { _electron: electron } = require('playwright');
const fs = require('fs');

(async () => {
  const logStream = fs.createWriteStream('browser_console.log');
  const app = await electron.launch({ args: ['.'] });
  const page = await app.firstWindow();
  
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}\n`;
    console.log(text);
    logStream.write(text);
  });
  
  page.on('pageerror', error => {
    const text = `[PAGE ERROR] ${error.message}\n`;
    console.log(text);
    logStream.write(text);
  });

  await page.waitForTimeout(5000);
  await app.close();
  logStream.end();
})();

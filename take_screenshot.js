const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new"
  });
  
  const page = await browser.newPage();
  
  // Set the exact viewport matching the banner width/height
  await page.setViewport({
    width: 3456,
    height: 2500,
    deviceScaleFactor: 1, // Change to 2 for even higher resolution if needed
  });
  
  const filePath = `file:///${path.join(__dirname, 'banner.html').replace(/\\/g, '/')}`;
  console.log(`Loading ${filePath}`);
  
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  // Give it a second to render icons and fonts
  await new Promise(r => setTimeout(r, 2000));
  
  const outputPath = path.join(__dirname, 'ClearView_Banner_Final.png');
  await page.screenshot({ path: outputPath });
  
  console.log(`Screenshot saved to ${outputPath}`);
  
  await browser.close();
})();

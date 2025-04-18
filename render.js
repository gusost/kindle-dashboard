const puppeteer = require('puppeteer')

async function render() {
  const browser = await puppeteer.launch({
    headless: true,
    
    defaultViewport: {
      width: 758,
      height: 1024
    }
  })

  const page = await browser.newPage()
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`))
  page.on('pageerror', err => console.error(`[Page Error] ${err}`))

  await page.goto('http://localhost:4000/index.html', {
    waitUntil: 'networkidle0'
  })

  // Wait for weather-ready event inside the page
  //await page.waitForSelector('.weather-icon', { visible: true })

  await page.screenshot({
    path: 'schedule-gray.png',
    type: 'png',
    fullPage: false
  })

  await browser.close()
}

render().catch(err => {
  console.error('❌ Render failed:', err)
  process.exit(1)
})
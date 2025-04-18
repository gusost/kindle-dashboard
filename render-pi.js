const puppeteer = require('puppeteer-core')
const axios = require('axios')

async function render() {
  console.log('Fetching WebSocket endpoint...')
  const { data } = await axios.get('http://127.0.0.1:9222/json/version')
  const browserWSEndpoint = data.webSocketDebuggerUrl

  console.log('Connecting to Chromium...')
  const browser = await puppeteer.connect({ 
    browserWSEndpoint,
    defaultViewport: {
      width: 758,
      height: 1024
    }
  })
  console.log('Connected')

  const page = await browser.newPage()
  page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`))
  page.on('pageerror', err => console.error(`[Page Error] ${err}`))

  console.log('Loading page...')
  await page.goto('http://localhost:4000/index.html', {
    waitUntil: 'networkidle0'
  })

  // Wait for weather-ready event inside the page
  //await page.waitForSelector('.weather-icon', { visible: true })

  console.log('Taking screenshot...')
  await page.screenshot({
    path: require('os').homedir() + '/schedule-gray.png',
    type: 'png',
    fullPage: false
  })

  console.log('✅ Done')
  await browser.disconnect()
}

render().catch(err => {
  console.error('❌ Render failed:', err)
  process.exit(1)
})

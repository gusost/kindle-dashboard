const puppeteer = require('puppeteer-core')
const axios = require('axios')

/* A chromium browser needs to be running on the pi.

gusost@DietPi:~/Dropbox/04 Home automation/kindle-dashboard $ cd
gusost@DietPi:~ $ /usr/bin/chromium-browser \
>   --headless \
>   --disable-gpu \
>   --no-sandbox \
>   --remote-debugging-port=9222 \
>   --user-data-dir=/tmp/manual-chrome \
>   about:blank
dpkg-query: inga paket hittades som matchar bluealsa

DevTools listening on ws://127.0.0.1:9222/devtools/browser/b4388c5e-faac-48d9-a4eb-afee8a528103
[0414/032437.717834:ERROR:gpu_init.cc(441)] Passthrough is not supported, GL is swiftshader

*/

async function render() {
  console.log('Fetching WebSocket endpoint...')
  try {
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

    // Wait for weather and calendar to be rendered
    await page.waitForSelector('.weather-row', { visible: true })
    await page.waitForSelector('.forecast-row', { visible: true })
    await page.waitForSelector('.calendar-block', { visible: true })

    console.log('Taking screenshot...')
    await page.screenshot({
      path: require('os').homedir() + '/schedule-gray.png',
      type: 'png',
      fullPage: false
    })

    console.log('Closing page...')
    await page.close()

    console.log('✅ Done')
    await browser.disconnect()
  } catch (error) {
    console.error('Failed to connect to Chromium:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure Chromium is running with remote debugging enabled on port 9222')
    }
    throw error
  }
}

render().catch(err => {
  console.error('❌ Render failed:', err)
  process.exit(1)
})

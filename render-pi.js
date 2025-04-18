const puppeteer = require('puppeteer-core')
const axios = require('axios')

async function run() {
  console.log('Fetching WebSocket endpoint...')
  const { data } = await axios.get('http://127.0.0.1:9222/json/version')
  const browserWSEndpoint = data.webSocketDebuggerUrl

  console.log('Connecting to Chromium...')
  const browser = await puppeteer.connect({ browserWSEndpoint })
  console.log('Connected')

  const pages = await browser.pages()
  const page = pages[0]

  console.log('Rendering...')
  await page.setContent('<html><body><h1>Hello</h1></body></html>')
  await page.screenshot({ path: require('os').homedir() + '/hello2.png' })

  console.log('✅ Done')
  await browser.disconnect()
}

run().catch(err => {
  console.error('❌ Failed:', err)
  process.exit(1)
})

/* const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer-core')

const tmpBase = `${os.homedir()}/tmp-chrome`

async function render() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser', // or '/usr/bin/chromium'
    headless: 'old',
    dumpio: true,
    args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu'
    ]
  })
  console.log('Opening new page...')
  //const page = await browser.newPage()
  console.log('Getting default pages...')
  const pages = await browser.pages()
  const page = pages[0]

  console.log('Setting viewport...')
  await page.setViewport({ width: 758, height: 1024 })

  //const filePath = `file://${__dirname}/index.html`
  await page.goto('https://example.com', { waitUntil: 'networkidle0' })
  console.log(`Navigating to ${filePath}...`)
  await page.goto(filePath, { waitUntil: 'networkidle0' })

  //const outPath = path.join(__dirname, 'schedule-gray.png')
  const outPath = path.join(os.homedir(), 'schedule-gray.png')
  console.log(`Saving screenshot to ${outPath}...`)
  await page.screenshot({ path: outPath })

  console.log('Closing browser...')
  await browser.close()

  console.log('✅ Done')
}

render().catch(err => {
  console.error('❌ Render failed:', err)
  process.exit(1)
}) */
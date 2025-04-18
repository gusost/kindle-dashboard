const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')

const CREDENTIALS_PATH = path.join(__dirname, 'client_secret_783324530652-psgiulir4cdlp0i2gqsinq492d2e2u1p.apps.googleusercontent.com.json')
const TOKEN_PATH = path.join(__dirname, 'token.json')

// Load credentials and authorize
async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH))
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)))
    return oAuth2Client
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly']
  })
  console.log('Authorize this app by visiting this url:\n', authUrl)
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => {
    readline.question('\nPaste the code from the page: ', code => {
      readline.close()
      oAuth2Client.getToken(code, (err, token) => {
        if (err) throw err
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))
        oAuth2Client.setCredentials(token)
        resolve(oAuth2Client)
      })
    })
  })
}

// Fetch events
async function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime'
  })
  console.log(calendar.events)
  return  res.data.items || []
}

// Main
async function fetchCalendarEvents() {
  const auth = await authorize()
  const events = await listEvents(auth)
  fs.writeFileSync(path.join(__dirname, 'calendar.json'), JSON.stringify(events, null, 2))
  console.log(`Saved ${events.length} events to calendar.json`)
}

fetchCalendarEvents()
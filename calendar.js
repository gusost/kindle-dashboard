const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')
const axios = require('axios')
const ical = require('node-ical')

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

// Get all calendars
async function getAllCalendars(auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarList = await calendar.calendarList.list()
  return calendarList.data.items
}

// Fetch and parse VCALENDAR
async function getOnCallEvents() {
  const response = await axios.get('https://rootly.com/account/shifts/ical/eyJfcmFpbHMiOnsiZGF0YSI6NTg2NywicHVyIjoibWVtYmVyc2hpcC9pY2FsIn19--cea7a5a4dd3a2b1da590b67ed1daf76fe3443846dcc3f746b5106c053f72d12d?user_ids=5785')
  const events = await ical.parseICS(response.data)
  
  return Object.values(events)
    .filter(event => event.type === 'VEVENT')
    .map(event => ({
      summary: 'On-Call',
      start: {
        dateTime: event.start.toISOString()
      },
      end: {
        dateTime: event.end.toISOString()
      },
      calendarName: 'On-Call Schedule'
    }))
}

// Fetch events from all calendars
async function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth })
  const calendars = await getAllCalendars(auth)
  
  const allEvents = []
  for (const cal of calendars) {
    const res = await calendar.events.list({
      calendarId: cal.id,
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    const events = res.data.items || []
    events.forEach(event => {
      event.calendarName = cal.summary
    })
    
    allEvents.push(...events)
  }
  
  // Add on-call events
  const onCallEvents = await getOnCallEvents()
  allEvents.push(...onCallEvents)
  
  return allEvents.sort((a, b) => {
    const aTime = a.start.dateTime || a.start.date
    const bTime = b.start.dateTime || b.start.date
    return new Date(aTime) - new Date(bTime)
  })
}

// Main
async function fetchCalendarEvents() {
  const auth = await authorize()
  const events = await listEvents(auth)
  fs.writeFileSync(path.join(__dirname, 'dashboard/src/data/calendar.json'), JSON.stringify(events, null, 2))
  console.log(`Saved ${events.length} events to calendar.json`)
}

fetchCalendarEvents()
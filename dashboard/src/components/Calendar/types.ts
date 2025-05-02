export interface CalendarEvent {
  calendarName: string
  kind: string
  etag: string
  id: string
  status: string
  htmlLink: string
  created: Date
  updated: Date
  summary: string
  creator: {
    email: string
    self: boolean
  }
  organizer: {
    email: string
    self: boolean
  }
  start: {
    dateTime?: Date
    date?: string
    timeZone: string
  }
  end: {
    dateTime?: Date
    date?: string
    timeZone: string
  }
  recurringEventId?: string
  originalStartTime?: {
    dateTime: Date
    timeZone: string
  }
  transparency?: string
  iCalUID: string
  sequence: number
  reminders?: {
    useDefault: boolean
    overrides: Array<{
      method: string
      minutes: number
    }>
  }
  eventType: string
}

export interface DayEvents {
  date: Date
  dateString: string
  events: CalendarEvent[]
}

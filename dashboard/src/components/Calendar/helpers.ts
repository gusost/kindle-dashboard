import { CalendarEvent, DayEvents } from './types'

/**
 * Parses raw calendar event data into a properly typed CalendarEvent object
 * @param rawEvent - Raw calendar event data
 * @returns A properly typed CalendarEvent object
 */
export const parseCalendarEvent = (rawEvent: any): CalendarEvent => {
  return {
    ...rawEvent,
    created: new Date(rawEvent.created),
    updated: new Date(rawEvent.updated),
    start: {
      dateTime: rawEvent.start.dateTime ? new Date(rawEvent.start.dateTime) : undefined,
      date: rawEvent.start.date,
      timeZone: rawEvent.start.timeZone || 'Europe/Stockholm'
    },
    end: {
      dateTime: rawEvent.end.dateTime ? new Date(rawEvent.end.dateTime) : undefined,
      date: rawEvent.end.date,
      timeZone: rawEvent.end.timeZone || 'Europe/Stockholm'
    },
    originalStartTime:
      rawEvent.originalStartTime && rawEvent.originalStartTime.dateTime
        ? {
            dateTime: new Date(rawEvent.originalStartTime.dateTime),
            timeZone: rawEvent.originalStartTime.timeZone || 'Europe/Stockholm'
          }
        : undefined,
    reminders: rawEvent.reminders
      ? {
          useDefault: rawEvent.reminders.useDefault,
          overrides: rawEvent.reminders.overrides || []
        }
      : undefined,
    transparency: rawEvent.transparency || 'opaque'
  }
}
/**
 * Formats a date into a time string in the format "HH:mm"
 * @param date - The date to format
 * @returns A string representing the time in 24-hour format
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Formats a date into a day string in the format "dddd" (full day name)
 * @param date - The date to format
 * @returns A string representing the full day name
 */
export const formatDay = (date: Date): string => {
  let weekday = date.toLocaleDateString('sv-SE', { weekday: 'short' })
  const day = date.toLocaleDateString('sv-SE', { day: '2-digit' })
  let month = date.toLocaleDateString('sv-SE', { month: 'short' })
  // first uppercase
  weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  month = month.charAt(0).toUpperCase() + month.slice(1)
  return `${weekday}, ${day} ${month}`
}

/**
 * Groups an array of calendar events by their start date
 * @param events - Array of calendar events to group
 * @returns An object where keys are dates and values are arrays of events for that date
 */
export const groupEventsByDate = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
  return events.reduce(
    (acc, event) => {
      const dateStr = event.start.dateTime
        ? new Date(event.start.dateTime).toISOString().split('T')[0]
        : event.start.date || ''

      if (dateStr) {
        if (!acc[dateStr]) {
          acc[dateStr] = []
        }
        acc[dateStr].push(event)
      }
      return acc
    },
    {} as Record<string, CalendarEvent[]>
  )
}

/**
 * Sorts an array of calendar events by their start time
 * @param events - Array of calendar events to sort
 * @returns A new array of events sorted by start time
 */
export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    const timeA = a.start.dateTime ? new Date(a.start.dateTime).getTime() : 0
    const timeB = b.start.dateTime ? new Date(b.start.dateTime).getTime() : 0
    return timeA - timeB
  })
}

/**
 * Gets the date from a calendar event, handling both dateTime and date formats
 * @param event - The calendar event to get the date from
 * @returns A Date object representing the event's start time
 */
export const getEventDate = (event: CalendarEvent): Date => {
  if (event.start.dateTime) return new Date(event.start.dateTime)
  if (event.start.date) return new Date(event.start.date)
  return new Date('')
}

/**
 * Formats a date into a structured object containing the full date and weekday
 * @param date - The date to format
 * @returns An object containing the formatted date and weekday
 */
export const formatDate = (date: Date): { date: Date; dateString: string } => {
  return {
    date,
    dateString: date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
  }
}

/**
 * Processes calendar events into a grouped and formatted structure
 * @param events - Array of calendar events to process
 * @returns An array of DayEvents containing formatted events grouped by date
 */
export const processCalendarEvents = (rawEvents: any[]): DayEvents[] => {
  // Convert raw events to proper CalendarEvent objects
  const events: CalendarEvent[] = rawEvents.map(parseCalendarEvent)

  const groupedEventsMap: { [date: string]: DayEvents } = {}

  events.forEach(event => {
    if (!(event.start.dateTime || event.start.date) || !event.summary) return

    const startDate = getEventDate(event)
    const endDate = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date || '')

    // Create a date for each day in the event's duration
    let currentDate = new Date(startDate)
    while (currentDate < endDate) {
      const { date, dateString } = formatDate(currentDate)

      if (!groupedEventsMap[dateString]) {
        groupedEventsMap[dateString] = { date, dateString, events: [] }
      }

      // For multi-day events, create a full-day event for each day
      const isMultiDay = startDate.toDateString() !== endDate.toDateString()
      const dateStr = currentDate.toISOString().split('T')[0]

      if (isMultiDay) {
        // Create a full-day event for each day
        groupedEventsMap[dateString].events.push({
          ...event,
          start: {
            date: dateStr,
            timeZone: event.start.timeZone
          },
          end: {
            date: dateStr,
            timeZone: event.end.timeZone
          }
        })
      } else {
        // For single-day events, keep as is
        groupedEventsMap[dateString].events.push(event)
      }

      // Move to next day
      currentDate = new Date(currentDate.getTime() + 86400000)
    }
  })

  return Object.values(groupedEventsMap).sort(
    (a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime()
  )
}

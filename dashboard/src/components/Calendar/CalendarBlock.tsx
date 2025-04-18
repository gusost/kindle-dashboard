import React from 'react'
import './CalendarBlock.css'
import calendarData from '../../data/calendar.json'
import { CalendarDay } from './CalendarDay'

interface CalendarEvent {
  time: string
  title: string
}

interface DayEvents {
  date: string
  weekday: string
  events: CalendarEvent[]
}

const getEventDate = (event: any): Date => {
  if (event.start?.dateTime) return new Date(event.start.dateTime)
  if (event.start?.date) return new Date(event.start.date)
  return new Date('')
}

const formatTime = (event: any): string => {
  if (event.start?.dateTime) {
    const date = new Date(event.start.dateTime)
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }
  return 'Dag' // All-day event
}

const formatDate = (date: Date): { date: string; weekday: string } => {
  const weekday = date.toLocaleDateString('sv-SE', { weekday: 'long' })
  return {
    date: date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1)
  }
}

// Prepare and group events by date
const groupedEventsMap: { [date: string]: DayEvents } = {}
calendarData.forEach((event) => {
  if (!(event.start?.dateTime || event.start?.date) || !event.summary) return
  const eventDate = getEventDate(event)
  const { date, weekday } = formatDate(eventDate)
  const time = formatTime(event)
  if (!groupedEventsMap[date]) {
    groupedEventsMap[date] = { date, weekday, events: [] }
  }
  groupedEventsMap[date].events.push({ time, title: event.summary })
})
const groupedEvents: DayEvents[] = Object.values(groupedEventsMap).sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
)

export const CalendarBlock: React.FC = () => (
  <div className="calendar-block">
    {groupedEvents.map((day, idx) => (
      <CalendarDay key={idx} weekday={day.weekday} date={day.date} events={day.events} />
    ))}
  </div>
) 
import React from 'react'
import './CalendarEvent.css'
import { CalendarEvent as CalendarEventType } from './types'
import { formatTime } from './helpers'

interface CalendarEventProps {
  event: CalendarEventType
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({ event }) => {
  return event.start.dateTime ? <TimedEvent event={event} /> : <AllDayEvent event={event} />
}

const TimedEvent: React.FC<CalendarEventProps> = ({ event }) => {
  const time = event.start.dateTime ? formatTime(event.start.dateTime) : ''

  return (
    <li className="calendar-event">
      <span className="calendar-event__time">{time}</span>
      <span className="calendar-event__title">{event.summary}</span>
    </li>
  )
}

const AllDayEvent: React.FC<CalendarEventProps> = ({ event }) => (
  <li className="calendar-event calendar-event--all-day">
    <span className="calendar-event__title">{event.summary}</span>
  </li>
)

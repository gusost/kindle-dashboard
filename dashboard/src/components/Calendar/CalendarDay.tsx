import React from 'react'
import './CalendarDay.css'
import { CalendarEvent } from './CalendarEvent'
import { CalendarEvent as CalendarEventType } from './types'

interface CalendarDayProps {
  weekday: string
  date: string
  events: CalendarEventType[]
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ weekday, date, events }) => (
  <div className="calendar-day">
    <h2 className="calendar-day__title">
      {weekday}, {date}
    </h2>
    <ul className="calendar-day__list">
      {events.map((event, idx) => (
        <CalendarEvent key={idx} event={event} />
      ))}
    </ul>
  </div>
)

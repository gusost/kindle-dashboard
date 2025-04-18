import React from 'react'
import './CalendarDay.css'
import { CalendarEvent } from './CalendarEvent'

interface CalendarDayProps {
  weekday: string
  date: string
  events: Array<{
    time: string
    title: string
  }>
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ weekday, date, events }) => (
  <div className="calendar-day">
    <h2 className="calendar-day__title">
      {weekday}, {date}
    </h2>
    <ul className="calendar-day__list">
      {events.map((event, idx) => (
        <CalendarEvent key={idx} time={event.time} title={event.title} />
      ))}
    </ul>
  </div>
) 
import React from 'react'
import './CalendarEvent.css'

interface CalendarEventProps {
  time: string
  title: string
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({ time, title }) => (
  <li className="calendar-event">
    <span className="calendar-event__time">{time}</span>
    <span className="calendar-event__title">{title}</span>
  </li>
) 
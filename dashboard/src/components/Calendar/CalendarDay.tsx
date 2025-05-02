import React from 'react'
import './CalendarDay.css'
import { CalendarEvent, SingleAllDayCalendarEvent } from './CalendarEvent'
import { CalendarEvent as CalendarEventType } from './types'
import { formatDay } from './helpers'

interface CalendarDayProps {
  date: Date
  events: CalendarEventType[]
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ date, events }) => {
  if (events.length === 1 && events[0].calendarName === 'On-Call Schedule')
    return <SingleAllDayEvent date={date} events={events} />

  return (
    <div className="calendar-day">
      <h2 className="calendar-day__title">{formatDay(date)}</h2>
      <ul className="calendar-day__list">
        {events.map((event, idx) => (
          <CalendarEvent key={idx} event={event} />
        ))}
      </ul>
    </div>
  )
}

// Could possibly be just a single "event". Might resculpt later
const SingleAllDayEvent: React.FC<CalendarDayProps> = ({ date, events }) => (
  <div className="calendar-day">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h2 className="calendar-day__title">{formatDay(date)}</h2>
      <SingleAllDayCalendarEvent event={events[0]} />
    </div>
  </div>
)

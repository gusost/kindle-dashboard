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

export const SingleAllDayCalendarEvent: React.FC<CalendarEventProps> = ({ event }) => (
  <div className="calendar-event calendar-event--all-day calendar-event--single-all-day">
    <span className="calendar-event__title">{event.summary}</span>
  </div>
)
/* 
<div class="calendar-day">
  <div style="display: flex;justify-content: space-between;">
    <h2 class="calendar-day__title">Tis, 06 Maj</h2>
    <div class="calendar-event calendar-event--all-day" style="flex-grow: 1;margin-left: 11px;align-self: center;">
      <span class="calendar-event__title">Buddy</span>
    </div>
  </div>
  <ul class="calendar-day__list"></ul>
</div>
*/
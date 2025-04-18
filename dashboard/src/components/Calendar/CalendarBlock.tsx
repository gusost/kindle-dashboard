import React from 'react'
import './CalendarBlock.css'
import calendarData from '../../data/calendar.json'
import { CalendarDay } from './CalendarDay'
import { processCalendarEvents } from './helpers'

const groupedEvents = processCalendarEvents(calendarData)

export const CalendarBlock: React.FC = () => (
  <div className="calendar-block">
    {groupedEvents.map((day, idx) => (
      <CalendarDay key={idx} weekday={day.weekday} date={day.date} events={day.events} />
    ))}
  </div>
)

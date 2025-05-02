import React, { useState, useEffect } from 'react'
import './CalendarBlock.css'
import { CalendarDay } from './CalendarDay'
import { processCalendarEvents } from './helpers'
import { DayEvents } from './types'

export const CalendarBlock: React.FC = () => {
  const [groupedEvents, setGroupedEvents] = useState<DayEvents[]>([])

  useEffect(() => {
    fetch('/data/calendar.json')
      .then(response => response.json())
      .then(data => setGroupedEvents(processCalendarEvents(data)))
      .catch(error => console.error('Error fetching calendar data:', error))
  }, [])

  if (groupedEvents.length === 0) return <div>Loading...</div>

  return (
    <div className="calendar-block">
      {groupedEvents.map((day, idx) => (
        <CalendarDay key={idx} date={day.date} events={day.events} />
      ))}
    </div>
  )
}

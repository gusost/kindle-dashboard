import React from 'react'
import './App.css'
import CalendarEvents from './components/Calendar/CalendarEvents'
import WeatherRow from './components/Weather/WeatherRow'
import { ForecastRow } from './components/Weather/ForecastRow'
import { Timestamp } from './components/Timestamp'

export function App() {
  return (
    <div className="App">
      <WeatherRow />
      <ForecastRow />
      <CalendarEvents />
      <Timestamp />
    </div>
  )
}

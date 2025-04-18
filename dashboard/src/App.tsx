import './App.css'
import { CalendarBlock } from './components/Calendar/CalendarBlock'
import { WeatherRow } from './components/Weather/WeatherRow'
import { ForecastRow } from './components/Weather/ForecastRow'
import { Timestamp } from './components/Timestamp'

export function App() {
  return (
    <div className="App">
      <WeatherRow />
      <ForecastRow />
      <CalendarBlock />
      <Timestamp />
    </div>
  )
}

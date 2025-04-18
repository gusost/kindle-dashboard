import React from 'react'
import './ForecastRow.css'
import { ForecastBlock } from './ForecastBlock'
import hourlyData from '../../data/nacka-hourly.json'

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit' })
}

export const ForecastRow: React.FC = () => {
  // Get the first 8 hours of forecast data
  const forecastData = hourlyData.list.slice(0, 8)

  return (
    <div className="forecast-row">
      {forecastData.map((forecast) => (
        <ForecastBlock
          key={forecast.dt}
          time={formatTime(forecast.dt)}
          icon={forecast.weather[0].icon}
          temp={forecast.main.temp}
        />
      ))}
    </div>
  )
}

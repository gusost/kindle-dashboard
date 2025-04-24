import React, { useState, useEffect } from 'react'
import './ForecastRow.css'
import { ForecastBlock } from './ForecastBlock'
import { HourlyForecast, ForecastData } from './types'

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit' })
}

export const ForecastRow: React.FC = () => {
  const [hourlyData, setHourlyData] = useState<HourlyForecast | null>(null)

  useEffect(() => {
    fetch('/data/nacka-hourly.json')
      .then((response) => response.json())
      .then((data) => setHourlyData(data))
      .catch((error) => console.error('Error fetching forecast data:', error))
  }, [])

  if (!hourlyData) return <div>Loading...</div>

  // Get the first 8 hours of forecast data
  const forecastData = hourlyData.list.slice(0, 8)

  return (
    <div className="forecast-row">
      {forecastData.map((forecast: ForecastData) => (
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

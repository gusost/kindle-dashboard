import React, { useState, useEffect } from 'react'
import './WeatherRow.css'
import { WeatherData } from './types'

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

export const WeatherRow: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)

  useEffect(() => {
    fetch('/data/nacka-current.json')
      .then((response) => response.json())
      .then((data) => setWeatherData(data))
      .catch((error) => console.error('Error fetching weather data:', error))
  }, [])

  if (!weatherData) return <div>Loading...</div>

  const temp = Math.round(weatherData.main.temp)
  let condition = weatherData.weather[0].description
  // Capitalize the first letter of the condition
  condition = condition.charAt(0).toUpperCase().concat(condition.slice(1))
  const iconCode = weatherData.weather[0].icon
  const sunrise = formatTime(weatherData.sys.sunrise)
  const sunset = formatTime(weatherData.sys.sunset)

  return (
    <div className="weather-row">
      <div className="weather-row__sun-times weather-row__sun-times-up">
        <img src="/sun-icons/sunrise.svg" alt="Sunrise" className="weather-row__sun-icon" />
        {sunrise}
      </div>
      <div className="weather-row__group">
        <div className="weather-row__icon">
          <img src={`/weather-icons/${iconCode}.png`} alt={condition} className="weather-row__icon-img" />
        </div>
        <div className="weather-row__condition" data-long={condition.length > 17}>
          <span>{condition}</span>
        </div>
        <div className="weather-row__temperature">{temp}°C</div>
      </div>
      <div className="weather-row__sun-times weather-row__sun-times-down">
        {sunset}
        <img src="/sun-icons/sunset.svg" alt="Sunset" className="weather-row__sun-icon" />
      </div>
    </div>
  )
}

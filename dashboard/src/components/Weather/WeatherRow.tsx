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
  const condition = weatherData.weather[0].description
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
        <div className="weather-row__condition">{condition}</div>
        <div className="weather-row__temperature">{temp}°C</div>
      </div>
      <div className="weather-row__sun-times weather-row__sun-times-down">
        {sunset}
        <img src="/sun-icons/sunset.svg" alt="Sunset" className="weather-row__sun-icon" />
      </div>
    </div>
  )
}

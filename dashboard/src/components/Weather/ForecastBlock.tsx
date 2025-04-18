import React from 'react'
import './ForecastBlock.css'

interface ForecastBlockProps {
  time: string
  icon: string
  temp: number
}

export const ForecastBlock: React.FC<ForecastBlockProps> = ({ time, icon, temp }) => {
  return (
    <div className="forecast-block">
      <div className="forecast-block__time">{time}</div>
      <div className="forecast-block__icon">
        <img src={`/weather-icons/${icon}.png`} alt="Weather" className="forecast-block__icon-img" />
      </div>
      <div className="forecast-block__temp">{Math.round(temp)}°C</div>
    </div>
  )
}

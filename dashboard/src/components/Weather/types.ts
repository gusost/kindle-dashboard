export interface WeatherData {
  main: {
    temp: number
  }
  weather: Array<{
    description: string
    icon: string
  }>
  sys: {
    sunrise: number
    sunset: number
  }
}

export interface ForecastData {
  dt: number
  main: {
    temp: number
  }
  weather: Array<{
    icon: string
  }>
}

export interface HourlyForecast {
  list: ForecastData[]
} 
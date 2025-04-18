const API_KEY = '8741042b85b7fffade75a18c2b51acbb'
const CITY = 'Nacka'
const UNITS = 'metric'
const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=${UNITS}`

async function fetchWeather() {
  try {
    console.log('Fetching:', URL)
    const res = await fetch(URL)
    console.log('Parsing:', URL)
    const data = await res.json()

    const weatherEl = document.getElementById('weather')
    const iconCode = data.weather[0].icon
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`

    weatherEl.innerHTML = `
      <div class="weather-block">
        <div class="location">${data.name}</div>
        <img class="weather-icon" src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon">
        <div class="weather-info">
          <div class="temp">${Math.round(data.main.temp)}°C</div>
          <div class="desc">${data.weather[0].description}</div>
        </div>
      </div>
    `
  } catch (err) {
    console.error('Failed to fetch weather:', err)
  }
}

window.addEventListener('DOMContentLoaded', fetchWeather)
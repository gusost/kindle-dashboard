async function loadCalendar() {
  try {
    const res = await fetch('calendar.json')
    const events = await res.json()

    const calendarContainer = document.getElementById('calendar')
    if (!calendarContainer) return

    if (events.length === 0) {
      calendarContainer.textContent = 'No upcoming events.'
      return
    }

    const ul = document.createElement('ul')
    ul.className = 'calendar-list'

    const eventsByDate = {}

    events.forEach(event => {
      const date = new Date(event.start)
      const dateKey = date.toDateString()
    
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = []
      }
      eventsByDate[dateKey].push(event)
    })
    
    for (const dateKey of Object.keys(eventsByDate)) {
      const group = eventsByDate[dateKey]
    
      const dateLabel = document.createElement('div')
      dateLabel.className = 'calendar-date'
      dateLabel.textContent = new Date(group[0].start).toLocaleDateString('sv-SE', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    
      ul.appendChild(dateLabel)
    
      group.forEach(event => {
        const li = document.createElement('li')
        const date = new Date(event.start)
        const time = date.toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit'
        })
    
        li.textContent = `${time} – ${event.summary}`
        ul.appendChild(li)
      })
    }

    calendarContainer.innerHTML = ''
    calendarContainer.appendChild(ul)
  } catch (err) {
    console.error('Failed to load calendar events:', err)
  }
}

window.addEventListener('DOMContentLoaded', loadCalendar) 
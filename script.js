function openFeatures() {
    var allElems = document.querySelectorAll('.elem')
    var fullElemPage = document.querySelectorAll('.fullElem')
    var fullElemPageBackBtn = document.querySelectorAll('.fullElem .back')

    allElems.forEach(function (elem) {
        elem.addEventListener('click', function () {
            fullElemPage[elem.id].style.display = 'block'
        })
    })

    fullElemPageBackBtn.forEach(function (back) {
        back.addEventListener('click', function () {
            fullElemPage[back.id].style.display = 'none'
        })
    })
}

openFeatures()


function todoList() {

    var currentTask = []

    if (localStorage.getItem('currentTask')) {
        currentTask = JSON.parse(localStorage.getItem('currentTask'))
    } else {
        console.log('Task list is Empty');
    }



    function renderTask() {
        var allTask = document.querySelector('.allTask')

        if (currentTask.length === 0) {
            allTask.innerHTML = '<div style="text-align: center; padding: 40px; opacity: 0.7; font-size: 24px;">No tasks yet. Add your first task!</div>'
            localStorage.setItem('currentTask', JSON.stringify(currentTask))
            return
        }

        var sum = ''

        currentTask.forEach(function (elem, idx) {
            var detailsHtml = elem.details ? `<p style="color: var(--sec); font-size: 18px; margin-top: 10px; opacity: 0.8;">${elem.details}</p>` : ''
            sum = sum + `<div class="task">
        <div style="flex: 1;">
            <h5>${elem.task} <span class="${elem.imp ? 'true' : 'false'}">${elem.imp ? '⭐' : ''}</span></h5>
            ${detailsHtml}
        </div>
        <button id=${idx} aria-label="Mark task as completed">Mark as Completed</button>
        </div>`
        })

        allTask.innerHTML = sum

        localStorage.setItem('currentTask', JSON.stringify(currentTask))

        document.querySelectorAll('.task button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentTask.splice(parseInt(btn.id), 1)
                renderTask()
            })
        })
    }
    renderTask()

    let form = document.querySelector('.addTask form')
    let taskInput = document.querySelector('.addTask form #task-input')
    let taskDetailsInput = document.querySelector('.addTask form #task-details')
    let taskCheckbox = document.querySelector('.addTask form #check')

    form.addEventListener('submit', function (e) {
        e.preventDefault()
        currentTask.push(
            {
                task: taskInput.value,
                details: taskDetailsInput.value,
                imp: taskCheckbox.checked
            }
        )
        renderTask()

        taskCheckbox.checked = false
        taskInput.value = ''
        taskDetailsInput.value = ''
    })



}

todoList()


function dailyPlanner() {
    var dayPlanner = document.querySelector('.day-planner')

    var dayPlanData = JSON.parse(localStorage.getItem('dayPlanData')) || {}

    var hours = Array.from({ length: 18 }, (_, idx) => `${6 + idx}:00 - ${7 + idx}:00`)


    var wholeDaySum = ''
    hours.forEach(function (elem, idx) {

        var savedData = dayPlanData[idx] || ''

        var escapedValue = (savedData || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        wholeDaySum = wholeDaySum + `<div class="day-planner-time">
    <p>${elem}</p>
    <input id=${idx} type="text" placeholder="..." value="${escapedValue}" aria-label="Plan for ${elem}">
</div>`
    })

    dayPlanner.innerHTML = wholeDaySum


    var dayPlannerInput = document.querySelectorAll('.day-planner input')

    dayPlannerInput.forEach(function (elem) {
        elem.addEventListener('input', function () {
            dayPlanData[elem.id] = elem.value

            localStorage.setItem('dayPlanData', JSON.stringify(dayPlanData))
        })
    })
}

dailyPlanner()


function motivationalQuote() {
    var motivationQuoteContent = document.querySelector('.motivation-2 h1')
    var motivationAuthor = document.querySelector('.motivation-3 h2')

    async function fetchQuote() {
        try {
            motivationQuoteContent.innerHTML = 'Loading...'
            motivationAuthor.innerHTML = ''
            
            let response = await fetch('https://api.quotable.io/random')
            if (!response.ok) throw new Error('Failed to fetch quote')
            
            let data = await response.json()
            motivationQuoteContent.innerHTML = data.content
            motivationAuthor.innerHTML = `— ${data.author}`
        } catch (error) {
            console.error('Quote fetch error:', error)
            motivationQuoteContent.innerHTML = 'The only way to do great work is to love what you do.'
            motivationAuthor.innerHTML = '— Steve Jobs'
        }
    }

    fetchQuote()
    
    // Add refresh button functionality
    var motivationWrapper = document.querySelector('.motivation-wrapper')
    if (motivationWrapper) {
        var refreshBtn = document.createElement('button')
        refreshBtn.innerHTML = '🔄 New Quote'
        refreshBtn.style.cssText = 'position: absolute; bottom: 20px; right: 20px; padding: 10px 20px; background: var(--tri2); border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600;'
        refreshBtn.addEventListener('click', fetchQuote)
        motivationWrapper.style.position = 'relative'
        motivationWrapper.appendChild(refreshBtn)
    }
}

motivationalQuote()


function pomodoroTimer() {
    let timer = document.querySelector('.pomo-timer h1')
    var startBtn = document.querySelector('.pomo-timer .start-timer')
    var pauseBtn = document.querySelector('.pomo-timer .pause-timer')
    var resetBtn = document.querySelector('.pomo-timer .reset-timer')
    var session = document.querySelector('.pomodoro-fullpage .session')
    var isWorkSession = true
    var isRunning = false

    let totalSeconds = 25 * 60
    let timerInterval = null

    function updateTimer() {
        let minutes = Math.floor(totalSeconds / 60)
        let seconds = totalSeconds % 60
        timer.innerHTML = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    function startTimer() {
        if (isRunning) return
        isRunning = true
        clearInterval(timerInterval)

        timerInterval = setInterval(function () {
            if (totalSeconds > 0) {
                totalSeconds--
                updateTimer()
            } else {
                clearInterval(timerInterval)
                isRunning = false
                
                // Play notification sound (if browser allows)
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(isWorkSession ? 'Work Session Complete!' : 'Break Time Over!', {
                        body: isWorkSession ? 'Time for a break!' : 'Back to work!',
                        icon: './fav/android-chrome-192x192.png'
                    })
                }
                
                if (isWorkSession) {
                    isWorkSession = false
                    timer.innerHTML = '05:00'
                    session.innerHTML = 'Take a Break'
                    session.style.backgroundColor = 'var(--blue)'
                    totalSeconds = 5 * 60
                } else {
                    isWorkSession = true
                    timer.innerHTML = '25:00'
                    session.innerHTML = 'Work Session'
                    session.style.backgroundColor = 'var(--green)'
                    totalSeconds = 25 * 60
                }
            }
        }, 1000) // Fixed: Changed from 10ms to 1000ms (1 second)
    }

    function pauseTimer() {
        isRunning = false
        clearInterval(timerInterval)
    }
    
    function resetTimer() {
        isRunning = false
        isWorkSession = true
        totalSeconds = 25 * 60
        clearInterval(timerInterval)
        timer.innerHTML = '25:00'
        session.innerHTML = 'Work Session'
        session.style.backgroundColor = 'var(--green)'
        updateTimer()
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
    }
    
    startBtn.addEventListener('click', startTimer)
    pauseBtn.addEventListener('click', pauseTimer)
    resetBtn.addEventListener('click', resetTimer)
    updateTimer()
}

pomodoroTimer()



function weatherFunctionality() {
    // Using OpenWeatherMap API (free tier) - user can add their own API key
    // Fallback to Open-Meteo API (no key required) if no API key provided
    var apiKey = localStorage.getItem('weatherApiKey') || null
    var city = localStorage.getItem('userCity') || 'Bhopal'
    var useOpenWeather = apiKey !== null

    var header1Time = document.querySelector('.header1 h1')
    var header1Date = document.querySelector('.header1 h2')
    var header1Location = document.querySelector('.header1 h4')
    var header2Temp = document.querySelector('.header2 h2')
    var header2Condition = document.querySelector('.header2 h4')
    var precipitation = document.querySelector('.header2 .precipitation')
    var humidity = document.querySelector('.header2 .humidity')
    var wind = document.querySelector('.header2 .wind')

    async function weatherAPICall() {
        try {
            let data = null
            
            if (useOpenWeather && apiKey) {
                // OpenWeatherMap API
                var response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
                if (!response.ok) throw new Error('Weather API error')
                data = await response.json()
                
                header2Temp.innerHTML = `${Math.round(data.main.temp)}°C`
                header2Condition.innerHTML = `${data.weather[0].description}`
                wind.innerHTML = `Wind: ${Math.round(data.wind.speed * 3.6)} km/h`
                humidity.innerHTML = `Humidity: ${data.main.humidity}%`
                precipitation.innerHTML = `Feels like: ${Math.round(data.main.feels_like)}°C`
                header1Location.innerHTML = `${data.name}, ${data.sys.country}`
            } else {
                // Open-Meteo API (no key required) - using geolocation
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        try {
                            const lat = position.coords.latitude
                            const lon = position.coords.longitude
                            
                            // Get weather data
                            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`)
                            const weatherData = await weatherResponse.json()
                            
                            // Get location name
                            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                            const geoData = await geoResponse.json()
                            
                            const current = weatherData.current
                            const weatherCodes = {
                                0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy',
                                3: 'Overcast', 45: 'Foggy', 48: 'Depositing rime fog',
                                51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Heavy drizzle',
                                61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
                                71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
                                80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
                                85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm'
                            }
                            
                            header2Temp.innerHTML = `${Math.round(current.temperature_2m)}°C`
                            header2Condition.innerHTML = weatherCodes[current.weather_code] || 'Unknown'
                            wind.innerHTML = `Wind: ${Math.round(current.wind_speed_10m * 3.6)} km/h`
                            humidity.innerHTML = `Humidity: ${current.relative_humidity_2m}%`
                            precipitation.innerHTML = `Feels like: ${Math.round(current.temperature_2m)}°C`
                            header1Location.innerHTML = `${geoData.city || geoData.locality || city}, ${geoData.countryName || ''}`
                        } catch (error) {
                            console.error('Geolocation weather error:', error)
                            setDefaultWeather()
                        }
                    }, () => {
                        // Geolocation denied, use default city
                        setDefaultWeather()
                    })
                } else {
                    setDefaultWeather()
                }
            }
        } catch (error) {
            console.error('Weather API error:', error)
            setDefaultWeather()
        }
    }
    
    function setDefaultWeather() {
        header2Temp.innerHTML = '--°C'
        header2Condition.innerHTML = 'Unable to fetch'
        wind.innerHTML = 'Wind: -- km/h'
        humidity.innerHTML = 'Humidity: --%'
        precipitation.innerHTML = 'Add API key for weather'
        header1Location.innerHTML = city
    }

    weatherAPICall()


    function timeDate() {
        const totalDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var date = new Date()
        var dayOfWeek = totalDaysOfWeek[date.getDay()]
        var hours = date.getHours()
        var minutes = date.getMinutes()
        var seconds = date.getSeconds()
        var tarik = date.getDate()
        var month = monthNames[date.getMonth()]
        var year = date.getFullYear()

        header1Date.innerHTML = `${tarik} ${month}, ${year}`

        if (hours > 12) {
            header1Time.innerHTML = `${dayOfWeek}, ${String(hours - 12).padStart('2', '0')}:${String(minutes).padStart('2', '0')}:${String(seconds).padStart('2', '0')} PM`

        } else {
            header1Time.innerHTML = `${dayOfWeek}, ${String(hours).padStart('2', '0')}:${String(minutes).padStart('2', '0')}:${String(seconds).padStart('2', '0')} AM`
        }
    }

    setInterval(() => {
        timeDate()
    }, 1000);

}

weatherFunctionality()


function changeTheme() {

    var theme = document.querySelector('.theme')
    var rootElement = document.documentElement

    var flag = 0
    theme.addEventListener('click', function () {

        if (flag == 0) {
            rootElement.style.setProperty('--pri', '#F8F4E1')
            rootElement.style.setProperty('--sec', '#222831')
            rootElement.style.setProperty('--tri1', '#948979')
            rootElement.style.setProperty('--tri2', '#393E46')
            flag = 1
        } else if (flag == 1) {
            rootElement.style.setProperty('--pri', '#F1EFEC')
            rootElement.style.setProperty('--sec', '#030303')
            rootElement.style.setProperty('--tri1', '#D4C9BE')
            rootElement.style.setProperty('--tri2', '#123458')
            flag = 2
        } else if (flag == 2) {
            rootElement.style.setProperty('--pri', '#F8F4E1')
            rootElement.style.setProperty('--sec', '#381c0a')
            rootElement.style.setProperty('--tri1', '#FEBA17')
            rootElement.style.setProperty('--tri2', '#74512D')
            flag = 0
        }

    })


}

changeTheme()

// Daily Goals Feature
function dailyGoals() {
    var goalsContainer = document.querySelector('.daily-goals-container')
    if (!goalsContainer) {
        var goalsSection = document.querySelector('.daily-goals-fullpage')
        goalsContainer = document.createElement('div')
        goalsContainer.className = 'daily-goals-container'
        goalsSection.appendChild(goalsContainer)
    }

    var goals = JSON.parse(localStorage.getItem('dailyGoals')) || []
    var today = new Date().toDateString()

    // Clear goals if it's a new day
    var lastDate = localStorage.getItem('lastGoalsDate')
    if (lastDate !== today) {
        goals = []
        localStorage.setItem('dailyGoals', JSON.stringify(goals))
        localStorage.setItem('lastGoalsDate', today)
    }

    function renderGoals() {
        var addForm = `
            <div class="add-goal-form">
                <input type="text" id="new-goal-input" placeholder="Enter your daily goal..." aria-label="New goal input">
                <button id="add-goal-btn" aria-label="Add goal">Add Goal</button>
            </div>
        `

        var goalsList = ''
        if (goals.length === 0) {
            goalsList = '<div class="loading">No goals set for today. Add your first goal!</div>'
        } else {
            goals.forEach(function (goal, idx) {
                var completedClass = goal.completed ? 'completed' : ''
                goalsList += `
                    <div class="goal-item ${completedClass}">
                        <input type="checkbox" ${goal.completed ? 'checked' : ''} id="goal-${idx}" aria-label="Mark goal as completed">
                        <input type="text" value="${goal.text}" data-idx="${idx}" aria-label="Goal text">
                        <button class="delete-goal" data-idx="${idx}" aria-label="Delete goal">Delete</button>
                    </div>
                `
            })
        }

        goalsContainer.innerHTML = addForm + goalsList

        // Add goal functionality
        var addBtn = document.getElementById('add-goal-btn')
        var newGoalInput = document.getElementById('new-goal-input')
        
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                var goalText = newGoalInput.value.trim()
                if (goalText) {
                    goals.push({ text: goalText, completed: false })
                    localStorage.setItem('dailyGoals', JSON.stringify(goals))
                    renderGoals()
                }
            })
            
            newGoalInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    addBtn.click()
                }
            })
        }

        // Toggle completion
        document.querySelectorAll('.goal-item input[type="checkbox"]').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                var idx = parseInt(this.id.split('-')[1])
                goals[idx].completed = this.checked
                localStorage.setItem('dailyGoals', JSON.stringify(goals))
                renderGoals()
            })
        })

        // Edit goal text
        document.querySelectorAll('.goal-item input[type="text"]').forEach(function (input) {
            if (input.id !== 'new-goal-input') {
                input.addEventListener('blur', function () {
                    var idx = parseInt(this.dataset.idx)
                    goals[idx].text = this.value
                    localStorage.setItem('dailyGoals', JSON.stringify(goals))
                })
            }
        })

        // Delete goal
        document.querySelectorAll('.delete-goal').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.dataset.idx)
                goals.splice(idx, 1)
                localStorage.setItem('dailyGoals', JSON.stringify(goals))
                renderGoals()
            })
        })
    }

    renderGoals()
}

dailyGoals()

// Add keyboard navigation
document.addEventListener('keydown', function (e) {
    // ESC key to close full page sections
    if (e.key === 'Escape') {
        var fullElems = document.querySelectorAll('.fullElem')
        fullElems.forEach(function (elem) {
            if (elem.style.display === 'block') {
                elem.style.display = 'none'
            }
        })
    }
})

// Improve accessibility - add ARIA labels
document.addEventListener('DOMContentLoaded', function () {
    // Add ARIA labels to navigation buttons
    var themeBtn = document.querySelector('.theme')
    if (themeBtn) {
        themeBtn.setAttribute('aria-label', 'Change theme')
        themeBtn.setAttribute('role', 'button')
    }

    // Add ARIA labels to feature cards
    var featureCards = document.querySelectorAll('.elem')
    featureCards.forEach(function (card) {
        var title = card.querySelector('h2')?.textContent || 'Feature'
        card.setAttribute('aria-label', `Open ${title}`)
        card.setAttribute('role', 'button')
        card.setAttribute('tabindex', '0')
        
        card.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                card.click()
            }
        })
    })

    // Add ARIA labels to back buttons
    var backButtons = document.querySelectorAll('.back')
    backButtons.forEach(function (btn) {
        btn.setAttribute('aria-label', 'Close section')
    })
})
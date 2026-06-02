// ===== ENTER KEY =====
document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') getWeather();
});

// ===== TAB SWITCHING =====
function switchTab(tabName, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('page-' + tabName).classList.add('active');
    el.classList.add('active');
}

// ===== GET WEATHER =====
async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) { showError('Please enter a city name.'); return; }
    hideError();

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (!response.ok) { showError(data.message || 'City not found.'); return; }
        displayWeather(data);
        fetchForecast(city);
        switchTab('weather', document.querySelector('.tab'));
    } catch (error) {
        showError('⚠️ Unable to connect. Make sure the app is running.');
    }
}

// ===== DISPLAY WEATHER =====
function displayWeather(data) {
    const icon = data.weather[0].icon;

    document.getElementById('weatherIcon').src        = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    document.getElementById('cityName').textContent    = data.name;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('weatherTemp').textContent = Math.round(data.main.temp) + '°C';
    document.getElementById('tempMin').textContent     = '↓ ' + Math.round(data.main.temp_min) + '°';
    document.getElementById('tempMax').textContent     = '↑ ' + Math.round(data.main.temp_max) + '°';
    document.getElementById('weatherPlaceholder').classList.add('hidden');
    document.getElementById('weatherMain').classList.remove('hidden');

    document.getElementById('feelsLike').textContent  = Math.round(data.main.feels_like) + '°C';
    document.getElementById('humidity').textContent   = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent  = data.wind.speed + ' m/s';
    document.getElementById('pressure').textContent   = data.main.pressure + ' hPa';
    document.getElementById('sunrise').textContent    = data.sys ? formatTime(data.sys.sunrise) : 'N/A';
    document.getElementById('sunset').textContent     = data.sys ? formatTime(data.sys.sunset) : 'N/A';

    applyTheme(data.weather[0].main);
    showTips(data.weather[0].main);
}

// ===== 5-DAY FORECAST =====
async function fetchForecast(city) {
    try {
        const response = await fetch(`/api/weather/forecast/${encodeURIComponent(city)}`);
        const data = await response.json();
        if (data && data.list) displayForecast(data);
    } catch (error) { console.error('Forecast error:', error); }
}

function displayForecast(data) {
    const list = document.getElementById('forecastList');
    const daily = data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
    list.innerHTML = '';
    daily.forEach(day => {
        const date    = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        list.innerHTML += `
            <div class="forecast-row-item">
                <span class="fc-date">${dayName}</span>
                <img class="fc-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
                <span class="fc-desc">${day.weather[0].description}</span>
                <span class="fc-temp">${Math.round(day.main.temp)}°C</span>
            </div>`;
    });
}

// ===== CURRENT LOCATION =====
function getLocationWeather() {
    if (!navigator.geolocation) { showError('Geolocation not supported.'); return; }
    const btn = document.getElementById('locationBtn');
    btn.textContent = '📍 Detecting...'; btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
            try {
                const response = await fetch(`/api/weather/coords?lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                document.getElementById('cityInput').value = data.name;
                displayWeather(data);
                fetchForecast(data.name);
                switchTab('weather', document.querySelector('.tab'));
            } catch (err) { showError('Could not get weather for your location.'); }
            finally { btn.textContent = '📍 My Location'; btn.disabled = false; }
        },
        () => {
            showError('Allow location access to use this feature.');
            btn.textContent = '📍 My Location'; btn.disabled = false;
        }
    );
}

// ===== TIPS =====
function showTips(weatherMain) {
    const tips = {
        Clear:        [{ icon: '☀️', text: 'Great day for outdoor activities!' },
                       { icon: '🕶️', text: 'Wear sunglasses — it\'s bright out!' },
                       { icon: '📸', text: 'Perfect lighting for photography!' },
                       { icon: '🧴', text: 'Apply sunscreen before heading out.' }],
        Clouds:       [{ icon: '🌤️', text: 'Cloudy skies — good for a walk outside.' },
                       { icon: '🧥', text: 'Carry a light jacket just in case.' },
                       { icon: '📷', text: 'Great diffused lighting for photography!' },
                       { icon: '☕', text: 'Good day for a cozy coffee outside.' }],
        Rain:         [{ icon: '☔', text: 'Don\'t forget your umbrella!' },
                       { icon: '👟', text: 'Wear waterproof shoes today.' },
                       { icon: '🏠', text: 'Great day to stay in and read a book.' },
                       { icon: '🚗', text: 'Drive carefully — roads may be wet.' }],
        Drizzle:      [{ icon: '🌂', text: 'Light rain — carry a small umbrella.' },
                       { icon: '☕', text: 'Perfect weather for a hot cup of tea!' },
                       { icon: '🧣', text: 'A light scarf will keep you comfortable.' },
                       { icon: '🎵', text: 'Rainy day playlist time!' }],
        Thunderstorm: [{ icon: '⛈️', text: 'Stay indoors — thunderstorm alert!' },
                       { icon: '🔌', text: 'Unplug electronics during the storm.' },
                       { icon: '🚗', text: 'Avoid driving in heavy rain.' },
                       { icon: '📱', text: 'Keep your phone charged — just in case.' }],
        Snow:         [{ icon: '❄️', text: 'Bundle up — it\'s snowing outside!' },
                       { icon: '🧤', text: 'Wear gloves and a warm coat.' },
                       { icon: '🛣️', text: 'Roads may be slippery — drive carefully.' },
                       { icon: '☃️', text: 'Great day to build a snowman!' }],
        Mist:         [{ icon: '🌫️', text: 'Low visibility — drive carefully.' },
                       { icon: '💧', text: 'Moisturize your skin in misty weather.' },
                       { icon: '🚶', text: 'Walk carefully on slippery surfaces.' },
                       { icon: '🔦', text: 'Use headlights while driving.' }]
    };
    const list = tips[weatherMain] || [
        { icon: '🌍', text: 'Stay updated with the latest weather!' },
        { icon: '🌈', text: 'Have a great day!' }
    ];
    document.getElementById('tipsList').innerHTML = list.map(t =>
        `<div class="tip-card"><span>${t.icon}</span><p>${t.text}</p></div>`
    ).join('');
}

// ===== THEME =====
function applyTheme(weatherMain) {
    const themes = {
        Clear:        'linear-gradient(135deg, #f6c56a, #f59e42, #e07b20)',
        Clouds:       'linear-gradient(135deg, #6b8cae, #8fa8c8, #7a9bbf)',
        Rain:         'linear-gradient(135deg, #3a5a7a, #4a7a9b, #2d4f6e)',
        Drizzle:      'linear-gradient(135deg, #4a7a9b, #6a9bbc, #3a6a8b)',
        Thunderstorm: 'linear-gradient(135deg, #2c3e50, #3d5166, #1a252f)',
        Snow:         'linear-gradient(135deg, #c9d6e3, #e8f0f7, #b8ccd9)',
        Mist:         'linear-gradient(135deg, #8a9ba8, #a8b8c5, #7a8d9a)',
    };
    document.body.style.background = themes[weatherMain] || themes['Clouds'];
}

// ===== HELPERS =====
function formatTime(unix) {
    return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg; el.classList.remove('hidden');
}
function hideError() { document.getElementById('errorMsg').classList.add('hidden'); }
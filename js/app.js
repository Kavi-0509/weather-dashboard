
// ---------- DOM Elements ----------
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-btn");

const statusMessage = document.getElementById("status-message");
const weatherContainer = document.getElementById("weather-container");

const cityName = document.getElementById("city-name");
const weatherDate = document.getElementById("weather-date");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weather-icon");
const weatherDescription = document.getElementById("weather-description");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const feelsLike = document.getElementById("feels-like");

// ---------- Weather Code Information ----------
const weatherConditions = {
    0: { description: "Clear Sky", icon: "☀️" },
    1: { description: "Mainly Clear", icon: "🌤️" },
    2: { description: "Partly Cloudy", icon: "⛅" },
    3: { description: "Overcast", icon: "☁️" },
    45: { description: "Foggy", icon: "🌫️" },
    48: { description: "Depositing Rime Fog", icon: "🌫️" },
    51: { description: "Light Drizzle", icon: "🌦️" },
    53: { description: "Moderate Drizzle", icon: "🌦️" },
    55: { description: "Dense Drizzle", icon: "🌧️" },
    61: { description: "Slight Rain", icon: "🌧️" },
    63: { description: "Moderate Rain", icon: "🌧️" },
    65: { description: "Heavy Rain", icon: "🌧️" },
    71: { description: "Slight Snow", icon: "🌨️" },
    73: { description: "Moderate Snow", icon: "❄️" },
    75: { description: "Heavy Snow", icon: "❄️" },
    80: { description: "Rain Showers", icon: "🌦️" },
    81: { description: "Moderate Rain Showers", icon: "🌧️" },
    82: { description: "Violent Rain Showers", icon: "⛈️" },
    95: { description: "Thunderstorm", icon: "⛈️" },
    96: { description: "Thunderstorm with Hail", icon: "⛈️" },
    99: { description: "Heavy Thunderstorm with Hail", icon: "⛈️" }
};

// ---------- Display Status ----------
function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
}

// ---------- Get City Coordinates ----------
async function getCityCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to connect to the location service.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please enter a valid city name.");
    }

    return data.results[0];
}

// ---------- Fetch Weather Data ----------
async function getWeather(latitude, longitude) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch weather data. Please try again.");
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error("Weather information is currently unavailable.");
    }

    return data;
}

// ---------- Display Weather ----------
function displayWeather(location, weatherData) {
    const current = weatherData.current;

    const condition = weatherConditions[current.weather_code] || {
        description: "Unknown Weather",
        icon: "🌍"
    };

    cityName.textContent =
        `${location.name}, ${location.country}`;

    const date = new Date(current.time);

    weatherDate.textContent = date.toLocaleString("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    });

    temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
    weatherIcon.textContent = condition.icon;
    weatherDescription.textContent = condition.description;

    humidity.textContent = `${current.relative_humidity_2m}%`;
    windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;

    weatherContainer.hidden = false;
}

// ---------- Search Weather ----------
async function searchWeather(city) {
    searchButton.disabled = true;
    searchButton.textContent = "Loading...";

    weatherContainer.hidden = true;
    showStatus("Fetching live weather information...");

    try {
        const location = await getCityCoordinates(city);
        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        );

        displayWeather(location, weatherData);

        showStatus(`Weather successfully updated for ${location.name}.`);
    } catch (error) {
        showStatus(error.message || "Something went wrong. Please try again.", true);
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}

// ---------- Form Submit Event ----------
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showStatus("Please enter a city name.", true);
        return;
    }

    searchWeather(city);
});

function initPage() {
    // connect all of the juicy details to the HTML
    const enterCity = document.getElementById("enter-city");
    const searchButton = document.getElementById("press-search-button");
    const clearHistory = document.getElementById("clear-history");
    // const findFlight = document.getElementById("book-flight");
    const chooseCity = document.getElementById("chosen-city-name");
    const currentWeatherPic = document.getElementById("current-weather-pic");
    const todaysDate = document.getElementsByClassName("todays-date")
    const currentTemperature = document.getElementById("temperature-readout");
    const currentHumidity = document.getElementById("humidity-readout"); 4
    const currentWindSpeed = document.getElementById("wind-speed-readout");
    const currentUVLevel = document.getElementById("UV-index-readout");
    const searchHistorySection = document.getElementById("search-history-section");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    console.log(searchHistory);

    // "Chasonweather" OpenWeather API Key
    const APIKey = "b4d9b7f90a0f5accab90cb89bcd7b744";

    //  Search button inputs the value of city name into the function to be read
 
    function getWeather(cityName) {
        //  takes city name and pulls the weather data from openweather
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        axios.get(queryURL)
            .then(function (response) {
                console.log(response);
                //  Reads the input response to display current conditions
                const currentDate = new Date(response.data.dt * 1000);
                console.log(currentDate);
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                chooseCity.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
                let weatherPic = response.data.weather[0].icon;
                currentWeatherPic.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                currentWeatherPic.setAttribute("alt", response.data.weather[0].description);
                currentTemperature.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
                currentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                currentWindSpeed.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                axios.get(UVQueryURL)
                    .then(function (response) {
                        let UVIndex = document.createElement("span");
                        UVIndex.setAttribute("class", "badge badge-warning");
                        UVIndex.innerHTML = response.data[0].value;
                        currentUVLevel.innerHTML = "UV Index: ";
                        currentUVLevel.append(UVIndex);
                    });

                //  Using saved city name, execute a 5-day forecast get request from open weather map api
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        //  5 day forecast rendering with requested factors
                        console.log(response);
                        const forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    })
            });
    }
    //search city function
    searchButton.addEventListener("click", function () {
        const searchTerm = enterCity.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })
    
    //I cant figure out how to make enter work as a click but it works after you hit search
    clearHistory.addEventListener("click", "keypress", function (e) {
        if (e.key === 'enter'){
        searchHistory = [];
        renderSearchHistory();
    }})
    // renders the temerature in degrees farenheit from the given kelvin
    function k2f(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    // parse search history to display with formatting
    function renderSearchHistory() {
        searchHistorySection.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click", function () {
                getWeather(historyItem.value);
            })
            searchHistorySection.append(historyItem);
        }
    }
    
    //  Save user's search requests and display them underneath search form
    //  When page loads, automatically generate current conditions and 5-day forecast for the last city the user searched for
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}
initPage();
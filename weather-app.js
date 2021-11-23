'use strict';

$(document).ready(function () {

    // function for converting the date to standard notation
    function parseDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString();
    }

    // function rendering the data in html
    function renderHtml(date, current, image, high, low) {
        var html = "<div class='card' style='width: 10rem'>" +
            "<div class='card-body'>" +
            "<div>" + date + "</div>" +
            "<h5>" + 'current: ' + Math.round(current) + '°' + '</h5>' +
            '<img src="' + image + '" class="card-img-top" alt="Epic Fail!!!" height="80px" width="50px">' +
            "<div>" + 'high: ' + Math.round(high) + '°' + '</div>' +
            "<div>" + 'low: ' + Math.round(low) + '°' + '</div>'
            + "</div>"
            + "</div>"
        $('.content').prepend(html)
    }

    // geocode function to get coordinates of user input
    function geocode(search, token) {
        var baseUrl = 'https://api.mapbox.com';
        var endPoint = '/geocoding/v5/mapbox.places/';
        return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token)
            .then(function (res) {
                return res.json();
                // to get all the data from the request, comment out the following three lines...
            }).then(function (data) {
                return data.features[0].center;
            });
    }

    // click sound effect used for button click
    var click = new Audio('audio/click.wav')

    // our initial get request from open weather map api to display data in pre selected location(Dallas)
    $.get('https://api.openweathermap.org/data/2.5/onecall', {
        lat: 32.7763,
        lon: -96.7969,
        APPID: OPEN_WEATHER_APIID,
        units: "imperial"
    }).done(function (data) {

        // setting up an empty array to push the data into
        var arr = []

        // pushing data to the empty array
        arr.push(data)

        // looping through our array of data
        arr.forEach(function (data) {

            // pulling out the daily data from our array
            var dailyData = data.daily

            // looping through the daily data array
            for (var i = dailyData.length - 1; i >= 0; i--) {

                // pulling out the weather array from the daily data array
                var weatherArr = data.daily[i].weather

                // looping through the weather data array to gain access to the weather icons
                for (var j = 0; j < weatherArr.length; j++) {

                    // setting up our variables to add to render html function
                    var weatherIcon = weatherArr[j].icon
                    var date = parseDate(data.daily[i].dt)
                    var temp = data.current.temp
                    var image = "http://openweathermap.org/img/w/" + weatherIcon + ".png"
                    var high = data.daily[i].temp.max
                    var low = data.daily[i].temp.min
                    renderHtml(date, temp, image, high, low)
                }
            }
        })
    })


    // mapbox api set up
    mapboxgl.accessToken = mapboxApiKey;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 10,
        center: [-96.79107, 32.766540],
        dragRotate: true
    });


    // click event using user data for weathermap api
    $('#submit').click(function (e) {
        e.preventDefault()
        click.play()

        // capturing user input and storing it in a variable
        var input = $('#input').val()

        // using the geocode function to get lat and lon coordinates of user input
        geocode(input, mapboxApiKey)
            .then(function (data) {
                map.flyTo({center: data})

                // get route using geocode for lat and lon coordinates
                $.get('https://api.openweathermap.org/data/2.5/onecall', {
                    lat: data[1],
                    lon: data[0],
                    APPID: OPEN_WEATHER_APIID,
                    units: "imperial"
                }).done(function (newData) {

                    // creating a new variable storing the daily weather data
                    var dailyWeather = newData.daily

                    // looping through daily weather to get data from api, had to loop backwards due to how the api sends its data
                    for (var i = dailyWeather.length - 1; i >= 0; i--) {

                        // saving the weather array into a variable to extract the icons
                        var weatherArray = dailyWeather[i].weather

                        // looping through the weather array to extract the weather icons
                        for (var j = 0; j < weatherArray.length; j++) {

                            // setting up variables for use in the render html function
                            var weatherIcon = weatherArray[j].icon
                            var date = parseDate(dailyWeather[i].dt)
                            var temp = newData.current.temp
                            var image = "http://openweathermap.org/img/w/" + weatherIcon + ".png"
                            var high = dailyWeather[i].temp.max
                            var low = dailyWeather[i].temp.min
                            renderHtml(date, temp, image, high, low)
                        }
                    }
                })
            })
    })
})
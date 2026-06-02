package com.examplecom.weatherapp.weather_app.service;

import com.examplecom.weatherapp.weather_app.model.WeatherResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // ===== 1. GET WEATHER BY CITY NAME =====
    public WeatherResponse getWeather(String city) {
        try {
            String url = apiUrl + "/weather?q=" + city.trim() + "&appid=" + apiKey + "&units=metric";
            return restTemplate.getForObject(url, WeatherResponse.class);

        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("City '" + city + "' not found. Please check the spelling.");

        } catch (Exception e) {
            throw new RuntimeException("Unable to reach weather service. Please try again later.");
        }
    }

    // ===== 2. GET 5-DAY FORECAST BY CITY NAME =====
    public String getForecastByCity(String city) throws Exception {
        try {
            String url = apiUrl + "/forecast?q=" + city.trim()
                    + "&appid=" + apiKey + "&units=metric&cnt=40";
            return restTemplate.getForObject(url, String.class);

        } catch (HttpClientErrorException.NotFound e) {
            throw new Exception("City '" + city + "' not found. Please check the spelling.");

        } catch (Exception e) {
            throw new Exception("Unable to fetch forecast. Please try again later.");
        }
    }

    // ===== 3. GET WEATHER BY COORDINATES (Current Location) =====
    public WeatherResponse getWeatherByCoords(double lat, double lon) throws Exception {
        try {
            String url = apiUrl + "/weather?lat=" + lat + "&lon=" + lon
                    + "&appid=" + apiKey + "&units=metric";
            return restTemplate.getForObject(url, WeatherResponse.class);

        } catch (HttpClientErrorException.NotFound e) {
            throw new Exception("Could not find weather for your location.");

        } catch (Exception e) {
            throw new Exception("Unable to reach weather service. Please try again later.");
        }
    }
}
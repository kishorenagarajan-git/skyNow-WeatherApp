package com.examplecom.weatherapp.weather_app.controller;

import com.examplecom.weatherapp.weather_app.model.ErrorResponse;
import com.examplecom.weatherapp.weather_app.model.WeatherResponse;
import com.examplecom.weatherapp.weather_app.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    // ===== 1. GET WEATHER BY CITY NAME =====
    @GetMapping
    public ResponseEntity<?> getWeather(@RequestParam(required = false) String city) {

        if (city == null || city.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Please provide a city name.", 400));
        }

        try {
            WeatherResponse weather = weatherService.getWeather(city);
            return ResponseEntity.ok(weather);

        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage(), 404));
        }
    }

    // ===== 2. GET 5-DAY FORECAST BY CITY NAME =====
    @GetMapping("/forecast/{city}")
    public ResponseEntity<?> getForecast(@PathVariable String city) {
        try {
            String forecast = weatherService.getForecastByCity(city);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage(), 404));
        }
    }

    // ===== 3. GET WEATHER BY COORDINATES (Current Location) =====
    @GetMapping("/coords")
    public ResponseEntity<?> getWeatherByCoords(
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            WeatherResponse weather = weatherService.getWeatherByCoords(lat, lon);
            return ResponseEntity.ok(weather);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage(), 404));
        }
    }
}
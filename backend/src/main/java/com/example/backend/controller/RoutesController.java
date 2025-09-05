package com.example.backend.controller;

import com.example.backend.entity.Route;
import com.example.backend.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class RoutesController {
    @Autowired
    private RouteRepository routeRepository;

    @GetMapping("/route")
    public ResponseEntity<?> getRoute(@RequestParam double startLat, @RequestParam double startLng,
                                      @RequestParam double endLat, @RequestParam double endLng) {
        String osrmUrl = String.format(
            "http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson",
            startLng, startLat, endLng, endLat);
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> osrmResponse = restTemplate.getForObject(osrmUrl, Map.class);
            if (osrmResponse == null || !osrmResponse.containsKey("routes")) {
                return ResponseEntity.status(502).body(Map.of("error", "No route from OSRM", "osrm", osrmResponse));
            }
            Object routesObj = osrmResponse.get("routes");
            if (!(routesObj instanceof java.util.List) || ((java.util.List<?>) routesObj).isEmpty()) {
                return ResponseEntity.status(502).body(Map.of("error", "No routes found in OSRM response", "osrm", osrmResponse));
            }
            Map<String, Object> routeMap = (Map<String, Object>) ((java.util.List<?>) routesObj).get(0);
            Object geometryObj = routeMap.get("geometry");
            if (geometryObj == null) {
                return ResponseEntity.status(502).body(Map.of("error", "No geometry in OSRM route", "osrm", osrmResponse));
            }
            String geoJson = geometryObj.toString();
            String startLoc = startLat + "," + startLng;
            String endLoc = endLat + "," + endLng;
            Route route = new Route(startLoc, endLoc, geoJson, LocalDateTime.now());
            routeRepository.save(route);
            return ResponseEntity.ok(Map.of("geometry", geometryObj));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
    // ...existing code...


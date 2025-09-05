package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String startLocation;
    private String endLocation;
    @Column(columnDefinition = "TEXT")
    private String routeGeoJson;
    private LocalDateTime createdAt;

    public Route() {}
    public Route(String startLocation, String endLocation, String routeGeoJson, LocalDateTime createdAt) {
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.routeGeoJson = routeGeoJson;
        this.createdAt = createdAt;
    }
    // getters and setters
    public Long getId() { return id; }
    public String getStartLocation() { return startLocation; }
    public String getEndLocation() { return endLocation; }
    public String getRouteGeoJson() { return routeGeoJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setId(Long id) { this.id = id; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }
    public void setEndLocation(String endLocation) { this.endLocation = endLocation; }
    public void setRouteGeoJson(String routeGeoJson) { this.routeGeoJson = routeGeoJson; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

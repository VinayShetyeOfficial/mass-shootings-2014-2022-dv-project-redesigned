// src/app/context/MapContext.js

/**
 * MapContext provides global state management for map-related data.
 *
 * Context Values:
 * - map: GoogleMap instance
 * - incidentMarkers: Array of shooting incident markers
 * - selectedYear: Currently selected year filter
 * - selectedCategory: Current incident category filter (All/Fatal/Nonfatal)
 * - selectedStateName: Currently selected US state
 * - currentZoom: Current map zoom level
 * - isMapLoaded: Boolean indicating if map has finished loading
 */

"use client";

import { createContext, useState, useEffect } from "react";

export const MapContext = createContext(null);

export function MapProvider({ children }) {
  // Initialize map instance state
  const [map, setMap] = useState(null);

  // Track incident marker data
  const [incidentMarkers, setIncidentMarkers] = useState([]);

  // Selected filters state
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // UI states
  const [selectedStateName, setSelectedStateName] = useState("");
  const [currentZoom, setCurrentZoom] = useState(4.3);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Simulate loading delay for UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        incidentMarkers,
        setIncidentMarkers,
        selectedYear,
        setSelectedYear,
        selectedCategory,
        setSelectedCategory,
        selectedStateName,
        setSelectedStateName,
        currentZoom,
        setCurrentZoom,
        isMapLoaded,
        setIsMapLoaded,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

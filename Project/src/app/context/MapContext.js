// src/app/context/MapContext.js

"use client";

import { createContext, useState, useEffect } from "react";

export const MapContext = createContext(null);

export function MapProvider({ children }) {
  const [map, setMap] = useState(null);
  const [incidentMarkers, setIncidentMarkers] = useState([]);

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedStateName, setSelectedStateName] = useState("");
  const [currentZoom, setCurrentZoom] = useState(4.3);

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Introduce a 5-second delay for testing the loader animation
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 5000); // 5000 milliseconds = 5 seconds

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

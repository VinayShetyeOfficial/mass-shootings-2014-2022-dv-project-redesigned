"use client";
import { createContext, useState } from "react";

export const MapContext = createContext(null);

export function MapProvider({ children }) {
  const [map, setMap] = useState(null);
  const [incidentMarkers, setIncidentMarkers] = useState([]);

  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

// src/app/context/MapContext.js

"use client";

import { createContext, useState, useEffect } from "react";
import Papa from "papaparse";

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
    const fetchCSVData = async () => {
      try {
        const response = await fetch(
          "/data/mass_shootings_geocoded_cleaned.csv"
        );
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // Convert numeric fields properly
          complete: (result) => {
            const formattedData = result.data.map((row) => ({
              id: row["Incident ID"],
              date: row["Incident Date"],
              state: row["State"],
              city: row["City Or County"],
              address: row["Address"],
              fatal: row["Victims Killed"] || 0,
              injured: row["Victims Injured"] || 0,
              suspectsKilled: row["Suspects Killed"] || 0,
              suspectsInjured: row["Suspects Injured"] || 0,
              latitude: parseFloat(row["Latitude"]),
              longitude: parseFloat(row["Longitude"]),
            }));
            setIncidentMarkers(formattedData);
            setIsMapLoaded(true);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCSVData();
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

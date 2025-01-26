// src/app/components/MapComponent.js

"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useEffect, useContext, useCallback } from "react";
import { MapContext } from "../context/MapContext";
import { processCSVData } from "../utils/processData";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const defaultCenter = { lat: 38.5, lng: -100.5 };
const defaultZoom = 4.3;

export default function MapComponent() {
  const {
    map,
    setMap,
    incidentMarkers,
    setIncidentMarkers,
    selectedYear,
    selectedCategory,
    currentZoom,
    setCurrentZoom,
    setIsMapLoaded, // Destructure setIsMapLoaded
  } = useContext(MapContext);

  useEffect(() => {
    fetch("/data/mass_shootings_geocoded_cleaned.csv")
      .then((res) => res.text())
      .then(async (csvText) => {
        const incidents = await processCSVData(
          csvText,
          selectedYear,
          selectedCategory
        );
        console.log("Filtered incidents:", incidents);
        setIncidentMarkers(incidents);

        // Introduce a delay before setting isMapLoaded to true
        setTimeout(() => {
          setIsMapLoaded(true);
        }, 5000); // 5-second delay for testing
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, [selectedYear, selectedCategory, setIncidentMarkers, setIsMapLoaded]);

  // Callback to handle map load
  const handleMapLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);
      setCurrentZoom(mapInstance.getZoom());

      // Optionally, you can set isMapLoaded here instead of in the useEffect above
      // setIsMapLoaded(true);

      // Add event listener for zoom changes
      mapInstance.addListener("zoom_changed", () => {
        const newZoom = mapInstance.getZoom();
        setCurrentZoom(newZoom);
      });
    },
    [setMap, setCurrentZoom, setIsMapLoaded]
  );

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={handleMapLoad}
        options={{
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: false,
          restriction: {
            latLngBounds: {
              north: 65.0,
              south: 5.0,
              west: -150.0,
              east: -50.0,
            },
            strictBounds: true,
          },
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: [
            {
              featureType: "all",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ visibility: "on" }],
            },
          ],
        }}
      >
        {incidentMarkers.map((incident) => (
          <Marker
            key={incident.id}
            position={incident.position}
            icon={{
              url: incident.fatal
                ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
            }}
            title={`State: ${incident.state}, Fatalities: ${
              incident.fatal ? "Yes" : "No"
            }`}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

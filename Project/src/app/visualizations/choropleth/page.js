"use client";

import { useEffect, useState, useContext } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { MapContext } from "../../context/MapContext";
import * as d3 from "d3";
import VisualizationMenu from "../../components/VisualizationMenu";
import ResetZoomButton from "../../components/ResetZoomButton";
import ToggleButton from "../../components/ToggleButton";
import Legend from "./Legend";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const defaultCenter = { lat: 38.5, lng: -100.5 };
const defaultZoom = 4.3;

export default function ChoroplethPage() {
  const { map, setMap } = useContext(MapContext);
  const [countyFeatures, setCountyFeatures] = useState([]);
  const [incidentData, setIncidentData] = useState({});
  const [viewType, setViewType] = useState("fatal");

  // Load GeoJSON Data
  useEffect(() => {
    fetch("/data/counties.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          setCountyFeatures(data.features);
        }
      })
      .catch((err) => console.error("Error fetching GeoJSON:", err));
  }, []);

  // Load and process CSV Data
  useEffect(() => {
    d3.csv("/data/mass_shootings_geocoded_cleaned.csv").then((data) => {
      const aggregatedData = data.reduce((acc, row) => {
        const countyName = row["City Or County"].toLowerCase().trim();
        acc[countyName] = acc[countyName] || { killed: 0, injured: 0 };
        acc[countyName].killed += +row["Victims Killed"];
        acc[countyName].injured += +row["Victims Injured"];
        return acc;
      }, {});
      setIncidentData(aggregatedData);
    });
  }, []);

  // Process and display data
  useEffect(() => {
    if (
      !map ||
      countyFeatures.length === 0 ||
      Object.keys(incidentData).length === 0
    )
      return;

    map.data.forEach((feature) => {
      map.data.remove(feature);
    });

    map.data.addGeoJson({
      type: "FeatureCollection",
      features: countyFeatures,
    });

    // Apply correct styling for fatal/non-fatal cases
    map.data.setStyle((feature) => {
      const countyName = feature.getProperty("NAME").toLowerCase().trim();
      const data = incidentData[countyName] || { killed: 0, injured: 0 };
      const value = viewType === "fatal" ? data.killed : data.injured;

      let colorScale;
      if (viewType === "fatal") {
        colorScale = d3
          .scaleThreshold()
          .domain([1, 50, 150])
          .range(["#ffcccc", "#ff9999", "#ff6666"]);
      } else {
        colorScale = d3
          .scaleThreshold()
          .domain([1, 50, 150])
          .range(["#cce5ff", "#99c2ff", "#005ce6"]);
      }

      return {
        fillColor: value > 0 ? colorScale(value) : "#d3d3d3", // Default gray if no data
        fillOpacity: 0.7,
        strokeColor: "#000",
        strokeWeight: 0.5,
      };
    });
  }, [map, countyFeatures, incidentData, viewType]);

  return (
    <div className="relative">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={(mapInstance) => setMap(mapInstance)}
          options={{
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: false,
            restriction: {
              latLngBounds: {
                north: 72.0,
                south: 18.0,
                west: -170.0,
                east: -50.0,
              },
              strictBounds: true,
            },
            disableDefaultUI: true,
            clickableIcons: false,
            gestureHandling: "greedy",
          }}
        />
      </LoadScript>

      <Legend viewType={viewType} setViewType={setViewType} />

      <VisualizationMenu isVisible={true} />
      <ResetZoomButton />
      <ToggleButton toggleVisibility={() => {}} />
    </div>
  );
}

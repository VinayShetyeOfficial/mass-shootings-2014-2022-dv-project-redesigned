"use client";
import { useEffect, useState, useContext } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { MapContext } from "../../context/MapContext";
import * as d3 from "d3";
import { feature as topojsonFeature } from "topojson-client";
import VisualizationMenu from "../../components/VisualizationMenu";
import ResetZoomButton from "../../components/ResetZoomButton";
import ToggleButton from "../../components/ToggleButton";
import Legend from "./Legend";

/**
 * Choropleth map visualization of incident distribution.
 * Shows geographical patterns using color-coded states.
 *
 * Features:
 * - State-level data aggregation
 * - Custom color scales
 * - Interactive tooltips
 * - Toggle between metrics
 */

// Map container style configuration
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

// Default center coordinates for USA
const defaultCenter = { lat: 38.5, lng: -100.5 };

// Initial zoom level for map view
const defaultZoom = 4.3;

// Normalize state names for consistent comparison
const normalizeStateName = (name) => {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ChoroplethPage() {
  const { map, setMap } = useContext(MapContext);
  const [stateFeatures, setStateFeatures] = useState([]);
  const [incidentData, setIncidentData] = useState({});
  const [viewType, setViewType] = useState("fatal");
  const [menuVisible, setMenuVisible] = useState(true);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Fetch and process state boundary data
  useEffect(() => {
    fetch("/data/states-10m.json")
      .then((res) => res.json())
      .then((topoData) => {
        if (topoData?.objects?.states) {
          const statesGeo = topojsonFeature(topoData, topoData.objects.states);
          setStateFeatures(statesGeo.features);
          console.log(
            "GeoJSON States:",
            statesGeo.features.map((d) => d.properties.name)
          );
        } else {
          console.error("Invalid TopoJSON structure.");
        }
      })
      .catch((err) => console.error("Error fetching states-10m.json:", err));
  }, []);

  // Aggregate incident data by state
  useEffect(() => {
    d3.csv("/data/mass_shootings_geocoded_cleaned.csv").then((rows) => {
      const aggregated = rows.reduce((acc, row) => {
        const state = normalizeStateName(row.State);
        if (!acc[state]) acc[state] = { killed: 0, injured: 0 };
        acc[state].killed += +row["Victims Killed"] || 0;
        acc[state].injured += +row["Victims Injured"] || 0;
        return acc;
      }, {});
      setIncidentData(aggregated);
      console.log("Processed Incident Data:", Object.keys(aggregated));
    });
  }, []);

  useEffect(() => {
    if (!map || !stateFeatures.length || !Object.keys(incidentData).length)
      return;

    map.data.forEach((feature) => map.data.remove(feature));

    map.data.addGeoJson({
      type: "FeatureCollection",
      features: stateFeatures,
    });

    map.data.setStyle((feature) => {
      const stateName = normalizeStateName(feature.getProperty("name"));
      const data = incidentData[stateName] || { killed: 0, injured: 0 };
      const value = viewType === "fatal" ? data.killed : data.injured;

      console.log(`Processing state: ${stateName}, Value: ${value}`);

      const colorScale = d3
        .scaleThreshold()
        .domain([0, 1, 20, 50, 100, 200, 500])
        .range(
          viewType === "fatal"
            ? [
                "#ffffff",
                "#ffedea",
                "#ffcec5",
                "#ffad9f",
                "#ff6f5e",
                "#ff3f2e",
                "#ff1100",
              ]
            : [
                "#ffffff",
                "#edf8fb",
                "#cce5ff",
                "#99c2ff",
                "#6699ff",
                "#3366ff",
                "#0033cc",
              ]
        );

      return {
        fillColor: colorScale(value),
        fillOpacity: value >= 0 ? 0.7 : 0.1,
        strokeColor: "#000",
        strokeWeight: 0.5,
      };
    });

    map.data.addListener("mouseover", (event) => {
      const stateName = normalizeStateName(event.feature.getProperty("name"));
      const data = incidentData[stateName] || { killed: 0, injured: 0 };
      const value = viewType === "fatal" ? data.killed : data.injured;

      setTooltipContent(
        viewType === "fatal"
          ? `Risk Level: ${getRiskLevel(value, "fatal")}`
          : `Injuries: ${getRiskLevel(value, "injured")}`
      );

      if (event.domEvent) {
        setTooltipPosition({
          x: event.domEvent.pageX,
          y: event.domEvent.pageY,
        });
      }

      setTooltipVisible(true);
    });

    map.data.addListener("mouseout", () => {
      setTooltipVisible(false);
    });
  }, [map, stateFeatures, incidentData, viewType]);

  const getRiskLevel = (value, type) => {
    const ranges = [1, 20, 50, 100, 200, 500];
    const labels = [
      "(1-20)",
      "(20-50)",
      "(50-100)",
      "(100-200)",
      "(200-500)",
      "(>500)",
    ];

    for (let i = 0; i < ranges.length; i++) {
      if (value <= ranges[i]) {
        return labels[i];
      }
    }
    return labels[labels.length - 1];
  };

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

      {menuVisible && <Legend viewType={viewType} setViewType={setViewType} />}
      {menuVisible && (
        <VisualizationMenu
          redirectTo="/"
          title="Geo Plot"
          isVisible={menuVisible}
        />
      )}
      <ResetZoomButton />
      <ToggleButton toggleVisibility={() => setMenuVisible(!menuVisible)} />

      {tooltipVisible && (
        <div
          className="absolute z-50 px-4 py-2 text-white bg-black rounded-md shadow-lg"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

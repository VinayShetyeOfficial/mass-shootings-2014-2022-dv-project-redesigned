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

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const defaultCenter = { lat: 38.5, lng: -100.5 };
const defaultZoom = 4.3;

export default function ChoroplethPage() {
  const { map, setMap } = useContext(MapContext);
  const [stateFeatures, setStateFeatures] = useState([]);
  const [incidentData, setIncidentData] = useState({});
  const [viewType, setViewType] = useState("fatal");
  const [menuVisible, setMenuVisible] = useState(true);

  useEffect(() => {
    fetch("/data/states-10m.json")
      .then((res) => res.json())
      .then((topoData) => {
        if (topoData?.objects?.states) {
          const statesGeo = topojsonFeature(topoData, topoData.objects.states);
          setStateFeatures(statesGeo.features);
        } else {
          console.error("states-10m.json structure is not as expected.");
        }
      })
      .catch((err) => console.error("Error fetching states-10m.json:", err));
  }, []);

  useEffect(() => {
    d3.csv("/data/mass_shootings_geocoded_cleaned.csv").then((rows) => {
      const aggregated = rows.reduce((acc, row) => {
        const state = row.State;
        if (!acc[state]) acc[state] = { killed: 0, injured: 0 };
        acc[state].killed += +row["Victims Killed"] || 0;
        acc[state].injured += +row["Victims Injured"] || 0;
        return acc;
      }, {});
      setIncidentData(aggregated);
    });
  }, []);

  useEffect(() => {
    if (!map || !stateFeatures.length || !incidentData) return;

    map.data.forEach((feature) => map.data.remove(feature));
    map.data.addGeoJson({
      type: "FeatureCollection",
      features: stateFeatures,
    });

    map.data.setStyle((feature) => {
      const stateName = feature.getProperty("name");
      const data = incidentData[stateName] || { killed: 0, injured: 0 };
      const value = viewType === "fatal" ? data.killed : data.injured;

      const colorScale = d3
        .scaleThreshold()
        .domain(
          viewType === "fatal"
            ? [1, 20, 50, 100, 200, 500]
            : [1, 50, 150, 300, 500, 1000]
        )
        .range(
          viewType === "fatal"
            ? ["#ffedea", "#ffcec5", "#ffad9f", "#ff6f5e", "#ff3f2e", "#ff1100"]
            : ["#edf8fb", "#cce5ff", "#99c2ff", "#6699ff", "#3366ff", "#0033cc"]
        );

      return {
        fillColor: colorScale(value),
        fillOpacity: value > 0 ? 0.7 : 0.1,
        strokeColor: "#000",
        strokeWeight: 0.5,
      };
    });
  }, [map, stateFeatures, incidentData, viewType]);

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
    </div>
  );
}

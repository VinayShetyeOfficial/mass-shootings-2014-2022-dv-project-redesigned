// src/pages/HeatMapPage.js
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import * as d3 from "d3";

import VisualizationMenu from "../../components/VisualizationMenu";
import ToggleButton from "../../components/ToggleButton";
import { FaMapMarkerAlt } from "react-icons/fa";

// Dynamically import Plotly to prevent SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function HeatMapPage() {
  const [menuVisible, setMenuVisible] = useState(true);
  const [heatmapData, setHeatmapData] = useState({
    z: [],
    x: [],
    y: [],
  });

  // Toggles the VisualizationMenu on/off
  const toggleVisibility = () => {
    setMenuVisible((prev) => !prev);
  };

  useEffect(() => {
    async function loadCSV() {
      try {
        const rawData = await d3.csv("/data/mass_shootings_2014_2022.csv");

        const years = new Set();
        const states = new Set();
        const dataMap = {};

        // Process data
        rawData.forEach((row) => {
          const year = new Date(row["Incident Date"]).getFullYear();
          const state = row["State"];
          const victims = +row["Victims Killed"] + +row["Victims Injured"];

          years.add(year);
          states.add(state);

          if (!dataMap[state]) {
            dataMap[state] = {};
          }
          dataMap[state][year] = (dataMap[state][year] || 0) + victims;
        });

        // Convert to array format for Plotly
        const sortedYears = Array.from(years).sort();
        const sortedStates = Array.from(states).sort();

        const zData = sortedStates.map((state) =>
          sortedYears.map((year) => dataMap[state][year] || 0)
        );

        setHeatmapData({
          x: sortedYears,
          y: sortedStates,
          z: zData,
        });
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    }

    loadCSV();
  }, []);

  return (
    <div className="relative flex flex-col items-center min-h-screen p-6 bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400">
      {/* Page Title / Heading */}
      <h1 className="text-4xl font-extrabold tracking-wider text-center">
        <div className="inline-flex items-center gap-4 p-4 rounded-lg justify-baseline ">
          <FaMapMarkerAlt className="text-4xl text-blue-800" />
          <span className="text-3xl font-bold tracking-widest text-gray-800 drop-shadow-md">
            Victims Analysis Over the Years{" "}
            <span className="text-blue-800">[2014 - 2022]</span>
          </span>
        </div>
      </h1>

      {/* Main Heatmap Chart Container */}
      <div className="flex justify-center w-full">
        <div className="w-full transition-transform max-w-[95vw]">
          {/* Wrapper div with custom class for cursor styling */}
          <div className="plotly-container">
            <Plot
              data={[
                {
                  z: heatmapData.z,
                  x: heatmapData.x,
                  y: heatmapData.y,
                  type: "heatmap",
                  colorscale: [
                    [0, "#FFD700"], // Bright Yellow for non-fatal (injured)
                    [0.25, "#FFA500"], // Orange for moderate counts
                    [0.5, "#FF4500"], // Orange-Red for higher counts
                    [0.75, "#DC143C"], // Crimson red for severe counts
                    [1, "#8B0000"], // Dark Red for fatal cases
                  ],
                  hoverongaps: false,
                  zsmooth: false,
                  showscale: true,
                  text: heatmapData.z.map((row) =>
                    row.map((val) => (val > 0 ? `<b>${val}</b>` : ""))
                  ),
                  texttemplate: "%{text}",
                  textfont: {
                    family: "Arial, sans-serif",
                    size: 16,
                    color: "white",
                  },
                  // Add contour lines to mimic depth
                  contours: {
                    showlines: true,
                    color: "rgba(0, 0, 0, 0.6)", // Darker borders to create depth effect
                  },
                },
              ]}
              layout={{
                xaxis: {
                  title: {
                    text: "Year",
                    font: { size: 22, color: "#222222", weight: "bold" },
                    standoff: 40, // More space between axis and title
                  },
                  tickmode: "array",
                  tickvals: heatmapData.x,
                  tickfont: { size: 16, color: "#222222", weight: "bold" }, // Slightly smaller, bold font
                  tickangle: 0, // Slant the year labels for style
                  showgrid: true,
                  gridcolor: "#DDDDDD",
                  automargin: true,
                },

                yaxis: {
                  title: {
                    text: "State",
                    font: { size: 22, color: "#222222", weight: "bold" },
                    standoff: 0,
                  },
                  tickfont: { size: 16, color: "#222222", weight: "bold" }, // Slightly smaller, bold font
                  tickangle: -40, // Slant the state labels for style
                  showgrid: true,
                  gridcolor: "#DDDDDD",
                  scaleanchor: "x",
                  tickmode: "linear",
                  automargin: true,
                },

                hoverlabel: {
                  font: {
                    size: 18, // Increase font size of tooltip text
                    color: "#FFFFFF", // White text color for better visibility
                  },
                  bgcolor: "#333333", // Dark background for contrast
                  bordercolor: "#FFFFFF", // White border for visibility
                  namelength: -1, // Show full names
                  padding: { t: 100, r: 15, b: 10, l: 15 }, // Padding added around tooltip content
                },

                colorbar: {
                  title: {
                    text: "Victim Count",
                    font: { size: 22, color: "#222222", weight: "bold" },
                  },
                  tickfont: { size: 20, color: "#222222", weight: "bold" },
                  tickvals: [0, 100, 200, 300, 400, 500],
                  ticktext: ["0", "100", "200", "300", "400", "500+"],
                },

                annotations: [
                  {
                    x: 1.065,
                    y: 1.03,
                    xref: "paper",
                    yref: "paper",
                    text: "<b>Fatal</b>",
                    showarrow: false,
                    font: {
                      size: 20,
                      color: "#222222",
                      weight: "bold",
                    },
                  },
                  {
                    x: 1.095,
                    y: -0.03,
                    xref: "paper",
                    yref: "paper",
                    text: "<b>Non-Fatal</b>",
                    showarrow: false,
                    font: {
                      size: 20,
                      color: "#222222",
                      weight: "bold",
                    },
                  },
                ],

                margin: { l: 250, r: 250, t: 80, b: 100 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                height: 2000,
                width: 1800,
                dragmode: false,
                hovermode: "closest", // Maintain hover interactions
              }}
              config={{
                responsive: true,
                displaylogo: false,
                modeBarButtonsToRemove: [
                  "zoom2d",
                  "pan2d",
                  "select2d",
                  "lasso2d",
                  "resetScale2d",
                  "zoomIn2d",
                  "zoomOut2d",
                  "autoScale2d",
                  "toggleSpikelines",
                  "hoverClosestCartesian",
                  "hoverCompareCartesian",
                ],
                displayModeBar: false,
                scrollZoom: false,
                doubleClick: false,
                editable: false,
                staticPlot: false, // Allows hover but disables other interactions
              }}
            />
          </div>
        </div>
      </div>

      <VisualizationMenu isVisible={menuVisible} />
      <ToggleButton toggleVisibility={toggleVisibility} />

      {/* Inline Global CSS to override cursor and disable selection */}
      <style jsx global>{`
        .plotly-container,
        .plotly-container * {
          cursor: default !important;
          user-select: none !important;
        }
      `}</style>
    </div>
  );
}

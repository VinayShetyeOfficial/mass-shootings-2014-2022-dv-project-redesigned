"use client";

import { useState, useEffect } from "react";
import * as d3 from "d3";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import VisualizationMenu from "../../components/VisualizationMenu";
import ToggleButton from "../../components/ToggleButton";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";

// Helper for consistent state name formatting
function normalizeStateName(name) {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Custom dark-themed tooltip with enhanced design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 text-gray-300 bg-gray-900 border border-blue-400 shadow-2xl rounded-xl opacity-[0.88]">
        <p className="flex items-center justify-center mb-2 text-lg font-bold text-white">
          <span role="img" aria-label="calendar" className="mr-2">
            📅
          </span>
          {label}
        </p>
        <div className="flex flex-col space-y-2 text-center">
          <p className="font-semibold text-blue-400">
            Injured:
            <span className="ml-2 font-bold text-blue-300">
              {payload[0]?.value}
            </span>
          </p>
          <p className="font-semibold text-red-400">
            Killed:
            <span className="ml-2 font-bold text-red-300">
              {payload[1]?.value}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Line chart visualization for temporal analysis of incidents.
 * Shows trends of casualties over time by state.
 *
 * Features:
 * - Multi-state comparison
 * - Separate killed/injured metrics
 * - Interactive tooltips
 * - Dynamic data loading
 */
export default function LineChartsPage() {
  const [menuVisible, setMenuVisible] = useState(true);
  const [stateData, setStateData] = useState([]);

  // Toggles the VisualizationMenu on/off
  const toggleVisibility = () => {
    setMenuVisible((prev) => !prev);
  };

  // Process and aggregate data by state and year
  useEffect(() => {
    d3.csv("/data/mass_shootings_geocoded_cleaned.csv")
      .then((data) => {
        // Process data
        data.forEach((row) => {
          row.Year = new Date(row["Incident Date"]).getFullYear();
          row.VictimsInjured = +row["Victims Injured"] || 0;
          row.VictimsKilled = +row["Victims Killed"] || 0;
          row.State = normalizeStateName(row.State);
        });

        // Group by state => year => sum injured/killed
        const grouped = {};
        data.forEach((d) => {
          const { State, Year, VictimsInjured, VictimsKilled } = d;
          if (!State) return;
          if (!grouped[State]) grouped[State] = {};
          if (!grouped[State][Year])
            grouped[State][Year] = { injured: 0, killed: 0 };
          grouped[State][Year].injured += VictimsInjured;
          grouped[State][Year].killed += VictimsKilled;
        });

        // Build an array for each state containing sorted (by year) objects
        const finalData = Object.keys(grouped)
          .sort()
          .map((st) => {
            const yearsObj = grouped[st];
            const yearsArr = Object.keys(yearsObj)
              .sort((a, b) => +a - +b)
              .map((yearStr) => ({
                year: +yearStr,
                injured: yearsObj[yearStr].injured,
                killed: yearsObj[yearStr].killed,
              }));

            return {
              state: st,
              data: yearsArr,
            };
          });

        setStateData(finalData);
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  }, []);

  // Configure chart layout options
  const layout = {
    autosize: true,
    showlegend: true,
    // ... rest of layout configuration
  };

  return (
    <div className="relative min-h-screen p-6 pb-32 bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400">
      {/* Page Title */}
      <h1 className="mb-8 text-4xl font-extrabold tracking-wider text-center">
        <div className="inline-flex items-center gap-4 p-4 rounded-lg justify-baseline ">
          <FaMapLocationDot className="text-5xl text-blue-800" />
          <span className="text-3xl font-bold tracking-widest text-gray-800 drop-shadow-md">
            Victims Analysis Over the Years{" "}
            <span className="text-blue-800">[2014 - 2022]</span>
          </span>
        </div>
      </h1>

      {/* Grid of small charts */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {stateData.map(({ state, data }) => (
          <div
            key={state}
            className="p-5 transition-all duration-300 transform border border-gray-400 shadow-lg bg-gradient-to-br from-white via-blue-100 to-gray-100 rounded-3xl hover:shadow-2xl hover:scale-105"
          >
            {/* Chart Title */}
            <h2 className="flex items-center justify-center mb-3 font-extrabold tracking-wide text-transparent text-gray-900 uppercase text-md bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text">
              <FaMapMarkerAlt className="mr-2 text-blue-600 text-md" />
              {state}
            </h2>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 15, left: -30, bottom: 10 }} // Further adjusted left margin to shift chart left
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "#555", fontSize: 12 }}
                    stroke="#bbb"
                  />
                  <YAxis tick={{ fill: "#555", fontSize: 12 }} stroke="#bbb" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    iconSize={14}
                    wrapperStyle={{
                      margin: "auto", // Centers the legend horizontally
                      width: "100%", // Ensures it takes full width to allow centering
                      textAlign: "center", // Ensures text is centered
                      paddingLeft: "75px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="injured"
                    name="Injured"
                    stroke="#1E90FF"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="killed"
                    name="Killed"
                    stroke="#FF4136"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <VisualizationMenu isVisible={menuVisible} />
      <ToggleButton toggleVisibility={toggleVisibility} />
    </div>
  );
}

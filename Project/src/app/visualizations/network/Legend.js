"use client";

import { useState } from "react";
import RoomIcon from "@mui/icons-material/Room";
import { states } from "../../../../public/data/states";

export default function Legend({ viewType, setViewType, applySettings }) {
  const [activeTab, setActiveTab] = useState("legend");

  const legendData = {
    fatal: [
      { color: "#ffedea", label: "Victims Killed (1-5)" },
      { color: "#ffcec5", label: "Victims Killed (6-10)" },
      { color: "#ffad9f", label: "Victims Killed (11-20)" },
      { color: "#ff6f5e", label: "Victims Killed (21-50)" },
      { color: "#ff1100", label: "Victims Killed (51+)" },
    ],
    injured: [
      { color: "#edf8fb", label: "Victims Injured (1-5)" },
      { color: "#cce5ff", label: "Victims Injured (6-10)" },
      { color: "#99c2ff", label: "Victims Injured (11-20)" },
      { color: "#6699ff", label: "Victims Injured (21-50)" },
      { color: "#0033cc", label: "Victims Injured (51+)" },
    ],
  };

  return (
    <div className="fixed max-h-full p-4 text-white bg-gray-900 rounded-lg shadow-lg top-2 left-2 bg-opacity-90 w-80">
      <h2 className="mb-3 text-2xl font-bold text-center">Explore</h2>

      <div className="flex mb-3 space-x-2">
        <button
          onClick={() => setViewType("fatal")}
          className={`flex items-center justify-center w-1/2 p-3 text-lg font-semibold rounded transition-all outline-none ${
            viewType === "fatal"
              ? "bg-gray-100 text-gray-800 shadow-inner"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          <span className="pr-2 text-2xl text-red-500">
            <RoomIcon />
          </span>
          Fatal
        </button>

        <button
          onClick={() => setViewType("injured")}
          className={`flex items-center justify-center w-1/2 p-3 text-lg font-semibold rounded transition-all outline-none ${
            viewType === "injured"
              ? "bg-gray-100 text-gray-800 shadow-inner"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          <span className="pr-2 text-2xl text-blue-500">
            <RoomIcon />
          </span>
          Nonfatal
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-3 space-x-2">
        <button
          onClick={() => setActiveTab("legend")}
          className={`w-1/2 p-2 font-semibold rounded outline-none ${
            activeTab === "legend"
              ? "bg-gray-100 text-gray-800 shadow-inner"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          View Legend
        </button>

        <button
          onClick={() => setActiveTab("filters")}
          className={`w-1/2 p-2 font-semibold rounded outline-none ${
            activeTab === "filters"
              ? "bg-gray-100 text-gray-800 shadow-inner"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          View Filters
        </button>
      </div>

      {/* Legend Tab */}
      {activeTab === "legend" && (
        <div>
          <div className="p-3 mb-4 text-lg font-semibold text-center bg-gray-700 rounded">
            Legend Details
          </div>
          <div className="space-y-3 text-base text-gray-200">
            {legendData[viewType].map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-12 h-4 rounded-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="ml-3">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Tab */}
      {activeTab === "filters" && (
        <div className="space-y-4">
          {/* Date Range with two columns */}
          <div className="flex flex-col">
            {/* <label className="mb-1 text-sm font-semibold text-gray-300">
              Date Range:
            </label> */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-300">
                  From
                </label>
                <input
                  type="date"
                  className="w-full h-10 p-2 text-sm text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded outline-none focus:bg-gray-600"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold text-gray-300">
                  To
                </label>
                <input
                  type="date"
                  className="w-full h-10 p-2 text-sm text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded outline-none focus:bg-gray-600"
                />
              </div>
            </div>
          </div>

          {/* State Dropdown */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-300">
              State:
            </label>
            <select className="w-full h-10 p-2 text-sm text-white bg-gray-700 border border-gray-600 rounded outline-none focus:bg-gray-600 custom-scrollbar">
              <option value="">All States</option>
              {Object.entries(states).map(([abbr, name]) => (
                <option key={abbr} value={abbr} className="hover:bg-gray-600">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* City Input */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-300">
              City:
            </label>
            <input
              type="text"
              className="w-full h-10 p-2 text-sm text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded outline-none focus:bg-gray-600"
              placeholder="Enter city name"
            />
          </div>

          {/* Sliders */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-300">
              Link Strength:
            </label>
            <input
              type="range"
              className="w-full h-1 bg-gray-600 rounded-lg outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-300">
              Collide Force:
            </label>
            <input
              type="range"
              className="w-full h-1 bg-gray-600 rounded-lg outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-300">
              Charge Force:
            </label>
            <input
              type="range"
              className="w-full h-1 bg-gray-600 rounded-lg outline-none"
            />
          </div>

          {/* Apply Filters Button */}
          <button className="w-full px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded outline-none hover:bg-red-700">
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}

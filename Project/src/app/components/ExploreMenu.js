"use client";

import { useContext, useState } from "react";
import { MapContext } from "../context/MapContext";
import StateSummary from "./StateSummary";
import RoomIcon from "@mui/icons-material/Room";
import SearchIcon from "@mui/icons-material/Search";
import { states } from "../../../public/data/states";

export default function ExploreMenu({ isVisible }) {
  const {
    map,
    incidentMarkers,
    selectedCategory,
    setSelectedCategory,

    setSelectedStateName,
  } = useContext(MapContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = Object.entries(states).filter(
        ([abbr, fullName]) =>
          abbr.toLowerCase().includes(query.toLowerCase()) ||
          fullName.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleStateSelection = (stateName) => {
    setSearchQuery(stateName);
    setSuggestions([]);

    // NEW: store that state in MapContext
    setSelectedStateName(stateName);

    if (map && incidentMarkers.length > 0) {
      const stateIncidents = incidentMarkers.filter(
        (m) => m.state === stateName
      );
      if (stateIncidents.length > 0) {
        map.setCenter(stateIncidents[0].position);
        map.setZoom(6);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length === 1) {
      handleStateSelection(suggestions[0][1]);
    }
  };

  return (
    <div
      className={`absolute max-h-full p-3 text-white bg-gray-900 rounded-lg top-2 left-2 bg-opacity-90 transition-opacity duration-500 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <h2 className="mb-2 text-2xl font-bold text-center">Explore</h2>

      {/* Category buttons */}
      <div className="flex mb-2 space-x-2">
        <button
          onClick={() => setSelectedCategory("Fatal")}
          className={`flex items-baseline justify-center w-3/4 p-3 text-lg font-semibold rounded
            ${
              selectedCategory === "Fatal"
                ? "bg-white text-neutral-950"
                : "bg-gray-700 text-white"
            }
          `}
        >
          <span className="pr-2 text-2xl text-red-500">
            <RoomIcon />
          </span>
          Fatal
        </button>

        <button
          onClick={() => setSelectedCategory("Nonfatal")}
          className={`flex items-baseline justify-center w-3/4 p-3 text-lg font-semibold rounded
            ${
              selectedCategory === "Nonfatal"
                ? "bg-white text-neutral-950"
                : "bg-gray-700 text-white"
            }
          `}
        >
          <span className="pr-2 text-2xl text-yellow-500">
            <RoomIcon />
          </span>
          Nonfatal
        </button>
      </div>

      <button
        onClick={() => setSelectedCategory("All")}
        className={`w-full p-3 mb-2 text-lg font-semibold rounded
          ${
            selectedCategory === "All"
              ? "bg-white text-neutral-950"
              : "bg-gray-700 text-white"
          }
        `}
      >
        All Datapoints
      </button>

      <div className="relative">
        <input
          type="text"
          placeholder="Look up a State"
          className="relative w-full p-3 pr-10 text-white placeholder-gray-400 bg-gray-700 rounded focus:outline-none"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <SearchIcon className="absolute text-white right-3 top-3" />
        {suggestions.length > 0 && (
          <ul className="w-full mt-2 overflow-y-auto bg-gray-700 rounded shadow-lg max-h-[360px] custom-scrollbar">
            {suggestions.map(([abbr, fullName]) => (
              <li
                key={abbr}
                className="p-2 cursor-pointer hover:bg-gray-600"
                onClick={() => handleStateSelection(fullName)}
              >
                {fullName} ({abbr})
              </li>
            ))}
          </ul>
        )}
      </div>

      <StateSummary />
    </div>
  );
}

"use client";

import RoomIcon from "@mui/icons-material/Room";

export default function Legend({ viewType, setViewType }) {
  // Updated to match the corrected intervals for each category
  const legendData = {
    fatal: [
      { color: "#ffedea", label: "Risk Level (1-20)" },
      { color: "#ffcec5", label: "Risk Level (20-50)" },
      { color: "#ffad9f", label: "Risk Level (50-100)" },
      { color: "#ff6f5e", label: "Risk Level (100-200)" },
      { color: "#ff3f2e", label: "Risk Level (200-500)" },
      { color: "#ff1100", label: "Risk Level (>500)" },
    ],
    injured: [
      { color: "#edf8fb", label: "Injuries (1-20)" },
      { color: "#cce5ff", label: "Injuries (20-50)" },
      { color: "#99c2ff", label: "Injuries (50-100)" },
      { color: "#6699ff", label: "Injuries (100-200)" },
      { color: "#3366ff", label: "Injuries (200-500)" },
      { color: "#0033cc", label: "Injuries (>500)" },
    ],
  };

  return (
    <div className="absolute max-h-full p-4 text-white bg-gray-900 rounded-lg shadow-lg top-2 left-2 bg-opacity-90">
      <h2 className="mb-3 text-2xl font-bold text-center">Legend</h2>

      <div className="flex mb-3 space-x-2">
        <button
          onClick={() => setViewType("fatal")}
          className={`flex items-center justify-center w-3/4 p-3 text-lg font-semibold rounded transition-all
            ${
              viewType === "fatal"
                ? "bg-gray-100 text-gray-800 shadow-inner"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }
          `}
        >
          <span className="pr-2 text-2xl text-red-500">
            <RoomIcon />
          </span>
          Fatal
        </button>

        <button
          onClick={() => setViewType("injured")}
          className={`flex items-center justify-center w-3/4 p-3 text-lg font-semibold rounded transition-all
            ${
              viewType === "injured"
                ? "bg-gray-100 text-gray-800 shadow-inner"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }
          `}
        >
          <span className="pr-2 text-2xl text-blue-500">
            <RoomIcon />
          </span>
          Nonfatal
        </button>
      </div>

      <div className="p-3 mb-4 text-lg font-semibold text-center bg-gray-700 rounded">
        Legend Details
      </div>

      <div className="space-y-3 text-gray-200">
        {legendData[viewType].map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-12 h-4 rounded-sm"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="ml-3 text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

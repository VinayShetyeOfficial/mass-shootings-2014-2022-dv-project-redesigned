"use client";

import RoomIcon from "@mui/icons-material/Room";

export default function Legend({ viewType, setViewType }) {
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
          <span className="pr-2 text-2xl text-yellow-500">
            <RoomIcon />
          </span>
          Nonfatal
        </button>
      </div>

      <div className="p-3 mb-4 text-lg font-semibold text-center bg-gray-700 rounded">
        Legend Details
      </div>

      <div className="space-y-3 text-gray-200">
        <div className="flex items-center">
          <div
            className={`w-12 h-4 rounded-sm ${
              viewType === "fatal" ? "bg-red-200" : "bg-blue-200"
            }`}
          ></div>
          <span className="ml-3 text-sm">
            {viewType === "fatal" ? "Low Risk (0-50)" : "Low Injuries (0-50)"}
          </span>
        </div>
        <div className="flex items-center">
          <div
            className={`w-12 h-4 rounded-sm ${
              viewType === "fatal" ? "bg-red-400" : "bg-blue-400"
            }`}
          ></div>
          <span className="ml-3 text-sm">
            {viewType === "fatal"
              ? "Moderate Risk (50-150)"
              : "Moderate Injuries (50-150)"}
          </span>
        </div>
        <div className="flex items-center">
          <div
            className={`w-12 h-4 rounded-sm ${
              viewType === "fatal" ? "bg-red-600" : "bg-blue-600"
            }`}
          ></div>
          <span className="ml-3 text-sm">
            {viewType === "fatal"
              ? "High Risk (150+)"
              : "Severe Injuries (150+)"}
          </span>
        </div>
      </div>
    </div>
  );
}

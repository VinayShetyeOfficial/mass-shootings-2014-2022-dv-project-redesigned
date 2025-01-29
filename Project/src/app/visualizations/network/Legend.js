"use client";

import { useState } from "react";
import RoomIcon from "@mui/icons-material/Room";
import { states } from "../../../../public/data/states";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Legend({
  viewType,
  setViewType,
  applySettings,
  onDateRangeChange,
}) {
  const [activeTab, setActiveTab] = useState("legend");
  const minSelectableDate = new Date(Date.UTC(2014, 0, 1)); // Jan 1, 2014
  const maxSelectableDate = new Date(Date.UTC(2022, 11, 31)); // Dec 31, 2022

  const [startDate, setStartDate] = useState(() => {
    return new Date(Date.UTC(2014, 0, 1, 0, 0, 0, 0));
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date(Date.UTC(2022, 11, 31, 23, 59, 59, 999));
  });

  // Initialize temp dates with the same values
  const [tempStartDate, setTempStartDate] = useState(() => {
    return new Date(Date.UTC(2014, 0, 1, 0, 0, 0, 0));
  });

  const [tempEndDate, setTempEndDate] = useState(() => {
    return new Date(Date.UTC(2022, 11, 31, 23, 59, 59, 999));
  });

  const handleDateChange = (dates) => {
    const [start, end] = dates;

    if (start && end) {
      // Create UTC dates
      const utcStart = new Date(
        Date.UTC(
          start.getFullYear(),
          start.getMonth(),
          start.getDate(),
          0,
          0,
          0,
          0
        )
      );

      const utcEnd = new Date(
        Date.UTC(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
          23,
          59,
          59,
          999
        )
      );

      setStartDate(utcStart);
      setEndDate(utcEnd);
      onDateRangeChange(utcStart, utcEnd);
    } else {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const handleApplyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    onDateRangeChange(tempStartDate, tempEndDate);
  };

  const legendData = {
    fatal: [
      {
        icon: (
          <svg width="45" height="45" className="inline-block">
            <circle
              cx="22.5"
              cy="22.5"
              r="22.5"
              fill="black"
              stroke="white"
              strokeWidth="3"
            />
            <circle
              cx="22.5"
              cy="22.5"
              r="18"
              fill="black"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="22.5"
              y="28"
              fontSize="12"
              fill="#00ffff"
              textAnchor="middle"
              fontWeight="bold"
            >
              St
            </text>
          </svg>
        ),
        label: "State Node",
        sublabel: "Size ∝ Total Victims",
      },
      {
        icon: (
          <svg width="24" height="24" className="inline-block">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="black"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="8" fill="#EF4444" />
          </svg>
        ),
        label: "Local Node",
        sublabel: "Size ∝ Local Impact",
      },
      {
        icon: (
          <svg width="50" height="30" className="inline-block">
            <rect x="0" y="0" width="50" height="30" fill="#111827" />
            <line
              x1="5"
              y1="15"
              x2="45"
              y2="15"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        ),
        label: "Interstate Link",
        sublabel: "Width ∝ Correlation",
      },
      {
        icon: (
          <svg width="50" height="30" className="inline-block">
            <rect x="0" y="0" width="50" height="30" fill="#111827" />
            <line
              x1="5"
              y1="15"
              x2="45"
              y2="15"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        ),
        label: "Local Link",
        sublabel: "Jurisdiction",
      },
    ],
    injured: [
      {
        icon: (
          <svg width="45" height="45" className="inline-block">
            <circle
              cx="22.5"
              cy="22.5"
              r="22.5"
              fill="black"
              stroke="white"
              strokeWidth="3"
            />
            <circle
              cx="22.5"
              cy="22.5"
              r="18"
              fill="black"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="22.5"
              y="28"
              fontSize="12"
              fill="#00ffff"
              textAnchor="middle"
              fontWeight="bold"
            >
              St
            </text>
          </svg>
        ),
        label: "State Node",
        sublabel: "Size ∝ Total Victims",
      },
      {
        icon: (
          <svg width="24" height="24" className="inline-block">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="black"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="8" fill="#3B82F6" />
          </svg>
        ),
        label: "Local Node",
        sublabel: "Size ∝ Local Impact",
      },
      {
        icon: (
          <svg width="50" height="30" className="inline-block">
            <rect x="0" y="0" width="50" height="30" fill="#111827" />
            <line
              x1="5"
              y1="15"
              x2="45"
              y2="15"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
        ),
        label: "Interstate Link",
        sublabel: "Width ∝ Correlation",
      },
      {
        icon: (
          <svg width="50" height="30" className="inline-block">
            <rect x="0" y="0" width="50" height="30" fill="#111827" />
            <line
              x1="5"
              y1="15"
              x2="45"
              y2="15"
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
        ),
        label: "Local Link",
        sublabel: "Jurisdiction",
      },
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
          <div className="p-4 space-y-4 text-base bg-white rounded-lg">
            {legendData[viewType].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-16 text-center">
                  {typeof item.icon === "string" ? (
                    <span className="font-mono text-xl text-gray-800">
                      {item.icon}
                    </span>
                  ) : (
                    item.icon
                  )}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-700">{item.sublabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Tab */}
      {activeTab === "filters" && (
        <div>
          <div className="p-3 mb-4 text-lg font-semibold text-center bg-gray-700 rounded">
            Date Range Filter
          </div>
          <div className="p-4 space-y-4 bg-white rounded-lg">
            <div className="flex flex-col space-y-4">
              {/* From Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-800">
                  From Date:
                </label>
                <DatePicker
                  selected={tempStartDate}
                  onChange={(date) => {
                    setTempStartDate(date);
                  }}
                  className="w-full p-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="MM/dd/yyyy"
                  minDate={minSelectableDate}
                  maxDate={tempEndDate}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={9}
                  placeholderText="Select start date"
                  openToDate={minSelectableDate}
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-800">
                  To Date:
                </label>
                <DatePicker
                  selected={tempEndDate}
                  onChange={(date) => {
                    setTempEndDate(date);
                  }}
                  className="w-full p-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dateFormat="MM/dd/yyyy"
                  minDate={tempStartDate}
                  maxDate={maxSelectableDate}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={9}
                  placeholderText="Select end date"
                  openToDate={maxSelectableDate}
                />
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyFilter}
                className="w-full px-4 py-2 font-semibold text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-0 active:ring-0"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

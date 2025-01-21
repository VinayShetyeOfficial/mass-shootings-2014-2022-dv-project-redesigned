"use client";

import { useContext } from "react";
import { MapContext } from "../context/MapContext";

export default function YearSelector({ isVisible }) {
  const { selectedYear, setSelectedYear } = useContext(MapContext);
  const years = ["All", 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

  return (
    <div
      className={`absolute flex p-4 space-x-2 transform -translate-x-1/2 bg-gray-900 rounded-lg bottom-2 left-1/2 bg-opacity-80 transition-opacity duration-500 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {years.map((year) => (
        <button
          key={year}
          className={`py-2 px-4 rounded text-lg font-semibold ${
            selectedYear === year ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
          onClick={() => setSelectedYear(year)}
        >
          {year}
        </button>
      ))}
    </div>
  );
}

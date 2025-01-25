"use client";
import { useContext } from "react";
import { MapContext } from "../context/MapContext";

export default function ResetZoomButton() {
  const { map } = useContext(MapContext);

  const handleResetZoom = () => {
    if (map) {
      map.setZoom(4.8);
      map.setCenter({ lat: 38.5, lng: -100.55 });
    }
  };

  return (
    <button
      onClick={handleResetZoom}
      className="fixed px-6 py-3 text-lg font-bold text-white transition-all duration-300 rounded-lg bottom-2 right-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:outline-none"
    >
      Reset Zoom
    </button>
  );
}

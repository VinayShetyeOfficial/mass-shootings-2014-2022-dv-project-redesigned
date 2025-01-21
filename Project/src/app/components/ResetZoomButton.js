"use client";
import { useContext } from "react";
import { MapContext } from "../context/MapContext";

export default function ResetZoomButton() {
  const { map } = useContext(MapContext);

  const handleResetZoom = () => {
    if (map) {
      // Reset to the same center & zoom used in MapComponent
      map.setZoom(4.8);
      map.setCenter({ lat: 38.5, lng: -100.55 });
    }
  };

  return (
    <button
      onClick={handleResetZoom}
      className="absolute px-6 py-3 text-lg font-bold text-white bg-red-600 rounded-lg shadow-lg bottom-2 right-2"
    >
      Reset Zoom
    </button>
  );
}

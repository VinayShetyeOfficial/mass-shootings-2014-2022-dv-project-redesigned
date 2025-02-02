"use client";
import { useContext, useState } from "react";
import { MapContext } from "../context/MapContext";

// Default zoom level for reset
const DEFAULT_ZOOM = 4.3;

// Default center coordinates (USA)
const DEFAULT_CENTER = { lat: 38.5, lng: -100.5 };

/**
 * Button component to reset map zoom level.
 * Returns view to default zoom and center position.
 *
 * Props:
 * - onClick: function - Handler for reset action
 * - disabled: boolean - Button disabled state
 */
export default function ResetZoomButton() {
  const { map } = useContext(MapContext);

  // Track button disabled state
  const [isDisabled, setIsDisabled] = useState(false);

  // Handle zoom reset action
  const handleReset = () => {
    console.log("Reset button clicked"); // Debug log
    if (map) {
      console.log("Resetting map"); // Debug log
      map.setZoom(DEFAULT_ZOOM);
      map.setCenter(DEFAULT_CENTER);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isDisabled}
      className="fixed px-6 py-3 text-lg font-bold text-white transition-all duration-300 rounded-lg bottom-2 right-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:outline-none"
    >
      Reset Zoom
    </button>
  );
}

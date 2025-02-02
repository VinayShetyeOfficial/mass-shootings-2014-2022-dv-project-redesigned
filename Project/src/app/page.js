// src/app/page.js

"use client";

import { useContext, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MapComponent from "./components/MapComponent";
import ExploreMenu from "./components/ExploreMenu";
import VisualizationMenu from "./components/VisualizationMenu";
import YearSelector from "./components/YearSelector";
import ResetZoomButton from "./components/ResetZoomButton";
import ToggleButton from "./components/ToggleButton";
import { MapContext } from "./context/MapContext";

/**
 * Main page component for the application.
 * Renders the map interface and controls.
 *
 * Features:
 * - Google Maps integration
 * - Menu controls
 * - Year selection
 * - Loading state management
 */

// Dynamically import Loader with no SSR
const Loader = dynamic(() => import("./components/Loader"), { ssr: false });

export default function MainPage() {
  const [menuVisible, setMenuVisible] = useState(true);
  const { isMapLoaded } = useContext(MapContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only hide loader when map is loaded
    if (isMapLoaded) {
      setIsLoading(false);
    }
  }, [isMapLoaded]);

  const toggleVisibility = () => {
    setMenuVisible((prev) => !prev);
  };

  return (
    <div className="relative">
      {isLoading && <Loader />}
      <MapComponent />
      {isMapLoaded && (
        <>
          <ExploreMenu isVisible={menuVisible} />
          <VisualizationMenu isVisible={menuVisible} />
          <YearSelector isVisible={menuVisible} />
          <ResetZoomButton />
          <ToggleButton toggleVisibility={toggleVisibility} />
        </>
      )}
    </div>
  );
}

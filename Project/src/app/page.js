// src/app/page.js

"use client";

import { useContext, useState, Suspense } from "react";
import MapComponent from "./components/MapComponent";
import ExploreMenu from "./components/ExploreMenu";
import VisualizationMenu from "./components/VisualizationMenu";
import YearSelector from "./components/YearSelector";
import ResetZoomButton from "./components/ResetZoomButton";
import ToggleButton from "./components/ToggleButton";
import Loader from "./components/Loader"; // Correct import
import { MapContext } from "./context/MapContext";

export default function MainPage() {
  const [menuVisible, setMenuVisible] = useState(true);
  const { isMapLoaded } = useContext(MapContext);

  const toggleVisibility = () => {
    setMenuVisible((prev) => !prev);
  };

  return (
    <div className="relative">
      <Suspense fallback={<div />}>{!isMapLoaded && <Loader />}</Suspense>
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

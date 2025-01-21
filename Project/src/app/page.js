"use client";
import { useState } from "react";
import MapComponent from "./components/MapComponent";
import ExploreMenu from "./components/ExploreMenu";
import VisualizationMenu from "./components/VisualizationMenu";
import YearSelector from "./components/YearSelector";
import ResetZoomButton from "./components/ResetZoomButton";
import ToggleButton from "./components/ToggleButton";

export default function MainPage() {
  const [menuVisible, setMenuVisible] = useState(true);

  const toggleVisibility = () => {
    setMenuVisible((prev) => !prev);
  };

  return (
    <div className="relative">
      <MapComponent />
      {/* We pass isVisible to menus, so they can fade in/out */}
      <ExploreMenu isVisible={menuVisible} />
      <VisualizationMenu isVisible={menuVisible} />
      <YearSelector isVisible={menuVisible} />
      <ResetZoomButton />
      <ToggleButton toggleVisibility={toggleVisibility} />
    </div>
  );
}

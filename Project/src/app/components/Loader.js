// src/app/components/Loader.js

"use client";

import React, { useRef, useEffect } from "react";
import Globe from "react-globe.gl";
import { motion } from "framer-motion";

export default function Loader() {
  const globeEl = useRef();

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();

      // Disable user interactions
      controls.enableZoom = false;
      controls.enableRotate = false;

      // Enable auto-rotation with a smooth speed
      controls.autoRotate = true;
      controls.autoRotateSpeed = -15; // Adjusted for smoother spinning

      // Set initial camera point of view to standard position
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2 }, 0); // Instant transition
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(45,45,45,0.9)]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <motion.div
        className="globe-container"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 7, ease: "linear" }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundColor="rgba(0,0,0,0)"
          rotateLat={0} // Ensures initial latitude rotation is 0
          rotateLng={0} // Ensures initial longitude rotation is 0
          width={200}
          height={200}
          enablePointerInteraction={false}
          disableGlobeMaterial={false} // Enable globe material for better visuals
        />
      </motion.div>
    </div>
  );
}

// src/app/components/Loader.js

"use client";

import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import { motion } from "framer-motion";

/**
 * Loading indicator component.
 * Displays during data fetching and processing operations.
 *
 * Props:
 * - size: string - Size of the loader
 * - color: string - Color of the loader
 */

export default function Loader() {
  const globeEl = useRef();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();

      // Disable user interactions
      controls.enableZoom = false;
      controls.enableRotate = false;

      // Enable auto-rotation with a much smoother speed
      controls.autoRotate = true;
      controls.autoRotateSpeed = -20; // Reduced speed for smoother rotation

      // Set initial camera point of view with slight tilt for more dynamic look
      globeEl.current.pointOfView({ lat: 5, lng: 0, altitude: 2.2 }, 0);
    }

    // Random timeout between 12-15 seconds
    const timeout = Math.floor(Math.random() * (15000 - 12000 + 1) + 12000);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

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
        transition={{
          duration: 12, // Longer duration for smoother scale
          ease: [0.34, 1.56, 0.64, 1], // Custom easing for very smooth animation
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundColor="rgba(0,0,0,0)"
          rotateLat={0}
          rotateLng={0}
          width={200}
          height={200}
          enablePointerInteraction={false}
          disableGlobeMaterial={false}
          atmosphereColor="rgb(65,132,244)"
          atmosphereAltitude={0.25} // Increased glow effect
        />
      </motion.div>
    </div>
  );
}

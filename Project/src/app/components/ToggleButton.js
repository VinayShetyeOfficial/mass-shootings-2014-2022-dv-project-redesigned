"use client";
import { useState } from "react";

export default function ToggleButton({ toggleVisibility }) {
  return (
    <button
      onClick={toggleVisibility}
      className="absolute px-6 py-3 text-lg font-bold text-white transition-transform duration-500 bg-blue-600 rounded-lg shadow-lg bottom-2 left-2"
    >
      Toggle Menu
    </button>
  );
}

"use client";
import { useState } from "react";

export default function ToggleButton({ toggleVisibility }) {
  return (
    <button
      onClick={toggleVisibility}
      className="fixed px-6 py-3 text-lg font-bold text-white transition-all duration-300 rounded-lg bottom-2 left-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:outline-none"
    >
      Toggle Menu
    </button>
  );
}

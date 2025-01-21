"use client";

export default function VisualizationMenu({ isVisible }) {
  return (
    <div
      className={`absolute p-3 text-white bg-gray-900 rounded-lg top-2 right-2 bg-opacity-90 transition-opacity duration-500 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <h2 className="mb-2 text-2xl font-bold text-center">Visualizations</h2>
      <a
        href="/choropleth"
        className="block p-3 mb-2 text-lg font-semibold text-center bg-gray-700 rounded"
      >
        Choropleth Maps
      </a>
      <a
        href="/network-fatal"
        className="block p-3 mb-2 text-lg font-semibold text-center bg-gray-700 rounded"
      >
        Network (Fatal)
      </a>
      <a
        href="/network-nonfatal"
        className="block p-3 mb-2 text-lg font-semibold text-center bg-gray-700 rounded"
      >
        Network (Non-Fatal)
      </a>
      <a
        href="/line-charts"
        className="block p-3 mb-2 text-lg font-semibold text-center bg-gray-700 rounded"
      >
        Line Charts
      </a>
      <a
        href="/heatmap"
        className="block p-3 text-lg font-semibold text-center bg-gray-700 rounded"
      >
        Heatmap
      </a>
    </div>
  );
}

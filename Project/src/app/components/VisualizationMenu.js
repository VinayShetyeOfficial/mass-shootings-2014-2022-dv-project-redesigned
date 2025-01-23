"use client";

export default function VisualizationMenu({ isVisible }) {
  return (
    <div
      className={`absolute p-4 text-white bg-gray-900 rounded-lg top-2 right-2 bg-opacity-90 transition-all duration-500 ${
        isVisible
          ? "opacity-100 visible scale-100"
          : "opacity-0 invisible scale-95"
      }`}
    >
      <h2 className="mb-3 text-2xl font-bold tracking-wide text-center text-gray-200">
        Visualizations
      </h2>

      <nav className="space-y-2">
        <a
          href="/visualizations/choropleth"
          className="block p-4 text-lg font-semibold text-center transition-all duration-300 bg-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:outline-none"
        >
          Choropleth Maps
        </a>

        <a
          href="/visualizations/network"
          className="block p-4 text-lg font-semibold text-center transition-all duration-300 bg-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:outline-none"
        >
          Network (Fatal)
        </a>

        <a
          href="/visualizations/network"
          className="block p-4 text-lg font-semibold text-center transition-all duration-300 bg-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:outline-none"
        >
          Network (Non-Fatal)
        </a>

        <a
          href="/visualizations/line-charts"
          className="block p-4 text-lg font-semibold text-center transition-all duration-300 bg-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:outline-none"
        >
          Line Charts
        </a>

        <a
          href="/visualizations/heatmap"
          className="block p-4 text-lg font-semibold text-center transition-all duration-300 bg-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:outline-none"
        >
          Heatmap
        </a>
      </nav>
    </div>
  );
}

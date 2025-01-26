"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function VisualizationMenu({ isVisible }) {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname);

  // Define the available pages with the correct order
  const pages = [
    { name: "Choropleth", path: "/visualizations/choropleth" },
    { name: "Network", path: "/visualizations/network" },
    // { name: "Network (Non-Fatal)", path: "/visualizations/network" },
    { name: "Line Charts", path: "/visualizations/line-charts" },
    { name: "Heatmap", path: "/visualizations/heatmap" },
  ];

  // Conditionally add "Geo Plot" only if not on the homepage
  if (currentPath !== "/") {
    pages.unshift({ name: "Geo Plot", path: "/" });
  }

  // Helper function to normalize paths by removing trailing slashes
  function normalizePath(path) {
    return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  }

  // Filter out the current page
  const filteredPages = pages.filter(
    (page) => normalizePath(page.path) !== currentPath
  );

  return (
    <div
      className={`fixed p-4 text-white bg-gray-900 rounded-lg top-2 right-2 bg-opacity-90 transition-all duration-500 ${
        isVisible
          ? "opacity-100 visible scale-100"
          : "opacity-0 invisible scale-95"
      }`}
    >
      <h2 className="mb-3 text-2xl font-bold tracking-wide text-center text-gray-200">
        Visualizations
      </h2>

      <nav className="space-y-2">
        {filteredPages.map((page) => (
          <Link
            key={page.name}
            href={page.path}
            className="block p-4 text-lg font-semibold text-center transition-all duration-300 bg-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 focus:outline-none"
          >
            {page.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

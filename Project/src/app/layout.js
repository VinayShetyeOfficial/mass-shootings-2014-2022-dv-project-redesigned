import "./globals.css";
import { MapProvider } from "./context/MapContext";

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Mass Shootings Visualization</title>
      </head>
      <body className="text-gray-900 bg-gray-200">
        <MapProvider>{children}</MapProvider>
      </body>
    </html>
  );
}

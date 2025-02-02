import "./globals.css";
import { MapProvider } from "./context/MapContext";

/**
 * Root layout component that wraps the entire application.
 * Provides MapContext provider and basic HTML structure.
 *
 * Props:
 * - children: ReactNode - Child components to render
 */

// Global context providers setup
const Providers = ({ children }) => {
  return <MapProvider>{children}</MapProvider>;
};

// Apply global styles and theme
const globalStyles = {
  // Theme configuration
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon_io/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon_io/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon_io/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <title>Mass Shootings Visualization</title>
      </head>
      <body className="text-gray-900 bg-gray-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

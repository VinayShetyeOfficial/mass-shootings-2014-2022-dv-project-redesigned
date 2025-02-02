"use client";

/**
 * Geocoding utility functions.
 * Converts addresses to coordinates using Google Maps Geocoding API.
 *
 * Functions:
 * - getCoordinatesFromAddress: Converts address string to lat/lng
 */

/**
 * getCoordinatesFromAddress(address)
 * Uses the browser's google.maps.Geocoder to convert an address to { lat, lng }.
 * Returns null if unsuccessful.
 */
export async function getCoordinatesFromAddress(address) {
  if (typeof window === "undefined" || !window.google || !window.google.maps) {
    console.error(
      "Google Maps JavaScript API not loaded or window not available"
    );
    return null;
  }

  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        resolve({ lat: lat(), lng: lng() });
      } else {
        console.warn(
          `Geocoding failed for address "${address}" with status: ${status}`
        );
        resolve(null);
      }
    });
  });
}

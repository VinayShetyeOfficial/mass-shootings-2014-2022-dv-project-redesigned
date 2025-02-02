/**
 * Utility functions for processing mass shooting incident data.
 * Handles CSV parsing, filtering, and data transformation.
 *
 * Functions:
 * - processCSVData: Processes raw CSV data with filters
 */

"use client";

import Papa from "papaparse";

/**
 * Processes CSV data and applies filters based on year and category.
 *
 * @param {string} csvText - Raw CSV data as string
 * @param {string} selectedYear - Year filter (default: "All")
 * @param {string} selectedCategory - Category filter (default: "All")
 * @returns {Promise<Array>} Array of processed incident data
 */
export async function processCSVData(
  csvText,
  selectedYear = "All",
  selectedCategory = "All"
) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        // Filter and transform data
        const processedData = result.data
          .filter((row) => {
            // Validate required fields
            if (
              !row["Incident ID"] ||
              !row["Latitude"] ||
              !row["Longitude"] ||
              !row["Incident Date"]
            ) {
              return false;
            }

            // Apply year filter
            const yearStr = row["Incident Date"].split(", ")[1]?.trim();
            const incidentYear = parseInt(yearStr, 10);

            if (
              selectedYear !== "All" &&
              incidentYear !== parseInt(selectedYear, 10)
            ) {
              return false;
            }

            // Apply category filter (Fatal/Nonfatal)
            const killedNum = parseInt(row["Victims Killed"] || "0", 10);
            const injuredNum = parseInt(row["Victims Injured"] || "0", 10);
            const isFatal = killedNum > 0;

            if (selectedCategory === "Fatal" && !isFatal) {
              return false;
            } else if (selectedCategory === "Nonfatal" && isFatal) {
              return false;
            }
            return true;
          })
          .map((row) => ({
            id: row["Incident ID"],
            state: row["State"] || "Unknown",
            fatal: parseInt(row["Victims Killed"] || "0", 10) > 0,
            killed: parseInt(row["Victims Killed"] || "0", 10),
            injured: parseInt(row["Victims Injured"] || "0", 10),
            position: {
              lat: parseFloat(row["Latitude"]),
              lng: parseFloat(row["Longitude"]),
            },
          }));

        resolve(processedData);
      },
      error: (err) => reject(err),
    });
  });
}

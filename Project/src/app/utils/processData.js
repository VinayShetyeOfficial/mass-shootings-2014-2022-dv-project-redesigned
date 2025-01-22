"use client";

import Papa from "papaparse";

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
        const processedData = result.data
          .filter((row) => {
            if (
              !row["Incident ID"] ||
              !row["Latitude"] ||
              !row["Longitude"] ||
              !row["Incident Date"]
            ) {
              return false;
            }

            const yearStr = row["Incident Date"].split(", ")[1]?.trim();
            const incidentYear = parseInt(yearStr, 10);

            if (
              selectedYear !== "All" &&
              incidentYear !== parseInt(selectedYear, 10)
            ) {
              return false;
            }

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
          .map((row) => {
            const killedNum = parseInt(row["Victims Killed"] || "0", 10);
            const injuredNum = parseInt(row["Victims Injured"] || "0", 10);

            return {
              id: row["Incident ID"],
              state: row["State"] || "Unknown",
              fatal: killedNum > 0,
              killed: killedNum, // NEW
              injured: injuredNum, // NEW
              position: {
                lat: parseFloat(row["Latitude"]),
                lng: parseFloat(row["Longitude"]),
              },
            };
          });

        resolve(processedData);
      },
      error: (err) => reject(err),
    });
  });
}

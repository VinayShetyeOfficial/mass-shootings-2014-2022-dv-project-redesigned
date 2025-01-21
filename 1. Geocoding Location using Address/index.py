import csv
import time
import requests
import urllib.parse

# --------------------------
#  CONFIGURATION
# --------------------------
API_KEY = "AIzaSyDw6PXaDcVBagYha9ywIieuE5rjV9g9Bsk"

# Input and output CSVs
input_csv = "mass_shootings_2014_2022.csv"
output_csv = "mass_shootings_geocoded.csv"

# How many times we retry a single address if there's a failure
MAX_RETRIES = 3

# Initial sleep (seconds) between geocoding calls to help prevent hitting rate limits
DELAY_BETWEEN_CALLS = 0.2

# --------------------------
#  GLOBAL CACHE
# --------------------------
# This dictionary caches address -> (lat, lng) to avoid re-calling the API for repeated addresses.
# It's all in-memory for now. If your CSV has duplicates, this can dramatically reduce calls.
address_cache = {}


def geocode_google(address):
    """
    Calls the Google Geocoding API for a single address string with basic retry logic.
    Returns (lat, lng) tuple or (None, None) on failure.
    """

    # If we've already geocoded this address, return immediately from the cache
    if address in address_cache:
        return address_cache[address]

    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": API_KEY
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"

    # Simple retry loop
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url).json()

            if resp["status"] == "OK" and len(resp["results"]) > 0:
                location = resp["results"][0]["geometry"]["location"]
                lat_lng = (location["lat"], location["lng"])
                address_cache[address] = lat_lng  # store in cache
                return lat_lng
            else:
                # If we got an explicit failure from Google
                print(f"[Attempt {attempt}/{MAX_RETRIES}] Geocoding failed for '{address}' - status={resp['status']}")
                
                # If it's something like OVER_QUERY_LIMIT or REQUEST_DENIED, you might want extra logic here
                # We'll just retry after a delay for now
                time.sleep(attempt * 1.0)  # exponential-ish backoff
        except Exception as e:
            print(f"[Attempt {attempt}/{MAX_RETRIES}] Request error for '{address}': {e}")
            time.sleep(attempt * 1.0)  # wait a bit, then retry

    # If we exhausted all retries, return None
    address_cache[address] = (None, None)
    return (None, None)


# --------------------------
#  MAIN CSV PROCESSING
# --------------------------
def main():
    with open(input_csv, "r", encoding="utf-8") as fin, open(output_csv, "w", newline="", encoding="utf-8") as fout:
        reader = csv.DictReader(fin)
        fieldnames = reader.fieldnames + ["Latitude", "Longitude"]
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()

        row_count = 0
        for row in reader:
            row_count += 1

            address = row.get("Address", "")
            city    = row.get("City Or County", "")
            state   = row.get("State", "")

            # Only geocode if we have enough address info
            if address.strip() and city.strip() and state.strip():
                full_address = f"{address}, {city}, {state}, USA"
                lat, lng = geocode_google(full_address)
                row["Latitude"] = lat
                row["Longitude"] = lng

                # Delay between calls to avoid triggering rate-limits
                # (Adjust or remove if you have higher daily quota or see fewer errors)
                time.sleep(DELAY_BETWEEN_CALLS)
            else:
                row["Latitude"] = ""
                row["Longitude"] = ""

            writer.writerow(row)

        print(f"\nDone geocoding {row_count} rows total. Wrote file: {output_csv}\n")


if __name__ == "__main__":
    main()

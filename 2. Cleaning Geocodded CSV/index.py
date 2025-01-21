import csv
import re

def fix_coord(coord_str, is_lat=True):
    """
    Converts a messy coordinate string like '-9.008.391.019.999.990' into a float.
    Steps:
      1) Keep only one leading minus sign, if present.
      2) Strip out everything but digits.
      3) Brute-force insert a decimal at different positions to find all valid candidates
         within ±90 (for lat) or ±180 (for lng).
      4) Pick the candidate with the GREATEST absolute value (still in range).
         This usually gives e.g. 29.9 instead of 2.9.
      5) Optionally multiply by 10 if that yields a valid candidate closer to typical US lat/lng.
    """

    if not coord_str or coord_str.strip() == '':
        return None

    # 1) Extract sign
    sign = 1
    stripped = coord_str.strip()
    if stripped.startswith('-'):
        sign = -1
        stripped = stripped[1:].strip()

    # 2) Remove all non-digits
    digits = re.sub(r'[^0-9]', '', stripped)
    if not digits:
        return None

    # 3) Try placing the decimal after i digits (1..6, etc.)
    candidates = []
    length = len(digits)
    for i in range(1, length):
        left = digits[:i]
        right = digits[i:]
        if not left or not right:
            continue
        val_str = left + '.' + right
        try:
            val = float(val_str) * sign
        except ValueError:
            continue
        
        # Check range
        if is_lat:
            if -90 <= val <= 90:
                candidates.append(val)
        else:
            if -180 <= val <= 180:
                candidates.append(val)
    
    if not candidates:
        return None

    # 4) Pick the candidate with the greatest absolute value
    best_val = max(candidates, key=abs)

    # 5) Additional fix:
    #    If best_val is < 10 in absolute value, but *10 is still in range, 
    #    then choose that. (e.g. 2.99 => 29.9)
    if is_lat:
        if abs(best_val) < 10 and abs(best_val * 10) <= 90:
            best_val *= 10
    else:
        if abs(best_val) < 10 and abs(best_val * 10) <= 180:
            best_val *= 10

    return best_val

# Adjust these paths to your own filenames:
input_file = "mass_shootings_geocoded.csv"
output_file = "mass_shootings_geocoded_cleaned.csv"

with open(input_file, "r", encoding="utf-8") as fin, \
     open(output_file, "w", newline="", encoding="utf-8") as fout:

    reader = csv.DictReader(fin)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(fout, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        raw_lat = row.get("Latitude", "")
        raw_lng = row.get("Longitude", "")

        lat = fix_coord(raw_lat, is_lat=True)
        lng = fix_coord(raw_lng, is_lat=False)

        if lat is not None and lng is not None:
            # Overwrite the CSV columns with our newly fixed coords
            row["Latitude"] = lat
            row["Longitude"] = lng
            writer.writerow(row)
        else:
            # If we can't fix them, skip
            pass

print(f"Cleaned coordinates written to {output_file}")

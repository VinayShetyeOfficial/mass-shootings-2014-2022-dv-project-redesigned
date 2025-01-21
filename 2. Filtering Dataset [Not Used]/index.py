import pandas as pd

# Load the dataset
file_path = './csv/mass_shootings_2014_2022.csv'
df = pd.read_csv(file_path)

# Convert 'Incident Date' to datetime format and extract year
df['Incident Date'] = pd.to_datetime(df['Incident Date'], errors='coerce')
df['Year'] = df['Incident Date'].dt.year

# Selecting relevant columns
filtered_df = df[['Incident ID', 'Year', 'State', 'City Or County', 'Victims Killed', 'Victims Injured']]

# Remove rows where both 'Victims Killed' and 'Victims Injured' are zero or missing
filtered_df = filtered_df.dropna(subset=['Victims Killed', 'Victims Injured'])
filtered_df = filtered_df[(filtered_df['Victims Killed'] > 0) | (filtered_df['Victims Injured'] > 0)]

# Save the filtered data to a new CSV file
filtered_csv_path = 'filtered_mass_shootings.csv'
filtered_df.to_csv(filtered_csv_path, index=False)

print(f'Filtered dataset saved to {filtered_csv_path}')

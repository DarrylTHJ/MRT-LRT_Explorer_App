import overpy           #Used for access Overpass API
import pandas as pd     #Used for organize the datas
import time             #Used for pause between time

api = overpy.Overpass()

# MRT KELANA JAYA LINES (29 lines)

station_names="Gombak|Taman Melati|Wangsa Maju|Sri Rampai|Setiawangsa|Jelatek|Dato'Keramat|Damai|Ampang Park|KLCC|Kampung Baru|Dang Wangi|Masjid Jamek|Pasar Seni|KL Sentral|Bangsar|Abdullah Hukum|Kerinchi|Universiti|Taman Jaya|Asia Jaya|Taman Paramount|Taman Bahagia|Kelana Jaya|Lembah Subang|Ara Damansara|Glenmarie|Subang Jaya|SS 15|SS18|USJ 7|Taipan|Wawasan|USJ21|Alam Megah|Subang Alam|Putra Heights"

query = f"""                
[out:json][timeout:180];
(
  node["railway"="station"]["name"~"{station_names}"];
  way["railway"="station"]["name"~"{station_names}"];
)->.stations;

(
  nwr(around.stations:500)["amenity"~"restaurant|cafe|fast_food|food_court"];
);
out center;
"""

def run_extraction():
    # Trying the main server and a high-capacity mirror
    endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]
    
    for url in endpoints:
        api = overpy.Overpass(url=url)
        try:
            print(f"Connecting to {url}...")
            return api.query(query)
        except Exception as e:
            print(f"Server {url} busy, trying next... Error: {e}")
            time.sleep(5)
    return None

response = run_extraction()

if response:
    data = []
    # Loop through everything found (Nodes, Ways, and Relations)
    for item in response.nodes + response.ways + response.relations:
        # Extract coordinates (ways/relations use 'center_lat' from the 'out center' command)
        lat = getattr(item, 'lat', getattr(item, 'center_lat', None))
        lon = getattr(item, 'lon', getattr(item, 'center_lon', None))
        
        data.append({
            "Name": item.tags.get("name", "Unnamed"),
            "Category": item.tags.get("amenity", "N/A"),
            "Cuisine": item.tags.get("cuisine", "N/A"),
            "lat": lat,
            "lng": lon
        })

    df = pd.DataFrame(data).drop_duplicates(subset=['Name', 'lat', 'lng'])
    
    if not df.empty:
        df.to_csv("mrt_kelanajaya_food_complete.csv", index=False)
        print(f"\nSuccess! Found {len(df)} food spots along the MRT Kelana Jaya Line.")
        print(df.head(10)) # Show first 10 results
    else:
        print("\nNo spots found. It's possible the 'around' filter needs a broader search or the station names in OSM slightly differ.")
else:
    print("Could not connect to any servers. Please check your internet or try again later.")


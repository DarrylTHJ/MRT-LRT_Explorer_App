import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import overpy
import pandas as pd
import threading
import folium
from folium.plugins import MarkerCluster  # New Feature: Group pins
import os
import webview
import time
import math

from sqlalchemy import create_engine


MRT_LINES = {
    "Kajang Line": "Kwasa Damansara|Kwasa Sentral|Kota Damansara|Surian|Mutiara Damansara|Bandar Utama|Taman Tun Dr Ismail|Phileo Damansara|Pusat Bandar Damansara|Semantan|Muzium Negara|Pasar Seni|Merdeka|Bukit Bintang|Tun Razak Exchange|Cochrane|Maluri|Taman Pertama|Taman Midah|Taman Mutiara|Taman Connaught|Taman Suntex|Sri Raya|Bandar Tun Hussein Onn|Batu 11 Cheras|Bukit Dukung|Sungai Jernih|Stadium Kajang|Kajang",
    #"Putrajaya Line": "Kwasa Damansara|Kampung Selamat|Sungai Buloh|Damansara Damai|Sri Damansara West|Sri Damansara East|Sri Damansara Sentral|Kepong Baru|Metro Prima|Jalan Ipoh|Sentul West|Titiwangsa|Hospital Kuala Lumpur|Raja Uda|Ampang Park|Persiaran KLCC|Conlay|Tun Razak Exchange|Chan Sow Lin|Kuchai|Taman Naga Emas|Sungai Besi|Serdang Raya North|Serdang Raya South|Serdang Jaya|UPM|Taman Equine|Putra Permai|16 Sierra|Cyberjaya North|Cyberjaya City Centre|Putrajaya Sentral",
    "Kelana Jaya Line":"Gombak|Taman Melati|Wangsa Maju|Sri Rampai|Setiawangsa|Jelatek|Dato'Keramat|Damai|Ampang Park|KLCC|Kampung Baru|Dang Wangi|Masjid Jamek|Pasar Seni|KL Sentral|Bangsar|Abdullah Hukum|Kerinchi|Universiti|Taman Jaya|Asia Jaya|Taman Paramount|Taman Bahagia|Kelana Jaya|Lembah Subang|Ara Damansara|Glenmarie|Subang Jaya|SS 15|SS18|USJ 7|Taipan|Wawasan|USJ21|Alam Megah|Subang Alam|Putra Heights"
}

class MRTApp:
    def __init__(self,root):
        self.root = root
        self.root.title("MRT AMENITY EXTRACTOR v1.5")
        self.root.geometry("400x600") # Focused UI size        
        
        # --- UI LAYOUT ---
        self.main_frame = ttk.Frame(root, padding=20)
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(self.main_frame, text="1. Choose Line ", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 5))
        
        self.line_var = tk.StringVar()
        self.line_dropdown = ttk.Combobox(self.main_frame, textvariable=self.line_var, values=list(MRT_LINES.keys()), state="readonly")
        self.line_dropdown.pack(fill=tk.X, pady=5)
        self.line_dropdown.current(0)

        ttk.Label(self.main_frame, text="2. Save as [Name].csv ", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 5))

        self.placeholder = "mrt_export_data.csv"
        self.filename_entry = ttk.Entry(self.main_frame, foreground="grey")        
        self.filename_entry.insert(0, self.placeholder)
        self.filename_entry.pack(fill=tk.X, pady=5)

        # Bind events to handle the placeholder logic
        self.filename_entry.bind("<FocusIn>", self.clear_placeholder)
        self.filename_entry.bind("<FocusOut>", self.restore_placeholder)


        self.extract_btn = ttk.Button(self.main_frame, text="Run Data Extraction", command=self.start_extraction)
        self.extract_btn.pack(fill=tk.X, pady=10)

        ttk.Separator(self.main_frame, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=15)

        ttk.Label(self.main_frame, text="3. VISUALIZATION", font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 5))
        self.btn_map = ttk.Button(self.main_frame, text="Open Map Viewer (Import CSV)", command=self.open_map_viewer)
        self.btn_map.pack(fill=tk.X, pady=5)

        self.log_box = tk.Text(self.main_frame, height=12, font=("Consolas", 8), bg="#f8f8f8")
        self.log_box.pack(fill=tk.BOTH, expand=True, pady=10)
        self.log("System Ready.")

        ttk.Separator(self.main_frame, orient=tk.HORIZONTAL).pack(fill=tk.X, pady=10)
        
        ttk.Label(self.main_frame, text="***. ADVANCED EXPORTS", font=("Arial", 10, "bold")).pack(anchor="w")
        
        self.btn_excel = ttk.Button(self.main_frame, text="Export to Excel (.xlsx)", command=self.export_to_excel)
        self.btn_excel.pack(fill=tk.X, pady=5)

        self.btn_db = ttk.Button(self.main_frame, text="Transfer to PostgreSQL", command=self.show_db_login)
        self.btn_db.pack(fill=tk.X, pady=5)

        

    def log(self, message):
        self.log_box.insert(tk.END, f"> {message}\n")
        self.log_box.see(tk.END)

    def start_extraction(self):
        self.extract_btn.config(state="disabled")
        threading.Thread(target=self.process_extraction).start()

    def haversine(self, lat1, lon1, lat2, lon2):
        # Radius of the Earth in km
        R = 6371.0
    
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
    
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
        # Distance in meters
        return R * c * 1000
    
    def process_extraction(self):
        line_name = self.line_var.get()
        stations_regex = MRT_LINES[line_name]
        api = overpy.Overpass()
        filename = self.filename_entry.get().strip() or "export"
        self.log(f"Starting extraction for {line_name}...")
        
        query = f"""[out:json][timeout:180];
        (node["railway"~"station|halt"]["name"~"{stations_regex}"];
         way["railway"~"station|halt"]["name"~"{stations_regex}"];)->.stations;
        (nwr(around.stations:500)["amenity"~"restaurant|cafe|fast_food|food_court|cinema|theatre|arts_centre|nightclub|community_centre"];
         nwr(around.stations:500)["tourism"~"museum|gallery|attraction|theme_park|viewpoint"];
         nwr(around.stations:500)["leisure"~"bowling_alley|amusement_arcade|water_park"];)->.pois;
        
        (.stations; .pois;);
        out center;"""

        
        try:
            response = api.query(query)

            station_coords = []
            poi_elements = []
            data = []

            for item in response.nodes + response.ways + response.relations:
                name = item.tags.get("name", "Unknown")                
                lat = float(getattr(item, 'lat', getattr(item, 'center_lat', None)))
                lon = float(getattr(item, 'lon', getattr(item, 'center_lon', None)))

                if item.tags.get("railway") in ["station", "halt"]:
                    station_coords.append({"name": name, "lat": lat, "lon": lon})
                else:
                    poi_elements.append(item)

            for item in poi_elements:
                tags = item.tags
                lat = float(getattr(item, 'lat', getattr(item, 'center_lat', None)))
                lon = float(getattr(item, 'lon', getattr(item, 'center_lon', None)))

                # Find nearest station
                nearest_stn = "Unknown"
                min_dist = float('inf')

                for stn in station_coords:
                    d = self.haversine(lat, lon, stn['lat'], stn['lon'])
                    if d < min_dist:
                        min_dist = d
                        nearest_stn = stn['name']

                amenity = tags.get("amenity")
                tourism = tags.get("tourism")
                leisure = tags.get("leisure")

                if amenity in ["restaurant", "cafe", "fast_food", "food_court"]: main_cat = "Food"
                elif tourism in ["museum", "gallery", "attraction"] or amenity == "arts_centre": main_cat = "Culture"
                elif amenity in ["cinema", "theatre", "nightclub"] or leisure in ["bowling_alley", "amusement_arcade"]: main_cat = "Entertainment"
                elif leisure in ["park", "garden", "water_park"]: main_cat = "Leisure"
                else: main_cat = "Other"

                data.append({
                    "Name": tags.get("name", "Unnamed"),
                    "Category": main_cat,
                    "Subcategory": (amenity or tourism or leisure or "General").replace("_", " ").title(),
                    "lat": lat, "lng": lon,
                    "Nearest Station": nearest_stn,
                    "Distance (m)": round(min_dist, 1)
                })

            df = pd.DataFrame(data).drop_duplicates(subset=['Name', 'lat', 'lng'])
            df.insert(0, 'ID', [f"{line_name[:2].upper()}{i+1:04d}" for i in range(len(df))])
            
            output_path = f"{filename}.csv"
            df.to_csv(output_path, index=False)
            
            self.log(f"Success! Found {len(df)} locations.")
            self.log(f"Saved to {output_path}")
            messagebox.showinfo("Done", f"File saved successfully as {output_path}")

        except Exception as e:
            self.log(f"Error: {str(e)}")
            messagebox.showerror("Error", "Could not fetch data. Check connection.")
        
        self.extract_btn.config(state="normal")    
    def open_map_viewer(self):
        file_path = filedialog.askopenfilename(filetypes=[("CSV Files", "*.csv")])
        if not file_path: return

        try:
            df = pd.read_csv(file_path)
            m = folium.Map(location=[df['lat'].mean(), df['lng'].mean()], zoom_start=14)
            
            for _, row in df.iterrows():
                folium.Marker(
                    [row['lat'], row['lng']], 
                    popup=row['Name'],
                    icon=folium.Icon(color="blue", icon="info-sign")
                ).add_to(m)

            map_path = os.path.abspath("internal_map.html")
            m.save(map_path)

            # --- THE MAGIC PART ---
            # This opens a modern browser window inside your app
            webview.create_window('Map Viewer', f'file:///{map_path}')
            webview.start()

        except Exception as e:
            messagebox.showerror("Error", f"Map failed: {e}")
    
    def clear_placeholder(self, event):
        """Removes placeholder text when user clicks the box"""
        if self.filename_entry.get() == self.placeholder:
            self.filename_entry.delete(0, tk.END)
            self.filename_entry.config(foreground="black")

    def restore_placeholder(self, event):
        """Restores placeholder if the user leaves the box empty"""
        if not self.filename_entry.get():
            self.filename_entry.insert(0, self.placeholder)
            self.filename_entry.config(foreground="grey")

    def export_to_excel(self):
        file_path = filedialog.askopenfilename(
            title="Select CSV to conver to Excel",
            filetypes=[("CSV Files","*.csv")]
        )
        if not file_path:
            return
        try:
            df = pd.read_csv(file_path)
            excel_file = file_path.rsplit('.', 1)[0] + ".xlsx"

            df.to_excel(excel_file, index=False, engine='openpyxl')
            self.log(f"Excel file created: {os.path.basename(excel_file)}")
            messagebox.showinfo("Success", f"Exported to:\n{excel_file}")
        except Exception as e:
            self.log(f"Excel Error:{e}")
            messagebox.showerror("Error", f"Failed to convert to Excel: {e}")

    def show_db_login(self):
        """Step A: Pick file and open the login window"""
        # 1. Ask the user to pick the CSV file first
        self.temp_db_file = filedialog.askopenfilename(
            title="Select CSV for Database Upload",
            filetypes=[("CSV Files", "*.csv")]
        )

        if not self.temp_db_file:
            return 

        # 2. Open the popup to get credentials
        self.db_win = tk.Toplevel(self.root)
        self.db_win.title("PostgreSQL Login")
        self.db_win.geometry("300x400")
        self.db_win.grab_set() # Keeps focus on this window

        ttk.Label(self.db_win, text="Database Credentials", font=("Arial", 10, "bold")).pack(pady=10)

        # Initialize the entries dictionary on the class instance
        self.entries = {}
        fields = ['Host', 'Database', 'User', 'Password', 'Port']
        
        for field in fields:
            ttk.Label(self.db_win, text=field).pack(pady=2)
            ent = ttk.Entry(self.db_win, show="*" if field == "Password" else "")
            ent.pack(pady=2)
            
            # Setting defaults for local development
            if field == 'Host': ent.insert(0, 'localhost')
            if field == 'Port': ent.insert(0, '5432')
            
            self.entries[field] = ent

        # This button triggers Step B
        ttk.Button(self.db_win, text="Start Transfer", command=self.transfer_to_postgre).pack(pady=20)

    def transfer_to_postgre(self):
        
        try:
            
            creds = {k: v.get() for k, v in self.entries.items()}
            conn_str = f"postgresql://{creds['User']}:{creds['Password']}@{creds['Host']}:{creds['Port']}/{creds['Database']}"
            engine = create_engine(conn_str)

            # Load the file we stored in Step A
            df = pd.read_csv(self.temp_db_file)
            table_name = os.path.basename(self.temp_db_file).replace(".csv", "").replace(" ", "_").lower()
            self.log(f"Uploading {table_name} to database...")
            
            # YOUR LOGIC HERE:
            df.to_sql(table_name, engine, if_exists='replace', index=False)

            self.log("Success! Data inserted into PostgreSQL.")
            messagebox.showinfo("Success", f"Table '{table_name}' created in PostgreSQL.")
            self.db_win.destroy() # Close the login popup

        except Exception as e:
            self.log(f"Database Error: {e}")
            messagebox.showerror("Error", f"Failed to upload: {e}")

        
if __name__ == "__main__":
    root = tk.Tk()
    app = MRTApp(root)
    root.mainloop()


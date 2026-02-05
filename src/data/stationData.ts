// src/data/stationData.ts

export interface Gem {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  co2Saved: string;
}

export interface Station {
  name: string;
  location: { lat: number; lng: number };
  gems: Gem[];
}

// FOR TESTING: We are loading all your CSV data into "Pasar Seni" for now.
export const stationData: Station = {
  name: "Pasar Seni",
  location: { lat: 3.1424, lng: 101.6954 },
  gems: [
    // --- MANUAL ENTRY 1 (From your CSV) ---
    {
      id: 1,
      name: "Ho Kow Hainam Kopitiam", // Paste 'Name' from CSV
      category: "food",               // Paste 'Category' or default to 'food'
      lat: 3.1415,                    // Paste 'lat' from CSV
      lng: 101.6975,                  // Paste 'lng' from CSV
      description: "Hainanese Chicken Rice", // Paste 'Cuisine' from CSV
      co2Saved: "0.5kg"               // Hardcode this for now
    },
    // --- MANUAL ENTRY 2 ---
    {
      id: 2,
      name: "Merchant's Lane",
      category: "cafe",
      lat: 3.1419,
      lng: 101.6960,
      description: "Fusion Cafe",
      co2Saved: "0.4kg"
    },
    // ... Copy paste more blocks here as needed
  ]
};

// Exporting it as 'allStationsData' to satisfy the App.tsx if you updated it previously
export const allStationsData = {
  "Pasar Seni": stationData,
  // Add other stations if you want to test switching
};
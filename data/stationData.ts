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

export const stationData: Station = {
  name: "Pasar Seni",
  location: { lat: 3.1424, lng: 101.6954 },
  gems: [
    {
      id: 1,
      name: "Ho Kow Hainam Kopitiam",
      category: "food",
      lat: 3.1415,
      lng: 101.6975,
      description: "Hainanese Chicken Rice",
      co2Saved: "0.5kg"
    },
    {
      id: 2,
      name: "Merchant's Lane",
      category: "cafe",
      lat: 3.1419,
      lng: 101.6960,
      description: "Fusion Cafe",
      co2Saved: "0.4kg"
    }
  ]
};

// 👇 THIS LINE BELOW IS THE FIX. 
// CHECK THAT ": Record<string, Station>" IS PRESENT IN YOUR FILE.
export const allStationsData: Record<string, Station> = {
  "Pasar Seni": stationData,
  "Abdullah Hukum": {
      name: "Abdullah Hukum",
      location: { lat: 3.1187, lng: 101.6762 },
      gems: [] 
  },
  "Kajang": { 
      name: "Kajang", 
      location: { lat: 2.9934, lng: 101.7904 }, 
      gems: [] 
  },
  "Tun Razak Exchange": { 
      name: "Tun Razak Exchange", 
      location: { lat: 3.1420, lng: 101.7206 }, 
      gems: [] 
  }
};
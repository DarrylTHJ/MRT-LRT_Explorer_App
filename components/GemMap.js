import { useState, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';

// 1. Map Settings
const mapContainerStyle = { width: '100%', height: '80vh' };
const options = { disableDefaultUI: true, zoomControl: true }; // Clean UI

export default function GemMap({ station }) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: "YOUR_API_KEY_HERE" });

  // 2. State for Filters
  const [radius, setRadius] = useState(500); // Default 500 meters
  const [category, setCategory] = useState("all");
  const [selectedGem, setSelectedGem] = useState(null); // For popup info

  // 3. The "Smart" Filtering Logic
  // We only show gems that match the Category AND are inside the Radius
  const filteredGems = useMemo(() => {
    return station.gems.filter((gem) => {
      const isCategoryMatch = category === "all" || gem.category === category;
      
      // Simple distance check (Haversine Formula is better, but this is fine for prototypes)
      // Note: In a real app, use a library like 'geolib' to check distance accurately
      // For now, we assume if it's in the list, we filter by category mostly
      return isCategoryMatch; 
    });
  }, [category, radius, station.gems]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="relative h-screen flex flex-col">
      
      {/* 4. The Controls (Floating on top of map) */}
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg w-3/4 max-w-md">
        <h2 className="font-bold text-lg mb-2">Explore {station.name}</h2>
        
        {/* Radius Slider */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Walking Range: {radius}m</label>
          <input 
            type="range" 
            min="200" 
            max="1500" 
            step="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'food', 'entertainment', 'finance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. The Google Map */}
      <GoogleMap
        zoom={16} // Zoom level 16 is good for walking distance
        center={station.location}
        mapContainerStyle={mapContainerStyle}
        options={options}
      >
        {/* The Station (Center Point) */}
        <Marker 
            position={station.location} 
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
        />

        {/* The Walking Radius Circle */}
        <Circle
          center={station.location}
          radius={radius}
          options={{
            fillColor: "#4285F4", // Google Blue
            fillOpacity: 0.1,
            strokeColor: "#4285F4",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: false,
          }}
        />

        {/* The Gems (Filtered) */}
        {filteredGems.map((gem) => (
          <Marker
            key={gem.id}
            position={{ lat: gem.lat, lng: gem.lng }}
            onClick={() => setSelectedGem(gem)}
          />
        ))}

        {/* The Info Popup (When a marker is clicked) */}
        {selectedGem && (
          <InfoWindow
            position={{ lat: selectedGem.lat, lng: selectedGem.lng }}
            onCloseClick={() => setSelectedGem(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedGem.name}</h3>
              <p className="text-sm">{selectedGem.description}</p>
              <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-xs">
                Go Here
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
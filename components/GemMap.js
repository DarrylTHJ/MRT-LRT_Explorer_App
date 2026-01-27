import { useState, useMemo } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { ArrowLeft, MapPin, Filter } from 'lucide-react'; // Assuming you have lucide-react installed

const mapContainerStyle = { width: '100%', height: '100%' };
const options = { 
  disableDefaultUI: true, 
  zoomControl: false, // We hide default controls for a cleaner "App" feel
  styles: [ // Optional: A cleaner map style (silver)
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
  ]
};

export default function GemMap({ station, onBack }) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: "YOUR_API_KEY_HERE" });

  const [radius, setRadius] = useState(500);
  const [category, setCategory] = useState("all");
  const [selectedGem, setSelectedGem] = useState(null);

  const filteredGems = useMemo(() => {
    if (!station || !station.gems) return [];
    return station.gems.filter((gem) => {
      // In a real app, you would verify distance here. 
      // For prototype, we assume the data provided is relevant.
      return category === "all" || gem.category === category;
    });
  }, [category, radius, station]);

  if (!isLoaded) return <div className="flex items-center justify-center h-full text-gray-500">Loading Map...</div>;

  return (
    <div className="relative h-full w-full bg-gray-100">
      
      {/* 1. Top Navigation Bar (Glassmorphism) */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md shadow-sm rounded-b-3xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-md active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-none">{station.name}</h2>
            <p className="text-xs text-[#E0004D] font-medium mt-1">Live Radius: {radius}m</p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {['all', 'food', 'entertainment', 'finance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                ${category === cat 
                  ? 'bg-[#E0004D] text-white shadow-lg shadow-[#E0004D]/30' 
                  : 'bg-white text-gray-600 shadow-sm border border-gray-100'}
              `}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Floating Slider (Bottom) */}
      <div className="absolute bottom-8 left-6 right-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50">
        <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Walking Range</span>
            <span className="text-xs font-bold text-[#E0004D]">{radius}m</span>
        </div>
        <input 
          type="range" 
          min="200" 
          max="1500" 
          step="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E0004D]"
        />
      </div>

      {/* 3. The Map */}
      <GoogleMap
        zoom={16}
        center={station.location}
        mapContainerStyle={mapContainerStyle}
        options={options}
      >
        {/* Station Marker */}
        <Marker 
            position={station.location} 
            // Default red marker is fine, or use a custom icon
        />

        {/* Radius Circle */}
        <Circle
          center={station.location}
          radius={radius}
          options={{
            fillColor: "#E0004D",
            fillOpacity: 0.08,
            strokeColor: "#E0004D",
            strokeOpacity: 0.4,
            strokeWeight: 1,
            clickable: false,
          }}
        />

        {/* Gem Markers */}
        {filteredGems.map((gem) => (
          <Marker
            key={gem.id}
            position={{ lat: gem.lat, lng: gem.lng }}
            onClick={() => setSelectedGem(gem)}
          />
        ))}

        {/* Info Window */}
        {selectedGem && (
          <InfoWindow
            position={{ lat: selectedGem.lat, lng: selectedGem.lng }}
            onCloseClick={() => setSelectedGem(null)}
          >
            <div className="p-1 min-w-[150px]">
              <h3 className="font-bold text-sm text-gray-800">{selectedGem.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{selectedGem.category}</p>
              <div className="mt-2 flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded w-fit">
                <span>🌱 {gem.co2Saved || "0.4kg"} CO2</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
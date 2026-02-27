import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { Map, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';

interface Gem {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  co2Saved: string;
}

interface Station {
  name: string;
  location: { lat: number; lng: number };
  gems: Gem[];
}

interface RealMapProps {
  station: Station;
  onBack: () => void;
  highlightedGemIds?: number[];
}

const CATEGORIES = {
  "Amenity": ["Restaurant","Cafe","Fast Food","Food Court","Cinema","Theatre","Arts Centre","Nightclub","Community Centre"],
  "Tourism": ["Museum","Gallery","Attraction","Theme Park","Viewpoint"],
  "Leisure": ["Bowling Alley","Amusement Arcade","Water Park"]
};

// --- Helper: Haversine Distance ---
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Helper: Dynamic Radius Circle ---
const RadiusCircle = ({ center, radius }: { center: google.maps.LatLngLiteral, radius: number }) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: "#E0004D",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#E0004D",
        fillOpacity: 0.10,
        map,
        clickable: false,
      });
    }

    circleRef.current.setCenter(center);
    circleRef.current.setRadius(radius);

    return () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [map, center, radius]);

  return null;
};

// --- Helper: Smart Camera Controller ---
const MapZoomController = ({ center, radius }: { center: google.maps.LatLngLiteral, radius: number }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Smart Zoom: The smaller the radius, the closer we zoom
    let targetZoom = 15;
    if (radius <= 250) targetZoom = 17;
    else if (radius <= 500) targetZoom = 16;
    else if (radius <= 1000) targetZoom = 15;
    else targetZoom = 14;

    map.panTo(center);
    map.setZoom(targetZoom);

  }, [map, center, radius]);

  return null;
};

export default function RealMap({ station, onBack, highlightedGemIds = [] }: RealMapProps) {
  const [radius, setRadius] = useState(800);
  const [activeMainCat, setActiveMainCat] = useState<string | "all">("all");
  const [activeSubtype, setActiveSubtype] = useState<string | "all">("all");
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);

  // --- FILTER LOGIC ---
  const visibleGems = useMemo(() => {
  if (!station?.gems) return [];
  let gems = station.gems;

  if (highlightedGemIds.length > 0) {
    gems = gems.filter(g => highlightedGemIds.includes(g.id));
  } else {
    // New Multi-tier Filtering
    if (activeMainCat !== "all") {
      // 1. Filter by Main Category logic
      if (activeMainCat === "Food & Drinks") {
        gems = gems.filter(g => ['food', 'cafe', 'fast_food', 'restaurant'].includes(g.category));
      } else {
        // Fallback: match by description keywords for other categories
        gems = gems.filter(g => g.description.toLowerCase().includes(activeMainCat.split(' ')[0].toLowerCase()));
      }

      // 2. Filter by Subtype
      if (activeSubtype !== "all") {
        gems = gems.filter(g => g.description.toLowerCase().includes(activeSubtype.toLowerCase()));
      }
    }
  }

  // Distance filter (keep your original)
  return gems.filter(gem => {
    const dist = haversineDistance(station.location.lat, station.location.lng, gem.lat, gem.lng);
    return dist <= radius;
  });
}, [activeMainCat, activeSubtype, station, highlightedGemIds, radius]);

  const isAIMode = highlightedGemIds.length > 0;

  // --- DYNAMIC RESTRICTION BOUNDS ---
  const mapRestriction = useMemo(() => {
    // Rule: Allow panning up to 2.5x the radius distance
    const bufferMeters = Math.max(radius * 2.5, 600);
    const delta = bufferMeters / 111000;

    return {
      latLngBounds: {
        north: station.location.lat + delta,
        south: station.location.lat - delta,
        east: station.location.lng + delta,
        west: station.location.lng - delta,
      },
      strictBounds: false,
    };
  }, [station, radius]);

  return (
    // ✅ FIX: Use 100dvh to perfectly fit the mobile viewport without scrolling
    <div className="relative h-full w-full bg-gray-100 overflow-hidden">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 pt-12 pb-4 bg-gradient-to-b from-white/90 to-white/0 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            {isAIMode && <span className="text-xs font-bold text-[#E0004D]">Clear Search</span>}
          </button>

          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 leading-none">{station.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#E0004D] font-medium">Range: {radius}m</span>
              <span className="text-[10px] text-gray-400">|</span>
              <span className="text-[10px] text-gray-500">{visibleGems.length} places found</span>
            </div>
          </div>
        </div>

        {/* Filter Pills System */}
        <div className={`mt-4 pointer-events-auto transition-opacity space-y-2 ${isAIMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

          {/* Row 1: Main Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => { setActiveMainCat("all"); setActiveSubtype("all"); }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shadow-sm border
        ${activeMainCat === "all" ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
            >
              ALL
            </button>
            {Object.keys(CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveMainCat(cat); setActiveSubtype("all"); }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shadow-sm border
          ${activeMainCat === cat ? 'bg-[#E0004D] text-white border-[#E0004D]' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Row 2: Subtypes (Only shows when a Category is selected) */}
          {activeMainCat !== "all" && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 animate-in slide-in-from-top-1 duration-200">
              <button
                onClick={() => setActiveSubtype("all")}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-colors
          ${activeSubtype === "all" ? 'bg-gray-200 border-gray-400 text-gray-800' : 'bg-white/80 border-gray-100 text-gray-500'}`}
              >
                ALL {activeMainCat.split(' ')[0].toUpperCase()}
              </button>
              {CATEGORIES[activeMainCat as keyof typeof CATEGORIES].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubtype(sub)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-bold border transition-colors
            ${activeSubtype === sub ? 'bg-gray-800 text-white border-gray-800' : 'bg-white/80 border-gray-100 text-gray-500'}`}
                >
                  {sub.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Slider - ✅ FIXED: Pinned to bottom-10 for easy thumb access */}
      <div className="absolute bottom-10 left-6 right-6 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500">Walking Radius</span>
          <span className="text-xs font-bold text-[#E0004D]">{radius}m</span>
        </div>
        <input
          type="range"
          min="100"
          max="2000"
          step="50"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E0004D]"
        />
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Close (100m)</span>
          <span>Far (2km)</span>
        </div>
      </div>

      {/* --- GOOGLE MAP --- */}
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={station.location}
        defaultZoom={15}
        minZoom={14}
        maxZoom={20}
        restriction={mapRestriction}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="w-full h-full"
      >
        <MapZoomController center={station.location} radius={radius} />

        <RadiusCircle center={station.location} radius={radius} />

        {/* Station Marker */}
        <AdvancedMarker position={station.location}>
          <div className="relative flex flex-col items-center">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md mb-1 whitespace-nowrap">
              {station.name} Station
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white z-20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M18 6c0-1.105-.895-2-2-2H8c-1.105 0-2 .895-2 2v7h12V6zM6 15c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2v-2H6v2zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4-13.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
              </svg>
            </div>
            <div className="absolute top-6 w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75 -z-10" />
          </div>
        </AdvancedMarker>

        {/* Gem Markers */}
        {visibleGems.map((gem) => (
          <AdvancedMarker
            key={gem.id}
            position={{ lat: gem.lat, lng: gem.lng }}
            onClick={() => setSelectedGem(gem)}
          >
            <div className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-95">
              <MapPin className={`w-10 h-10 ${isAIMode ? 'text-green-600 animate-bounce' : 'text-[#E0004D]'} fill-white drop-shadow-md`} />
            </div>
          </AdvancedMarker>
        ))}

{/* Info Window */}
        {selectedGem && (
          <InfoWindow
            position={{ lat: selectedGem.lat, lng: selectedGem.lng }}
            onCloseClick={() => setSelectedGem(null)}
            pixelOffset={[0, -40]}
          >
            <div className="min-w-[160px] p-1">
              <h3 className="font-bold text-sm text-gray-900">{selectedGem.name}</h3>
              <p className="text-xs text-gray-500 capitalize mb-2">{selectedGem.category.replace('_', ' ')}</p>
              
              <div className="flex items-center justify-between mt-2">
                 <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded">
                    <span>🌱 {selectedGem.co2Saved} CO2</span>
                 </div>
                 
                 {/* 🔴 UPDATED: Navigation Button with correct Google Maps URL */}
                 <button 
                    onClick={() => {
                      const origin = `${station.location.lat},${station.location.lng}`;
                      const destination = `${selectedGem.lat},${selectedGem.lng}`;
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
                      window.open(url, '_blank');
                    }}
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition-colors flex items-center justify-center shadow-sm"
                    title="Get Walking Directions"
                 >
                    <Navigation className="w-4 h-4" />
                 </button>
                 
              </div>
            </div>
          </InfoWindow>
        )}

      </Map>
    </div>
  );
}
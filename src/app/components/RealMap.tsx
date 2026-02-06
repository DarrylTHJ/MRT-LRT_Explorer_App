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
        fillOpacity: 0.15,
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

// --- Helper: Camera Controller ---
const MapUpdater = ({ center }: { center: google.maps.LatLngLiteral }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(16);
    }
  }, [map, center]);
  return null;
};

export default function RealMap({ station, onBack, highlightedGemIds = [] }: RealMapProps) {
  const [radius, setRadius] = useState(500); 
  const [category, setCategory] = useState("all");
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);

  // Filter Logic
  const visibleGems = useMemo(() => {
    if (!station || !station.gems) return [];

    let gems = station.gems;

    // 1. AI Highlighting takes priority if active
    if (highlightedGemIds.length > 0) {
      gems = gems.filter(g => highlightedGemIds.includes(g.id));
    } else {
      // 2. Otherwise apply Category filter
      if (category !== "all") {
        gems = gems.filter(g => g.category === category);
      }
    }

    return gems;
  }, [category, station, highlightedGemIds]);

  const isAIMode = highlightedGemIds.length > 0;

  // Auto-select first result if AI found something
  useEffect(() => {
    if (isAIMode && visibleGems.length > 0) {
      setSelectedGem(visibleGems[0]);
    }
  }, [isAIMode, visibleGems]);

  return (
    <div className="relative h-full w-full bg-gray-100">
      
      {/* --- UI OVERLAYS (Restored to be Always Visible) --- */}
      
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
            <p className="text-xs text-[#E0004D] font-medium mt-1">Live Radius: {radius}m</p>
          </div>
        </div>

        {/* Filter Pills (Disable them visibly if in AI mode to avoid confusion) */}
        <div className={`flex gap-2 mt-4 overflow-x-auto scrollbar-hide pointer-events-auto pb-2 transition-opacity ${isAIMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {['all', 'food', 'cafe', 'fast_food', 'restaurant'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm
                ${category === cat 
                  ? 'bg-[#E0004D] text-white shadow-[#E0004D]/30' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}
              `}
            >
              {cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Slider (Restored) */}
      <div className="absolute bottom-8 left-6 right-6 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Walking Range</span>
            <span className="text-xs font-bold text-[#E0004D]">{radius}m</span>
        </div>
        <input 
          type="range" 
          min="200" 
          max="2000" 
          step="100"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E0004D]"
        />
      </div>

      {/* --- GOOGLE MAP --- */}
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={station.location}
        defaultZoom={16}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="w-full h-full"
      >
        <MapUpdater center={station.location} />
        
        {/* Radius Circle (Restored) */}
        <RadiusCircle center={station.location} radius={radius} />

        {/* Station Center Marker */}
        <AdvancedMarker position={station.location}>
           <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg animate-pulse" />
        </AdvancedMarker>

        {/* Gem Markers */}
        {visibleGems.map((gem) => (
          <AdvancedMarker
            key={gem.id}
            position={{ lat: gem.lat, lng: gem.lng }}
            onClick={() => setSelectedGem(gem)}
          >
            <div className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-95">
               {/* Green Bounce for AI, Red for Normal */}
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
                 <button className="p-1 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition-colors">
                    <Navigation className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </InfoWindow>
        )}

      </Map>
    </div>
  );
}
import { MapPin, Navigation } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Attraction {
  id: number;
  name: string;
  category: string;
  image: string;
  walkTime: string;
  isSheltered: boolean;
  co2Saved: string;
  // NEW PROPS
  lat?: number;
  lng?: number;
  stationLat?: number;
  stationLng?: number;
}

interface AttractionCardProps {
  attraction: Attraction;
}

export function AttractionCard({ attraction }: AttractionCardProps) {
  
  // Generates the native Google Maps URL
  const handleNavigation = () => {
    if (attraction.lat && attraction.lng && attraction.stationLat && attraction.stationLng) {
      // API=1 is required. origin = Station, destination = Gem, travelmode = walking
      const url = `https://www.google.com/maps/dir/?api=1&origin=${attraction.stationLat},${attraction.stationLng}&destination=${attraction.lat},${attraction.lng}&travelmode=walking`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex-none w-[240px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      <div className="relative h-32 w-full overflow-hidden">
        <ImageWithFallback
          src={attraction.image}
          alt={attraction.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <span className="text-[10px] font-bold text-green-700">🌱 {attraction.co2Saved} CO2</span>
        </div>
        {attraction.isSheltered && (
          <div className="absolute top-2 right-2 bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-[10px] font-bold text-white">☂️ Sheltered</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 pr-2">{attraction.name}</h3>
        </div>
        
        <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-3">
          {attraction.category}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#E0004D]" />
            {attraction.walkTime}
          </div>
          
          {/* 🔴 NEW: Navigation Button */}
          <button 
            onClick={handleNavigation}
            className="flex items-center gap-1 bg-gray-100 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
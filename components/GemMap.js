import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react'; // Ensure you have lucide-react

export default function GemMap({ station, onBack }) {
  // 1. Remove Google Maps LoadScript (No API Key needed)
  
  const [radius, setRadius] = useState(500);
  const [category, setCategory] = useState("all");
  const [selectedGem, setSelectedGem] = useState(null);

  const filteredGems = useMemo(() => {
    if (!station || !station.gems) return [];
    return station.gems.filter((gem) => {
      return category === "all" || gem.category === category;
    });
  }, [category, radius, station]);

  // 2. Mock Coordinates to CSS Percentage Conversion
  // Since we are using a static image, we map Lat/Lng to Top/Left %
  // This is a "Hack" for the prototype to make pins appear in roughly right spots relative to the center
  const getPositionStyle = (gemLat, gemLng) => {
    const centerLat = station.location.lat;
    const centerLng = station.location.lng;
    
    // Scale factor: How much to move per degree difference (adjust to match your zoom level)
    const scale = 4000; 
    
    const top = 50 - (gemLat - centerLat) * scale;
    const left = 50 + (gemLng - centerLng) * scale;

    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative h-full w-full bg-gray-100 overflow-hidden">
      
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

      {/* 3. The "Fake" Map Container */}
      {/* We use a Google Maps Screenshot as the background image */}
      <div 
        className="w-full h-full relative transition-transform duration-500"
        style={{
          backgroundImage: 'url("C:\Users\darry\Downloads\Futuristic Travel Discovery App (1)\public")', // Replace this with a screenshot of YOUR specific station area
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${1 + (1500 - radius) / 2000})` // Fake Zoom Effect based on slider
        }}
      >
        
        {/* Center Station Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 bg-blue-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* The Radius Circle (CSS Border) */}
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-[#E0004D] bg-[#E0004D]/10 rounded-full pointer-events-none transition-all duration-300"
            style={{
                width: `${(radius / 1500) * 80}%`, // Fake size scaling
                height: `${(radius / 1500) * 80}%` // Fake size scaling
            }}
        />

        {/* Filtered Gem Markers */}
        {filteredGems.map((gem) => {
          const style = getPositionStyle(gem.lat, gem.lng);
          return (
            <button
              key={gem.id}
              onClick={() => setSelectedGem(gem)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={style}
            >
               {/* Pin Icon */}
               <MapPin className="w-8 h-8 text-[#E0004D] fill-white drop-shadow-md hover:scale-110 transition-transform" />
               
               {/* Tiny Label on Hover */}
               <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                 {gem.name}
               </span>
            </button>
          );
        })}

        {/* Info Popup (Bottom of Map) */}
        {selectedGem && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white p-3 rounded-xl shadow-xl w-64 animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm text-gray-900">{selectedGem.name}</h3>
                <button onClick={() => setSelectedGem(null)} className="text-gray-400 hover:text-gray-600">×</button>
             </div>
             <p className="text-xs text-gray-500 capitalize mb-2">{selectedGem.category}</p>
             <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded w-fit">
                <span>🌱 {gem.co2Saved || "0.4kg"} CO2 Saved</span>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
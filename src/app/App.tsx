import { useState } from "react";
import { RouteMap } from "./components/RouteMap";
import { TrainHero } from "./components/TrainHero";
import { AttractionCard, Attraction } from "./components/AttractionCard";
import { GlassSearchBar } from "./components/GlassSearchBar";
import { FilterTabs } from "./components/FilterTabs";
import { MapPin } from "lucide-react";

// FIXED IMPORTS:
import GemMap from "./components/GemMap"; // Points to the new .tsx file in the same folder
import { stationData } from "../data/stationData"; // Go up one level from 'app', into 'data'
// ... [Keep your 'allAttractions' array exactly as it is] ...
const allAttractions: Attraction[] = [ 
  // ... (Paste your existing attractions data here)
  // Food
  {
    id: 1,
    name: "Artisan Coffee House",
    category: "Food",
    image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYWZlJTIwaW50ZXJpb3IlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzY5NTA1NzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "3 min walk",
    isSheltered: true,
    co2Saved: "0.4kg",
  },
  // ... (keep the rest)
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  // NEW: State to control which view is active
  const [currentView, setCurrentView] = useState<"dashboard" | "map">("dashboard");

  const filteredAttractions =
    activeFilter === "all"
      ? allAttractions
      : allAttractions.filter(
          (attraction) => attraction.category.toLowerCase() === activeFilter
        );

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] overflow-hidden">
      {/* iPhone 14/15 Pro Container */}
      <div className="max-w-[393px] min-h-[852px] mx-auto bg-[#F5F5F7] relative shadow-2xl overflow-hidden">
        
        {/* === VIEW 1: THE DASHBOARD === */}
        {currentView === "dashboard" && (
          <>
            <div className="pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header */}
              <header className="px-6 pt-8 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  Abdullah Hukum
                </h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E0004D] shadow-lg shadow-[#E0004D]/20">
                  <MapPin className="w-4 h-4 text-white" fill="currentColor" />
                  <span className="text-white text-sm font-semibold">Kelana Jaya Line</span>
                </div>
              </header>

              {/* Dynamic Route Map Strip */}
              <RouteMap />

              {/* Train Hero Section - NOW CLICKABLE */}
              {/* This mimics the "Zoom into Station" you asked for */}
              <div 
                className="cursor-pointer transition-transform active:scale-95"
                onClick={() => setCurrentView("map")}
              >
                <TrainHero />
                <p className="text-center text-xs text-gray-400 mt-2">Tap train to explore map</p>
              </div>

              {/* Discovery Deck - Nearby Gems */}
              <div className="px-6 py-6">
                <h2 className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-4">
                  Nearby Gems
                </h2>

                <div className="mb-4">
                  <FilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                   {/* ... [Keep scrollbar style block] ... */}
                   <style>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                  `}</style>
                  {filteredAttractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Glass Search Bar */}
            <GlassSearchBar />
          </>
        )}

        {/* === VIEW 2: THE GEM MAP === */}
        {currentView === "map" && (
          <div className="h-full w-full absolute inset-0 z-50 animate-in zoom-in-95 duration-300">
            <GemMap 
              station={stationData} 
              onBack={() => setCurrentView("dashboard")} 
            />
          </div>
        )}

      </div>
    </div>
  );
}
import { useState } from "react";
import { RouteMap } from "./components/RouteMap";
import { TrainHero } from "./components/TrainHero";
import { AttractionCard } from "./components/AttractionCard";
import { GlassSearchBar } from "./components/GlassSearchBar";
import { FilterTabs } from "./components/FilterTabs";
import { Leaf } from "lucide-react"; 
import { motion, AnimatePresence } from "motion/react";
import { allStationsData } from "../data/stationData";
import { toast, Toaster } from "sonner";
import { askRailRonda } from "../services/gemini";
import RealMap from "./components/RealMap"; 
import { KELANA_JAYA_LINE, KAJANG_LINE } from "./data/lines"; 
import ImpactPage from "./components/ImpactPage"; 

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeLine, setActiveLine] = useState<"kelana" | "kajang">("kajang");
  const [currentStationName, setCurrentStationName] = useState("Kajang");
  
  const [isThinking, setIsThinking] = useState(false);
  const [viewState, setViewState] = useState<"dashboard" | "zooming" | "map" | "impact">("dashboard");
  const [highlightedGemIds, setHighlightedGemIds] = useState<number[]>([]);

  const currentStationData = allStationsData[currentStationName] || allStationsData["Kajang"];
  const currentLineData = activeLine === "kelana" ? KELANA_JAYA_LINE : KAJANG_LINE;
  const themeColor = activeLine === "kelana" ? "#E0004D" : "#007A33";

  // Dynamic Gems Mapping
const displayedAttractions = currentStationData.gems
    .filter((gem) => activeFilter === "all" || gem.category === activeFilter)
    .map((gem) => ({
      id: gem.id,
      name: gem.name,
      category: gem.category.replace("_", " "), 
      image: `https://source.unsplash.com/400x300/?${gem.category},food`, 
      walkTime: "5 min", 
      isSheltered: Math.random() > 0.5, 
      co2Saved: gem.co2Saved,
      // 🔴 NEW: Pass coordinates for navigation
      lat: gem.lat,
      lng: gem.lng,
      stationLat: currentStationData.location.lat,
      stationLng: currentStationData.location.lng,
    }));

  const handleTrainClick = () => {
    setViewState("zooming"); 
    setTimeout(() => {
      setViewState("map");   
    }, 800);
  };

  const handleLineSwitch = (line: "kelana" | "kajang") => {
      setActiveLine(line);
      if (line === "kelana") setCurrentStationName("Abdullah Hukum");
      else setCurrentStationName("Kajang");
  };

  const handleAISearch = async (userQuery: string) => {
    setIsThinking(true);
    const recommendation = await askRailRonda(userQuery, currentStationData.gems);
    setIsThinking(false);

    if (recommendation && recommendation.recommendedGemIds && recommendation.recommendedGemIds.length > 0) {
      setHighlightedGemIds(recommendation.recommendedGemIds);
      setViewState("map");
      toast.success(`Found ${recommendation.recommendedGemIds.length} matches!`, {
        description: recommendation.reason,
        duration: 4000,
      });
    } else {
      toast.error("RailRonda couldn't find a match. Try a different query!");
      setHighlightedGemIds([]); 
    }
  };

  return (
    // 🔴 FIX 1: Use h-[100dvh] instead of min-h-screen to lock to viewport
    <div className="relative h-[100dvh] w-full bg-[#F5F5F7] overflow-hidden flex justify-center">
      
      {/* 🔴 FIX 2: Use h-full to fill the parent, removing the fixed 852px height */}
      <div className="w-full max-w-[393px] h-full bg-[#F5F5F7] relative shadow-2xl overflow-hidden flex flex-col">
        
        <Toaster position="top-center" richColors />
        
        <AnimatePresence mode="popLayout">
          {viewState === "impact" && (
             <div className="absolute inset-0 z-50 h-full w-full">
                <ImpactPage onBack={() => setViewState("dashboard")} />
             </div>
          )}

          {(viewState === "zooming" || viewState === "map") && (
            <div className="absolute inset-0 z-0 h-full w-full">
              <RealMap 
                station={currentStationData} 
                onBack={() => {
                    setViewState("dashboard");
                    setHighlightedGemIds([]); 
                }}
                highlightedGemIds={highlightedGemIds} 
              />
            </div>
          )}

          {(viewState === "dashboard" || viewState === "zooming") && (
            <motion.div
              key="dashboard"
              className="relative z-10 h-full w-full bg-[#F5F5F7] overflow-y-auto"
              initial={{ opacity: 0, x: -100 }}
              animate={
                viewState === "zooming" 
                ? { scale: 5, opacity: 0, pointerEvents: "none" } 
                : { scale: 1, opacity: 1, x: 0, pointerEvents: "auto" }
              }
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.8, ease: [0.32, 0, 0.67, 0] }}
            >
              <div className="pb-28">
                <header className="px-6 pt-8 pb-6 relative">
                  <button onClick={() => setViewState("impact")} className="absolute -top-1 right-8 z-20 group">
                    <div className="w-12 h-16 bg-[#15803d] rounded-b-lg shadow-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 group-hover:h-18 group-hover:translate-y-1 hover:shadow-green-900/30">
                        <Leaf className="w-5 h-5 text-[#4ade80]" fill="currentColor" />
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[8px] text-green-200 uppercase font-bold tracking-wider">LVL</span>
                            <span className="text-sm font-bold text-white">5</span>
                        </div>
                    </div>
                  </button>

                  <div className="flex gap-1 mb-1 p-1 bg-gray-200/50 rounded-full w-fit">
                    <button onClick={() => handleLineSwitch("kelana")} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${activeLine === "kelana" ? "bg-white text-[#E0004D] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>LRT Kelana Jaya</button>
                    <button onClick={() => handleLineSwitch("kajang")} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${activeLine === "kajang" ? "bg-white text-[#007A33] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>MRT Kajang</button>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-0 leading-tight">
                    {currentStationName}
                  </h1>
                </header>

                <RouteMap 
                  stations={currentLineData}
                  currentStation={currentStationName}
                  onStationSelect={setCurrentStationName}
                  themeColor={themeColor}
                />

                <div className="cursor-pointer transition-transform active:scale-95 origin-center" onClick={handleTrainClick}>
                  <TrainHero 
                    isZooming={viewState === "zooming"} 
                    currentStation={currentStationName}
                    stationsList={currentLineData}
                    onStationChange={setCurrentStationName}
                    themeColor={themeColor}
                  />
                </div>

                <div className="px-6 py-6">
                  <h2 className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-4">Nearby Gems</h2>
                  <div className="mb-4">
                    <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                     <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                    {displayedAttractions.map((attraction) => (
                      <AttractionCard key={attraction.id} attraction={attraction} />
                    ))}
                    {displayedAttractions.length === 0 && (
                      <div className="w-full text-center text-gray-400 text-sm py-8 italic">
                        No gems found for this category.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <GlassSearchBar onSearch={handleAISearch} isThinking={isThinking} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useRef, useState } from "react";
import { RouteMap } from "./components/RouteMap";
import { TrainHero } from "./components/TrainHero";
import { AttractionCard } from "./components/AttractionCard";
import { GlassSearchBar } from "./components/GlassSearchBar";
import { FilterTabs } from "./components/FilterTabs";
import { Leaf, MapPin, X } from "lucide-react"; 
import { motion, AnimatePresence } from "motion/react";
import { allStationsData, type Gem } from "../data/stationData";
import { toast, Toaster } from "sonner";
import { askGlobalRailRonda } from "../services/gemini";
import { fetchGemsForLine } from "../services/supabasePlaces";
import RealMap from "./components/RealMap"; 
import { KELANA_JAYA_LINE, KAJANG_LINE } from "./data/lines"; 
import ImpactPage from "./components/ImpactPage"; 
import { GlobalSearchResults, GlobalSearchResult } from "./components/GlobalSearchResults";
import { NavigationSheet } from "./components/NavigationSheet";
import { calculateRoute } from "../utils/routeCalculator";

const STATION_NAME_ALIASES: Record<string, string> = {
  "Pusat Bandar D'sara": "Pusat Bandar Damansara",
  BTHO: "Bandar Tun Hussein Onn",
};

const CARD_NEARBY_RADIUS_METERS = 2000;
const STRICT_SUPABASE_MODE = ((import.meta as any).env.VITE_DISABLE_LOCAL_FALLBACK || "")
  .toLowerCase()
  .trim() === "true";

function resolveStationName(stationName: string): string {
  return STATION_NAME_ALIASES[stationName] || stationName;
}

function normalizeStationKey(stationName: string): string {
  const resolved = resolveStationName(stationName).toLowerCase();
  return resolved.replace(/[^a-z0-9]/g, "");
}

function stripStationCodePrefix(stationLabel: string): string {
  const noBracketText = stationLabel.replace(/\([^)]*\)/g, " ").trim();
  // Example: "AG7 SP7 KJ13 Masjid Jamek" -> "Masjid Jamek"
  const withoutCodes = noBracketText.replace(/^([A-Z]{1,3}\d{1,2}\s+)+/i, "").trim();
  return withoutCodes || noBracketText;
}

function isNearestStationMatch(nearestStation: string | undefined, currentStationName: string): boolean {
  if (!nearestStation) return false;

  const target = normalizeStationKey(currentStationName);
  const cleanedNearest = normalizeStationKey(stripStationCodePrefix(nearestStation));
  const rawNearest = normalizeStationKey(nearestStation);

  if (!target || (!cleanedNearest && !rawNearest)) return false;
  if (cleanedNearest === target || rawNearest === target) return true;
  if (cleanedNearest && cleanedNearest.includes(target)) return true;

  return false;
}

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

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeLine, setActiveLine] = useState<"kelana" | "kajang">("kajang");
  const [currentStationName, setCurrentStationName] = useState("Kajang");
  
  const [isThinking, setIsThinking] = useState(false);
  const [viewState, setViewState] = useState<"dashboard" | "zooming" | "map" | "impact">("dashboard");
  const [highlightedGemIds, setHighlightedGemIds] = useState<number[]>([]);
  const [lineGems, setLineGems] = useState<Record<"kelana" | "kajang", Gem[]>>({
    kelana: [],
    kajang: [],
  });
  const [loadedLines, setLoadedLines] = useState<Record<"kelana" | "kajang", boolean>>({
    kelana: false,
    kajang: false,
  });
  const [isLoadingLineGems, setIsLoadingLineGems] = useState(false);
  const hasShownSupabaseFallbackToast = useRef(false);

  const resolvedStationName = resolveStationName(currentStationName);
  const localStationData = allStationsData[resolvedStationName] || allStationsData["Kajang"];

  const [pendingGlobalQuery, setPendingGlobalQuery] = useState<string | null>(null);
  const [globalResults, setGlobalResults] = useState<GlobalSearchResult[]>([]);
  const [isGlobalSheetOpen, setIsGlobalSheetOpen] = useState(false);
  const [activeNavigationRoute, setActiveNavigationRoute] = useState<GlobalSearchResult | null>(null);

  const currentLineData = activeLine === "kelana" ? KELANA_JAYA_LINE : KAJANG_LINE;
  const themeColor = activeLine === "kelana" ? "#E0004D" : "#007A33";

  useEffect(() => {
    let isCancelled = false;

    // Keep per-line cache so switching back is instant.
    if (loadedLines[activeLine]) return;

    const loadLineGems = async () => {
      setIsLoadingLineGems(true);
      try {
        const gems = await fetchGemsForLine(activeLine);
        if (!isCancelled) {
          setLineGems((prev) => ({ ...prev, [activeLine]: gems }));
          setLoadedLines((prev) => ({ ...prev, [activeLine]: true }));
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed loading Supabase places:", error);
          setLineGems((prev) => ({
            ...prev,
            [activeLine]: STRICT_SUPABASE_MODE ? [] : localStationData.gems,
          }));
          setLoadedLines((prev) => ({ ...prev, [activeLine]: true }));
          if (!hasShownSupabaseFallbackToast.current) {
            toast.error(
              STRICT_SUPABASE_MODE
                ? "Supabase places failed to load. DB-only mode is enabled (no local fallback)."
                : "Supabase places failed to load. Using local data."
            );
            hasShownSupabaseFallbackToast.current = true;
          }
        }
      } finally {
        if (!isCancelled) setIsLoadingLineGems(false);
      }
    };

    loadLineGems();
    return () => {
      isCancelled = true;
    };
  }, [activeLine, loadedLines, localStationData.gems]);

  const selectedLineGems = loadedLines[activeLine]
    ? lineGems[activeLine]
    : (STRICT_SUPABASE_MODE ? [] : localStationData.gems);

  const lineCenter = useMemo(() => {
    if (selectedLineGems.length === 0) return localStationData.location;

    const sums = selectedLineGems.reduce(
      (acc, gem) => {
        acc.lat += gem.lat;
        acc.lng += gem.lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: sums.lat / selectedLineGems.length,
      lng: sums.lng / selectedLineGems.length,
    };
  }, [selectedLineGems, localStationData.location]);

  const knownStationLocation = allStationsData[resolvedStationName]?.location;

  const stationScopedGems = useMemo(() => {
    const hasNearestStationData = selectedLineGems.some((gem) => Boolean(gem.nearestStation));

    // Prefer station mapping from Supabase "Nearest Station" when available.
    if (hasNearestStationData) {
      const matchedByNearestStation = selectedLineGems.filter((gem) => {
        return isNearestStationMatch(gem.nearestStation, resolvedStationName);
      });

      // Return this directly to avoid incorrect shared fallback clusters.
      return matchedByNearestStation;
    }

    if (!knownStationLocation) return selectedLineGems;

    return selectedLineGems.filter((gem) => {
      const distance = haversineDistance(
        knownStationLocation.lat,
        knownStationLocation.lng,
        gem.lat,
        gem.lng
      );
      return distance <= CARD_NEARBY_RADIUS_METERS;
    });
  }, [knownStationLocation, resolvedStationName, selectedLineGems]);

  const stationLocation = useMemo(() => {
    if (knownStationLocation) return knownStationLocation;
    if (stationScopedGems.length === 0) return lineCenter;

    const sums = stationScopedGems.reduce(
      (acc, gem) => {
        acc.lat += gem.lat;
        acc.lng += gem.lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: sums.lat / stationScopedGems.length,
      lng: sums.lng / stationScopedGems.length,
    };
  }, [knownStationLocation, lineCenter, stationScopedGems]);

  const currentStationData = useMemo(() => {
    return {
      ...localStationData,
      name: currentStationName,
      location: stationLocation,
      gems: stationScopedGems,
    };
  }, [currentStationName, localStationData, stationLocation, stationScopedGems]);
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

  // 🔴 INITIATE GLOBAL SEARCH
  const handleAISearch = (userQuery: string) => {
    setPendingGlobalQuery(userQuery);
    toast("Select your starting station on the map above", {
      icon: <MapPin className="w-4 h-4 text-blue-500" />,
      duration: 5000,
    });
  };

 // 1. Just changes the visual station, DOES NOT fire AI yet
  const handleStationSelect = (stationName: string) => {
    setCurrentStationName(stationName);
  };

  // 2. 🔴 NEW: The function attached to the Confirm button that fires the AI
  const handleConfirmOrigin = async () => {
    if (!pendingGlobalQuery) return;
    
    const query = pendingGlobalQuery;
    setPendingGlobalQuery(null); // Clear pending state (Hides banner)
    setIsThinking(true);

    // Flatten ALL gems across ALL stations
    const allGems = Object.values(allStationsData).flatMap(station => 
      station.gems.map(gem => ({
        ...gem,
        stationName: station.name,
        stationLat: station.location.lat,
        stationLng: station.location.lng
      }))
    );

    // Ask AI
    const recommendation = await askGlobalRailRonda(query, allGems);
    
    if (recommendation && recommendation.recommendedGemIds && recommendation.recommendedGemIds.length > 0) {
      
      // Map AI Results to UI Data + Route Math
      const results = recommendation.recommendedGemIds.map((id: number) => {
        const gemData = allGems.find(g => g.id === id);
        if (!gemData) return null;
        
        const route = calculateRoute(
          currentStationName, // User's tapped starting station
          gemData.stationName, // Destination station
          gemData.lat, gemData.lng,
          gemData.stationLat, gemData.stationLng
        );

        return { gem: gemData, route };
      }).filter(Boolean);

      setGlobalResults(results as GlobalSearchResult[]);
      setIsGlobalSheetOpen(true);
      toast.success(`Found top matches based on ${currentStationName}!`, { description: recommendation.reason });

    } else {
      toast.error("RailRonda couldn't find a match. Try a different query!");
    }
    setIsThinking(false);
  };

  return (
    <div className="relative h-[100dvh] w-full bg-[#F5F5F7] overflow-hidden flex justify-center">
      <div className="w-full max-w-[393px] h-full bg-[#F5F5F7] relative shadow-2xl overflow-hidden flex flex-col">
        
        <Toaster position="top-center" richColors />
        
        <AnimatePresence mode="popLayout">
          {viewState === "impact" && (
             <div className="absolute inset-0 z-[70] h-full w-full">
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

                {/* 🔴 NEW PENDING QUERY OVERLAY WITH CONFIRM BUTTON */}
                {pendingGlobalQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mx-6 mb-4 p-4 bg-blue-600 text-white rounded-2xl shadow-xl flex flex-col gap-3 relative z-20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-200" />
                        <span className="text-sm font-bold">Select start station below</span>
                      </div>
                      <button onClick={() => setPendingGlobalQuery(null)} className="p-1 text-blue-200 hover:text-white rounded-full bg-blue-700/50">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                    
                    {/* THE RESTORED BUTTON */}
                    <button 
                      onClick={handleConfirmOrigin}
                      className="w-full py-2.5 bg-white hover:bg-gray-50 text-blue-600 text-sm font-extrabold rounded-xl shadow-sm transition-transform active:scale-95 flex justify-center items-center gap-2"
                    >
                      Confirm {currentStationName} as Start
                    </button>
                  </motion.div>
                )}

                <RouteMap 
                  stations={currentLineData}
                  currentStation={currentStationName}
                  onStationSelect={handleStationSelect} // 🔴 Routes clicks here now
                  themeColor={themeColor}
                />

                <div className="cursor-pointer transition-transform active:scale-95 origin-center" onClick={handleTrainClick}>
                  <TrainHero 
                    isZooming={viewState === "zooming"} 
                    currentStation={currentStationName}
                    stationsList={currentLineData}
                    onStationChange={handleStationSelect} // 🔴 And here
                    themeColor={themeColor}
                  />
                </div>

                <div className="px-6 py-6">
                  <h2 className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-4">Nearby Gems</h2>
                  {isLoadingLineGems && (
                    <p className="text-xs text-gray-400 mb-4">Loading places from Supabase...</p>
                  )}
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

        {/* 🔴 NEW BOTTOM SHEETS */}
        <GlobalSearchResults 
          isOpen={isGlobalSheetOpen}
          onClose={() => setIsGlobalSheetOpen(false)}
          results={globalResults}
          onNavigate={(result) => {
             setIsGlobalSheetOpen(false);
             setActiveNavigationRoute(result);
          }}
        />

        <NavigationSheet 
          result={activeNavigationRoute}
          onClose={() => setActiveNavigationRoute(null)}
        />

      </div>
    </div>
  );
}


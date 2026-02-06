import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

// Import the shared type
import { Station } from "../data/lines";

interface TrainHeroProps {
  isZooming?: boolean;
  currentStation: string;
  stationsList: Station[]; // The full list of stations for the active line
  onStationChange: (stationName: string) => void; // Call this when user swipes/clicks arrows
}

export function TrainHero({ isZooming, currentStation, stationsList, onStationChange }: TrainHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // 1. SYNC: When 'currentStation' changes (e.g. from RouteMap), update our local index
  useEffect(() => {
    const foundIndex = stationsList.findIndex(s => s.name === currentStation);
    if (foundIndex !== -1 && foundIndex !== currentIndex) {
      setCurrentIndex(foundIndex);
    }
  }, [currentStation, stationsList]);

  // 2. Door Animation on mount/change
  useEffect(() => {
    setDoorsOpen(false); // Close doors first
    const timer = setTimeout(() => {
      setDoorsOpen(true); // Open them after a delay
    }, 600);
    return () => clearTimeout(timer);
  }, [currentIndex]); // Re-run when index changes

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) handleTransition("next");
    else if (distance < -50) handleTransition("prev");
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleTransition = (direction: "next" | "prev") => {
    if (isTransitioning) return;
    
    // Calculate next index
    let nextIndex = currentIndex;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % stationsList.length;
    } else {
      nextIndex = (currentIndex - 1 + stationsList.length) % stationsList.length;
    }

    // Trigger UI transition
    setIsTransitioning(true);
    setDoorsOpen(false);

    // Notify Parent (App.tsx) immediately so the name updates
    onStationChange(stationsList[nextIndex].name);

    setTimeout(() => {
      // The useEffect above will handle setting setCurrentIndex via the prop change, 
      // but we set transition false here to unlock the UI
      setIsTransitioning(false);
    }, 600);
  };

  // Helper to get image (Placeholder if missing in data)
  const getStationImage = (stationName: string) => {
    // You can extend this map later with real URLs for every station
    const map: Record<string, string> = {
      "Abdullah Hukum": "https://images.unsplash.com/photo-1741241857913-3e856d4208c7?q=80&w=1080",
      "Bangsar": "https://images.unsplash.com/photo-1516617539902-51315fafbaa7?q=80&w=1080",
      "Pasar Seni": "https://images.unsplash.com/photo-1623663242092-2292f7470659?q=80&w=1080",
      "KL Sentral": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1080",
      "Kajang": "https://images.unsplash.com/photo-1628604925721-399a9a3f2c00?q=80&w=1080"
    };
    // Default fallback image
    return map[stationName] || "https://images.unsplash.com/photo-1474487548417-781cb714c22d?q=80&w=1080";
  };

  return (
    <div 
      className="px-6 py-6 overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-[32px] overflow-visible shadow-2xl">
          <div className="h-4 bg-[#E0004D] rounded-t-[32px]" />
          
          <div className="relative px-3 py-4">
            <div className="relative flex items-stretch gap-2 h-80">
              
              {/* Window Frame */}
              <div 
                className={`
                   flex-1 relative rounded-2xl overflow-hidden border-4 border-slate-700 shadow-inner 
                   transition-colors duration-200
                   ${isZooming ? 'bg-transparent' : 'bg-black'} 
                `}
              >
                
                {/* Content */}
                <div 
                   className={`
                     relative w-full h-full transition-opacity duration-200
                     ${isZooming ? 'opacity-0' : 'opacity-100'}
                   `}
                >
                  <ImageWithFallback
                    src={getStationImage(stationsList[currentIndex]?.name || "")}
                    alt={stationsList[currentIndex]?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4 z-0">
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      {/* Station Code Badge (if avail) */}
                      <span className="font-bold text-[#E0004D] text-xs">
                        {stationsList[currentIndex]?.code || "STN"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6 z-0">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4">
                      <p className="text-white font-bold text-xl">{stationsList[currentIndex]?.name}</p>
                      <p className="text-white/90 text-sm mt-1">
                        {/* Placeholder description logic */}
                        {currentIndex % 2 === 0 ? "Cultural Heritage District" : "Modern Urban Hub"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shutter Doors */}
                <motion.div 
                  className="absolute top-0 left-0 w-1/2 h-full bg-[#B8003D] border-r border-[#8B0030] z-10"
                  initial={{ x: "0%" }}
                  animate={{ x: doorsOpen ? "-100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="absolute right-4 top-1/2 w-1.5 h-16 bg-slate-400 rounded-full -translate-y-1/2 shadow-lg" />
                </motion.div>

                <motion.div 
                  className="absolute top-0 right-0 w-1/2 h-full bg-[#B8003D] border-l border-[#8B0030] z-10"
                  initial={{ x: "0%" }}
                  animate={{ x: doorsOpen ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="absolute left-4 top-1/2 w-1.5 h-16 bg-slate-400 rounded-full -translate-y-1/2 shadow-lg" />
                </motion.div>

              </div>
            </div>

            {/* Decorative Train Elements */}
            <div className="mt-3 flex items-center justify-between px-4">
              <div className="flex gap-3">
                <div className="w-10 h-4 bg-slate-700 rounded-full shadow-inner" />
                <div className="w-10 h-4 bg-slate-700 rounded-full shadow-inner" />
              </div>
              <div className="flex-1 mx-6 h-[2px] bg-slate-700/50" />
              <div className="flex gap-3">
                <div className="w-10 h-4 bg-slate-700 rounded-full shadow-inner" />
                <div className="w-10 h-4 bg-slate-700 rounded-full shadow-inner" />
              </div>
            </div>
          </div>
          <div className="h-3 bg-[#E0004D] rounded-b-[32px]" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTransition("prev");
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-30"
          disabled={isTransitioning}
        >
          <ChevronRight className="w-5 h-5 text-gray-700 rotate-180" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTransition("next");
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-30"
          disabled={isTransitioning}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className={`mt-3 text-center transition-opacity ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xs text-gray-400 font-medium">← Swipe or Tap to travel →</p>
        </div>
      </motion.div>
    </div>
  );
}
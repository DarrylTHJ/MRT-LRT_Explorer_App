import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface Station {
  id: number;
  name: string;
  image: string;
  description: string;
  nextStation: string;
}

const stations: Station[] = [
  {
    id: 1,
    name: "Abdullah Hukum",
    image: "https://images.unsplash.com/photo-1741241857913-3e856d4208c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5nc2FyJTIwa3VhbGElMjBsdW1wdXIlMjBuZWlnaGJvcmhvb2R8ZW58MXx8fHwxNzY5NTA1OTU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Cultural Heritage District",
    nextStation: "Bangsar",
  },
  {
    id: 2,
    name: "Bangsar",
    image: "https://images.unsplash.com/photo-1516617539902-51315fafbaa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXRhbGluZyUyMGpheWElMjBtYWxheXNpYSUyMGNpdHlzY2FwZXxlbnwxfHx8fDE3Njk1MDY2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Upscale Dining & Shopping Hub",
    nextStation: "Kerinchi",
  },
];

// 1. Accept the new prop
export function TrainHero({ isZooming }: { isZooming?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentStation = stations[currentIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDoorsOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
    setIsTransitioning(true);
    setDoorsOpen(false);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        if (direction === "next") return (prev + 1) % stations.length;
        return (prev - 1 + stations.length) % stations.length;
      });
      setTimeout(() => {
        setDoorsOpen(true);
        setIsTransitioning(false);
      }, 500);
    }, 600);
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
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-[32px] overflow-visible shadow-2xl">
          <div className="h-4 bg-[#E0004D] rounded-t-[32px]" />
          
          <div className="relative px-3 py-4">
            <div className="relative flex items-stretch gap-2 h-80">
              
              {/* 2. The Window Frame */}
              <div 
                className={`
                   flex-1 relative rounded-2xl overflow-hidden border-4 border-slate-700 shadow-inner 
                   transition-colors duration-200
                   ${isZooming ? 'bg-transparent' : 'bg-black'} 
                `}
              >
                
                {/* 3. The Content (Image + Text) - Fades out instantly on zoom */}
                <div 
                   className={`
                     relative w-full h-full transition-opacity duration-200
                     ${isZooming ? 'opacity-0' : 'opacity-100'}
                   `}
                >
                  <ImageWithFallback
                    src={currentStation.image}
                    alt={currentStation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4 z-0">
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                      <span className="text-xs font-semibold text-gray-600">NEXT:</span>
                      <span className="text-sm font-bold text-[#E0004D]">{currentStation.nextStation}</span>
                      <ChevronRight className="w-4 h-4 text-[#E0004D]" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6 z-0">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4">
                      <p className="text-white font-bold text-xl">{currentStation.name}</p>
                      <p className="text-white/90 text-sm mt-1">{currentStation.description}</p>
                    </div>
                  </div>
                </div>

                {/* Shutter Doors (Keep these visible so the 'frame' zooms in) */}
                <motion.div 
                  className="absolute top-0 left-0 w-1/2 h-full bg-[#B8003D] border-r border-[#8B0030] z-10"
                  initial={{ x: "0%" }}
                  animate={{ x: doorsOpen ? "-100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="absolute right-4 top-1/2 w-1.5 h-16 bg-slate-400 rounded-full -translate-y-1/2 shadow-lg" />
                  <div className="absolute top-10 right-8 left-8 h-32 bg-slate-800/50 rounded-lg border border-[#8B0030]" />
                </motion.div>

                <motion.div 
                  className="absolute top-0 right-0 w-1/2 h-full bg-[#B8003D] border-l border-[#8B0030] z-10"
                  initial={{ x: "0%" }}
                  animate={{ x: doorsOpen ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="absolute left-4 top-1/2 w-1.5 h-16 bg-slate-400 rounded-full -translate-y-1/2 shadow-lg" />
                  <div className="absolute top-10 left-8 right-8 h-32 bg-slate-800/50 rounded-lg border border-[#8B0030]" />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
              </div>
            </div>

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

        <div className="flex justify-center gap-2 mt-5">
          {stations.map((station, index) => (
            <button
              key={station.id}
              onClick={() => {
                const direction = index > currentIndex ? "next" : "prev";
                if (index !== currentIndex) handleTransition(direction);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8 bg-[#E0004D]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        
        <div className={`mt-3 text-center transition-opacity ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xs text-gray-400 font-medium">← Swipe carriage to travel →</p>
        </div>
      </motion.div>
    </div>
  );
}
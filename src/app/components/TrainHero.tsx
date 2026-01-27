import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
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

export function TrainHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const currentStation = stations[currentIndex];

  // Train arrival animation on mount
  useEffect(() => {
    const doorsTimer = setTimeout(() => {
      setDoorsOpen(true);
    }, 1200); // Open doors after train arrives

    return () => clearTimeout(doorsTimer);
  }, []);

  // Reset door animation when changing stations
  useEffect(() => {
    setDoorsOpen(false);
    const timer = setTimeout(() => {
      setDoorsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stations.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stations.length) % stations.length);
  };

  return (
    <div className="px-6 py-6 overflow-hidden">
      <motion.div
        className="relative"
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 1,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        {/* Realistic LRT Carriage Side View - Much Wider Windows */}
        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-[32px] overflow-visible shadow-2xl">
          {/* Top Ruby Red Stripe */}
          <div className="h-4 bg-[#E0004D] rounded-t-[32px]" />
          
          {/* Main Carriage Body */}
          <div className="relative px-3 py-4">
            {/* Carriage Container with Windows and Doors */}
            <div className="relative flex items-stretch gap-2 h-80">
              {/* Left Door */}
              <motion.div
                className="flex-shrink-0 w-16 bg-[#B8003D] rounded-xl relative overflow-hidden shadow-inner"
                animate={{
                  x: doorsOpen ? -20 : 0,
                  opacity: doorsOpen ? 0.7 : 1,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Door Panel */}
                <div className="absolute inset-2 border-2 border-[#8B0030] rounded-lg" />
                <div className="absolute inset-y-4 left-1/2 w-[2px] bg-[#8B0030] -translate-x-1/2" />
                <div className="absolute top-1/2 inset-x-3 h-[2px] bg-[#8B0030] -translate-y-1/2" />
                {/* Door Handle */}
                <div className="absolute top-1/2 right-3 w-1.5 h-10 bg-slate-400 rounded-full -translate-y-1/2 shadow" />
                {/* Door Window */}
                <div className="absolute top-8 left-3 right-3 h-20 bg-slate-700/40 rounded-lg border-2 border-[#8B0030]" />
              </motion.div>

              {/* Main Window Section - Much Larger */}
              <div className="flex-1 relative rounded-2xl overflow-hidden border-4 border-slate-700 shadow-inner">
                {/* Station Image */}
                <ImageWithFallback
                  src={currentStation.image}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                
                {/* Subtle window frame dividers */}
                <div className="absolute top-0 left-1/4 w-1 h-full bg-slate-700/30" />
                <div className="absolute top-0 left-2/4 w-1 h-full bg-slate-700/30" />
                <div className="absolute top-0 left-3/4 w-1 h-full bg-slate-700/30" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Next Station Badge */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <span className="text-xs font-semibold text-gray-600">NEXT:</span>
                    <span className="text-sm font-bold text-[#E0004D]">{currentStation.nextStation}</span>
                    <ChevronRight className="w-4 h-4 text-[#E0004D]" />
                  </div>
                </div>
                
                {/* Station Info */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4">
                    <p className="text-white font-bold text-xl">{currentStation.name}</p>
                    <p className="text-white/90 text-sm mt-1">{currentStation.description}</p>
                  </div>
                </div>
              </div>

              {/* Right Door */}
              <motion.div
                className="flex-shrink-0 w-16 bg-[#B8003D] rounded-xl relative overflow-hidden shadow-inner"
                animate={{
                  x: doorsOpen ? 20 : 0,
                  opacity: doorsOpen ? 0.7 : 1,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Door Panel */}
                <div className="absolute inset-2 border-2 border-[#8B0030] rounded-lg" />
                <div className="absolute inset-y-4 left-1/2 w-[2px] bg-[#8B0030] -translate-x-1/2" />
                <div className="absolute top-1/2 inset-x-3 h-[2px] bg-[#8B0030] -translate-y-1/2" />
                {/* Door Handle */}
                <div className="absolute top-1/2 left-3 w-1.5 h-10 bg-slate-400 rounded-full -translate-y-1/2 shadow" />
                {/* Door Window */}
                <div className="absolute top-8 left-3 right-3 h-20 bg-slate-700/40 rounded-lg border-2 border-[#8B0030]" />
              </motion.div>
            </div>

            {/* Bottom Carriage Details */}
            <div className="mt-3 flex items-center justify-between px-4">
              {/* Wheel Housing Indicators */}
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

          {/* Bottom Ruby Red Stripe */}
          <div className="h-3 bg-[#E0004D] rounded-b-[32px]" />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 rotate-180" />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Station Indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {stations.map((station, index) => (
            <button
              key={station.id}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-[#E0004D]"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Swipe Hint */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400 font-medium">← Swipe to explore stations →</p>
        </div>
      </motion.div>
    </div>
  );
}

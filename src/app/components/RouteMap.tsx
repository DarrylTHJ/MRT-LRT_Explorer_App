import { useRef, useEffect } from "react";

// Full Kelana Jaya Line List
const STATIONS = [
  "Gombak", "Taman Melati", "Wangsa Maju", "Sri Rampai", "Setiawangsa",
  "Jelatek", "Dato' Keramat", "Damai", "Ampang Park", "KLCC",
  "Kampung Baru", "Dang Wangi", "Masjid Jamek", "Pasar Seni", "KL Sentral",
  "Bangsar", "Abdullah Hukum", "Kerinchi", "Universiti", "Taman Jaya",
  "Asia Jaya", "Taman Paramount", "Taman Bahagia", "Kelana Jaya", "Lembah Subang",
  "Ara Damansara", "Glenmarie", "Subang Jaya", "SS15", "SS18",
  "USJ 7", "Taipan", "Wawasan", "USJ 21", "Alam Megah",
  "Subang Alam", "Putra Heights"
];

interface RouteMapProps {
  currentStation: string;
  onStationSelect: (stationName: string) => void;
}

export function RouteMap({ currentStation, onStationSelect }: RouteMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the active station when it changes
  useEffect(() => {
    const activeElement = document.getElementById(`station-${currentStation}`);
    if (activeElement && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentStation]);

  return (
    <div className="relative w-full bg-white/80 backdrop-blur-sm border-y border-gray-200">
      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-6 px-6 py-5 overflow-x-auto scrollbar-hide snap-x"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Connecting Line (Background) */}
        <div className="absolute left-0 right-0 h-[2px] bg-gray-200 top-1/2 -translate-y-1/2 min-w-full mx-6" />

        {STATIONS.map((station, index) => {
          const isActive = station === currentStation;
          
          return (
            <div 
              key={station} 
              id={`station-${station}`}
              onClick={() => onStationSelect(station)}
              className="relative flex flex-col items-center gap-3 z-10 flex-shrink-0 cursor-pointer group snap-center"
            >
              {/* Station Dot */}
              <div className="relative p-1">
                 <div
                  className={`
                    rounded-full transition-all duration-300 relative z-20
                    ${isActive 
                      ? "w-4 h-4 bg-[#E0004D] shadow-[0_0_0_4px_rgba(224,0,77,0.2)] scale-110" 
                      : "w-3 h-3 bg-white border-2 border-gray-300 group-hover:border-[#E0004D] group-hover:scale-110"
                    }
                  `}
                />
              </div>
              
              {/* Station Name */}
              <span
                className={`
                  text-[10px] font-medium whitespace-nowrap px-2 py-1 rounded-full transition-all duration-300
                  ${isActive
                    ? "text-[#E0004D] bg-[#E0004D]/5 font-bold translate-y-0 opacity-100"
                    : "text-gray-400 group-hover:text-gray-600 translate-y-1"
                  }
                `}
              >
                {station}
              </span>
            </div>
          );
        })}
        
        {/* Padding for end of scroll */}
        <div className="w-2 flex-shrink-0" /> 
      </div>

      {/* Hide Scrollbar Style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
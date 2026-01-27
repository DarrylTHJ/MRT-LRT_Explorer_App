import { useRef, useEffect } from "react";

const STATIONS = [
  { name: "Gombak", interchange: true },
  { name: "Taman Melati", interchange: false },
  { name: "Wangsa Maju", interchange: false },
  { name: "Sri Rampai", interchange: false },
  { name: "Setiawangsa", interchange: false },
  { name: "Jelatek", interchange: false },
  { name: "Dato' Keramat", interchange: false },
  { name: "Damai", interchange: false },
  { name: "Ampang Park", interchange: true },
  { name: "KLCC", interchange: false },
  { name: "Kampung Baru", interchange: false },
  { name: "Dang Wangi", interchange: false },
  { name: "Masjid Jamek", interchange: true },
  { name: "Pasar Seni", interchange: true },
  { name: "KL Sentral", interchange: true },
  { name: "Bangsar", interchange: false },
  { name: "Abdullah Hukum", interchange: true },
  { name: "Kerinchi", interchange: false },
  { name: "Universiti", interchange: false },
  { name: "Taman Jaya", interchange: false },
  { name: "Asia Jaya", interchange: false },
  { name: "Taman Paramount", interchange: false },
  { name: "Taman Bahagia", interchange: false },
  { name: "Kelana Jaya", interchange: false },
  { name: "Lembah Subang", interchange: false },
  { name: "Ara Damansara", interchange: false },
  { name: "Glenmarie", interchange: true },
  { name: "Subang Jaya", interchange: true },
  { name: "SS15", interchange: false },
  { name: "SS18", interchange: false },
  { name: "USJ 7", interchange: true },
  { name: "Taipan", interchange: false },
  { name: "Wawasan", interchange: false },
  { name: "USJ 21", interchange: false },
  { name: "Alam Megah", interchange: false },
  { name: "Subang Alam", interchange: false },
  { name: "Putra Heights", interchange: true },
];

interface RouteMapProps {
  currentStation: string;
  onStationSelect: (stationName: string) => void;
}

export function RouteMap({ currentStation, onStationSelect }: RouteMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Logic Update: Use scrollIntoView for perfect centering on ALL devices
    const safeId = currentStation.replace(/[^a-zA-Z0-9]/g, '-');
    const activeElement = document.getElementById(`station-${safeId}`);
    
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // Prevents vertical page jumping
        inline: "center"  // Forces horizontal centering
      });
    }
  }, [currentStation]);

  return (
    // 2. Height Update: Reduced to h-32 (128px) for a much more compact look
    <div className="relative w-full h-32 bg-white/90 backdrop-blur-md border-y border-gray-200 shadow-sm z-20 overflow-hidden">
      
      <div 
        ref={scrollRef}
        // 3. Layout Update: Reduced top padding (pt-10) to match new height
        className="flex items-start gap-0 overflow-x-auto overflow-y-hidden scrollbar-hide pt-10 px-[50vw] h-full"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {STATIONS.map((station, index) => {
          const isActive = station.name === currentStation;
          const safeId = station.name.replace(/[^a-zA-Z0-9]/g, '-');
          
          return (
            <div 
              key={station.name} 
              id={`station-${safeId}`}
              onClick={() => onStationSelect(station.name)}
              // 4. Width Update: Reduced to w-9 (36px) for tighter gap space
              className="relative flex flex-col items-center flex-shrink-0 w-9 cursor-pointer group snap-center"
            >
              {/* Connector Line */}
              <div className="absolute top-[5px] left-[-50%] right-[-50%] h-[4px] bg-[#E0004D]" 
                   style={{ 
                     left: index === 0 ? '50%' : '-50%',
                     right: index === STATIONS.length - 1 ? '50%' : '-50%'
                   }} 
              />

              {/* Station Dot */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                 <div
                  className={`
                    rounded-full border-[2px] box-content transition-all duration-300
                    ${isActive 
                      ? "w-3 h-3 bg-white border-[#E0004D] shadow-[0_0_0_4px_rgba(224,0,77,0.4)] scale-125" 
                      : station.interchange
                        ? "w-2.5 h-2.5 bg-white border-gray-500 group-hover:border-[#E0004D]" 
                        : "w-2 h-2 bg-white border-[#E0004D]"
                    }
                  `}
                />
              </div>
              
              {/* Slanted Text */}
              <div 
                className={`
                  absolute top-5 left-1/2 
                  origin-top-left 
                  whitespace-nowrap text-[9px] font-semibold tracking-wide transition-all duration-300
                  ${isActive
                    ? "text-[#E0004D] font-bold scale-110 z-20"
                    : "text-gray-500 group-hover:text-gray-700"
                  }
                `}
                style={{
                    // Adjusted translate to align with the new w-9 center
                    transform: 'rotate(45deg) translate(-2px, 0px)' 
                }}
              >
                {station.name}
              </div>

              {/* Interchange Icon */}
              {station.interchange && !isActive && (
                <div className="absolute top-[-15px] text-[8px] text-gray-400 opacity-50">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                </div>
              )}

            </div>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
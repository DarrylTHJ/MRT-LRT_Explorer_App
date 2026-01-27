import { useRef, useEffect } from "react";
// Import the type we made in Step 1
import { Station } from "../data/lines";

interface RouteMapProps {
  stations: Station[];         // Accepts ANY line list
  currentStation: string;
  onStationSelect: (stationName: string) => void;
  themeColor: string;          // Accepts dynamic colors
}

export function RouteMap({ stations, currentStation, onStationSelect, themeColor }: RouteMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll logic (Modern & Works on PC/Mobile)
    const safeId = currentStation.replace(/[^a-zA-Z0-9]/g, '-');
    const activeElement = document.getElementById(`station-${safeId}`);
    
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest", 
        inline: "center"
      });
    }
  }, [currentStation, stations]);

  return (
    <div className="relative w-full h-32 bg-white/90 backdrop-blur-md border-y border-gray-200 shadow-sm z-20 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex items-start gap-0 overflow-x-auto overflow-y-hidden scrollbar-hide pt-10 px-[50vw] h-full"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {stations.map((station, index) => {
          const isActive = station.name === currentStation;
          const safeId = station.name.replace(/[^a-zA-Z0-9]/g, '-');
          
          return (
            <div 
              key={station.name} 
              id={`station-${safeId}`}
              onClick={() => onStationSelect(station.name)}
              className="relative flex flex-col items-center flex-shrink-0 w-9 cursor-pointer group snap-center"
            >
              {/* Connector Line (Dynamic Color) */}
              <div 
                className="absolute top-[5px] left-[-50%] right-[-50%] h-[4px]" 
                style={{ 
                   backgroundColor: themeColor,
                   left: index === 0 ? '50%' : '-50%',
                   right: index === stations.length - 1 ? '50%' : '-50%'
                }} 
              />

              {/* Station Dot */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                 <div
                  className={`
                    rounded-full border-[2px] box-content transition-all duration-300
                    ${isActive 
                      ? "w-3 h-3 bg-white scale-125 shadow-[0_0_0_4px_rgba(255,255,255,0.8)]" 
                      : station.interchange
                        ? "w-2.5 h-2.5 bg-white border-gray-500" 
                        : "w-2 h-2 bg-white"
                    }
                  `}
                  style={{
                      borderColor: isActive || !station.interchange ? themeColor : undefined,
                      boxShadow: isActive ? `0 0 0 4px ${themeColor}33` : undefined
                  }}
                />
              </div>
              
              {/* Slanted Text */}
              <div 
                className={`
                  absolute top-5 left-1/2 
                  origin-top-left 
                  whitespace-nowrap text-[9px] font-semibold tracking-wide transition-all duration-300
                  ${isActive ? "font-bold scale-110 z-20" : "text-gray-500 group-hover:text-gray-700"}
                `}
                style={{
                    color: isActive ? themeColor : undefined,
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
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
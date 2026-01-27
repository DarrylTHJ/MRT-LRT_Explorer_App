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
    const activeIndex = STATIONS.findIndex(s => s.name === currentStation);
    if (activeIndex !== -1 && scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = 64; 
      const screenCenter = container.offsetWidth / 2;
      const itemCenter = (activeIndex * cardWidth) + (cardWidth / 2);
      
      container.scrollTo({
        left: itemCenter - screenCenter,
        behavior: "smooth"
      });
    }
  }, [currentStation]);

  return (
    // CHANGE 1: Increased height to h-64 to prevent text clipping
    <div className="relative w-full h-32 bg-white/90 backdrop-blur-md border-y border-gray-200 shadow-sm z-20 overflow-hidden">
      
      <div 
        ref={scrollRef}
        // CHANGE 2: Used 'items-start' and 'pt-20' to push the line down to a fixed position
        className="flex items-start gap-0 overflow-x-auto scrollbar-hide pt-20 px-[50vw] h-full"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {STATIONS.map((station, index) => {
          const isActive = station.name === currentStation;
          
          return (
            <div 
              key={station.name} 
              onClick={() => onStationSelect(station.name)}
              className="relative flex flex-col items-center flex-shrink-0 w-16 cursor-pointer group snap-center"
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
                  absolute top-6 left-1/2 
                  origin-top-left 
                  whitespace-nowrap text-[11px] font-semibold tracking-wide transition-all duration-300
                  ${isActive
                    ? "text-[#E0004D] font-bold scale-110 z-20"
                    : "text-gray-500 group-hover:text-gray-700" // CHANGE 3: Darker gray for better visibility
                  }
                `}
                style={{
                    transform: 'rotate(45deg) translate(-2px, -2px)' 
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
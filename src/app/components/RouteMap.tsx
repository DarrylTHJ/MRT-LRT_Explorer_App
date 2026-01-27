interface Station {
  id: number;
  name: string;
  isActive: boolean;
}

const stations: Station[] = [
  { id: 1, name: "Lembah Subang", isActive: false },
  { id: 2, name: "Ara Damansara", isActive: false },
  { id: 3, name: "Abdullah Hukum", isActive: true },
  { id: 4, name: "Bangsar", isActive: false },
  { id: 5, name: "Kerinchi", isActive: false },
];

export function RouteMap() {
  return (
    <div className="px-6 py-5 bg-white/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-300 -translate-y-1/2 rounded-full" />
        
        {stations.map((station) => (
          <div key={station.id} className="relative flex flex-col items-center gap-2.5 z-10">
            {/* Station Dot */}
            <div
              className={`
                rounded-full transition-all duration-300 relative
                ${
                  station.isActive
                    ? "w-4 h-4 bg-[#E0004D] shadow-[0_0_16px_rgba(224,0,77,0.6)]"
                    : "w-2.5 h-2.5 bg-gray-400"
                }
              `}
            >
              {station.isActive && (
                <>
                  {/* Only the inner dot blinks */}
                  <div className="absolute inset-0 rounded-full bg-[#E0004D] animate-ping" />
                  {/* Static outer ring */}
                  <div className="absolute inset-[-4px] rounded-full border-2 border-[#E0004D]/30" />
                </>
              )}
            </div>
            
            {/* Station Name */}
            <span
              className={`
                text-[10px] whitespace-nowrap transition-all duration-300 max-w-[60px] text-center leading-tight
                ${
                  station.isActive
                    ? "text-[#E0004D] font-semibold"
                    : "text-gray-500 font-medium"
                }
              `}
            >
              {station.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
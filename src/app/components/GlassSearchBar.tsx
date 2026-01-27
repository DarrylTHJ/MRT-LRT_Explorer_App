import { Sparkles } from "lucide-react";

export function GlassSearchBar() {
  return (
    <div className="fixed bottom-8 left-6 right-6 z-50">
      {/* FAB-style Floating Pill */}
      <button className="w-full group">
        <div className="relative rounded-full bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-2xl shadow-black/10 overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.02]">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent" />
          
          <div className="relative flex items-center gap-3 px-6 py-4">
            {/* Sparkles Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#E0004D] to-[#B8003D] flex items-center justify-center shadow-lg shadow-[#E0004D]/30 group-hover:shadow-[#E0004D]/50 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            
            {/* Text */}
            <span className="flex-1 text-left text-gray-600 font-medium">
              Ask RailRonda...
            </span>
            
            {/* Subtle Indicator */}
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#E0004D] animate-pulse" />
          </div>
          
          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E0004D]/30 to-transparent" />
        </div>
      </button>
    </div>
  );
}

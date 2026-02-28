import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Navigation, MapPin, Clock, Search, ExternalLink, Sparkles } from "lucide-react";
import { RouteResult } from "../../utils/routeCalculator";

export interface GlobalSearchResult {
  gem: any; 
  route: RouteResult;
  reason?: string; // 🔴 ADDED: We tell TypeScript to expect the AI's reason here
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  results: GlobalSearchResult[];
  onNavigate: (result: GlobalSearchResult) => void;
}

export function GlobalSearchResults({ isOpen, onClose, results, onNavigate }: Props) {
  const [sortBy, setSortBy] = useState<"best" | "fastest" | "nearest">("best");

  if (!isOpen) return null;

  // Sorting Logic + The UI Limit (slice)
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "fastest") return a.route.totalTimeMins - b.route.totalTimeMins;
    if (sortBy === "nearest") return a.route.walkDistanceMeters - b.route.walkDistanceMeters;
    return 0; 
  }).slice(0, 10); 

  const generateSearchLink = (name: string, platform: 'google' | 'tiktok' | 'ig') => {
    const encoded = encodeURIComponent(name + " KL");
    if (platform === 'google') return `https://www.google.com/search?q=${encoded}`;
    if (platform === 'tiktok') return `https://www.tiktok.com/search?q=${encoded}`;
    return `https://www.instagram.com/explore/search/keyword/?q=${encoded}`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 h-[85vh] bg-[#F5F5F7] z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col"
      >
        {/* Header & Drag Handle */}
        <div className="pt-3 pb-4 px-6 bg-white rounded-t-3xl border-b border-gray-100 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Matches</h2>
              <p className="text-xs text-gray-500">Based on your starting station</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Sort Tabs */}
          <div className="flex gap-2 mt-4 bg-gray-100 p-1 rounded-lg">
            {(["best", "fastest", "nearest"] as const).map(type => (
              <button 
                key={type}
                onClick={() => setSortBy(type)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${sortBy === type ? 'bg-white text-[#E0004D] shadow-sm' : 'text-gray-500'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sortedResults.map((item, index) => (
            <div key={item.gem.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {item.route.endStation} Station
                    </span>
                    {index === 0 && sortBy === "best" && (
                      <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded">Top Pick</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight pr-4">{item.gem.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{item.gem.category.replace('_', ' ')}</p>
                </div>
              </div>

              {/* 🔴 NEW: AI Reason & Review Highlight Box */}
              {item.reason && (
                <div className="mt-2 mb-3 bg-pink-50/50 text-pink-900 text-[11px] p-2.5 rounded-lg leading-relaxed border border-pink-100 flex gap-2 items-start">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                  <span className="italic">"{item.reason}"</span>
                </div>
              )}

              {/* Metrics */}
              <div className="flex items-center gap-4 my-3 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-500" /> {item.route.totalTimeMins} mins total</div>
                <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-green-500" /> {item.route.walkDistanceMeters}m walk from station</div>
              </div>

              {/* Social/Review Links */}
              <div className="flex gap-2 mb-4">
                 <a href={generateSearchLink(item.gem.name, 'google')} target="_blank" className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded text-[10px] font-semibold hover:bg-gray-100">
                    <Search className="w-3 h-3" /> Google
                 </a>
                 <a href={generateSearchLink(item.gem.name, 'tiktok')} target="_blank" className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded text-[10px] font-semibold hover:bg-gray-100">
                    <ExternalLink className="w-3 h-3" /> TikTok
                 </a>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => onNavigate(item)}
                className="w-full py-2.5 bg-[#E0004D] hover:bg-[#c00040] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-pink-500/20"
              >
                <Navigation className="w-4 h-4" /> Go Here
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
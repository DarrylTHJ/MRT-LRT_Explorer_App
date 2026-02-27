import { motion, AnimatePresence } from "motion/react";
import { X, Train, Footprints, MapPin, ArrowRight, Navigation } from "lucide-react";
import { GlobalSearchResult } from "./GlobalSearchResults";

interface Props {
  result: GlobalSearchResult | null;
  onClose: () => void;
}

export function NavigationSheet({ result, onClose }: Props) {
  if (!result) return null;

  const { gem, route } = result;

  const handleStartWalking = () => {
    // Navigate from the End Station to the Gem
    const origin = `${gem.stationLat},${gem.stationLng}`;
    const destination = `${gem.lat},${gem.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 bg-white z-[60] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="pt-4 pb-4 px-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Route</h2>
            <p className="text-xs text-gray-500 font-medium">{route.startStation} <ArrowRight className="inline w-3 h-3" /> {gem.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white shadow-sm rounded-full hover:bg-gray-50">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Start Point */}
          <div className="flex gap-4 relative">
             <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-gray-200" />
             <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 z-10 shadow-md">
                <MapPin className="w-4 h-4" />
             </div>
             <div className="pt-1">
                <p className="font-bold text-gray-900">Start at {route.startStation} Station</p>
             </div>
          </div>

          {/* Transit Steps */}
          {route.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 relative">
              {idx !== route.steps.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-gray-200" />
              )}
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border-2 border-white
                ${step.type === 'walk' ? 'bg-green-100 text-green-600' : 
                  step.type === 'transfer' ? 'bg-orange-100 text-orange-600' : 
                  'bg-blue-100 text-blue-600'}`}
              >
                {step.type === 'walk' ? <Footprints className="w-4 h-4" /> : <Train className="w-4 h-4" />}
              </div>
              
              <div className="pt-1 pb-2">
                <p className="font-bold text-gray-900 text-sm">{step.instruction}</p>
                <p className="text-xs text-gray-500">{step.timeMins} mins</p>
              </div>
            </div>
          ))}

          {/* End Point */}
          <div className="flex gap-4 relative">
             <div className="w-8 h-8 rounded-full bg-[#E0004D] text-white flex items-center justify-center shrink-0 z-10 shadow-md shadow-pink-500/30">
                <MapPin className="w-4 h-4" />
             </div>
             <div className="pt-1">
                <p className="font-bold text-[#E0004D]">Arrive at {gem.name}</p>
                <p className="text-xs text-gray-500">{gem.category.replace('_', ' ')}</p>
             </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="p-6 bg-white border-t border-gray-100 pb-10">
          <button 
            onClick={handleStartWalking}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl"
          >
            <Navigation className="w-4 h-4" /> Open Maps for Walking
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
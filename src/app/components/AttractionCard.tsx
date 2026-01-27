import { Clock, Umbrella, Leaf } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export interface Attraction {
  id: number;
  name: string;
  category: string;
  image: string;
  walkTime: string;
  isSheltered: boolean;
  co2Saved: string;
}

interface AttractionCardProps {
  attraction: Attraction;
}

export function AttractionCard({ attraction }: AttractionCardProps) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="relative rounded-3xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={attraction.image}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs text-gray-800 font-semibold shadow-md">
              {attraction.category}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-gray-900 font-bold text-base mb-3">{attraction.name}</h3>
          
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Walk Time Tag */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs text-gray-700 font-medium">{attraction.walkTime}</span>
            </div>
            
            {/* Sheltered Tag */}
            {attraction.isSheltered && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                <Umbrella className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">Sheltered</span>
              </div>
            )}
          </div>
          
          {/* CO2 Gamification Badge */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Walking saves</p>
                <p className="text-sm font-bold text-green-700">{attraction.co2Saved} CO₂</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

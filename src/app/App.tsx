import { useState } from "react";
import { RouteMap } from "@/app/components/RouteMap";
import { TrainHero } from "@/app/components/TrainHero";
import { AttractionCard, Attraction } from "@/app/components/AttractionCard";
import { GlassSearchBar } from "@/app/components/GlassSearchBar";
import { FilterTabs } from "@/app/components/FilterTabs";
import { MapPin } from "lucide-react";

const allAttractions: Attraction[] = [
  // Food
  {
    id: 1,
    name: "Artisan Coffee House",
    category: "Food",
    image: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYWZlJTIwaW50ZXJpb3IlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzY5NTA1NzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "3 min walk",
    isSheltered: true,
    co2Saved: "0.4kg",
  },
  {
    id: 2,
    name: "Traditional Malaysian Bistro",
    category: "Food",
    image: "https://images.unsplash.com/photo-1755589494214-3e48817a4c9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMG1hbGF5c2lhbiUyMHJlc3RhdXJhbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk1MDY2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "5 min walk",
    isSheltered: true,
    co2Saved: "0.7kg",
  },
  {
    id: 3,
    name: "Street Food Market",
    category: "Food",
    image: "https://images.unsplash.com/photo-1759299710388-690bf2305e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHN0cmVldCUyMGZvb2QlMjBtYXJrZXQlMjB2aWJyYW50fGVufDF8fHx8MTc2OTUwNTcyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "2 min walk",
    isSheltered: false,
    co2Saved: "0.3kg",
  },
  // Cultural
  {
    id: 4,
    name: "National Heritage Gallery",
    category: "Cultural",
    image: "https://images.unsplash.com/photo-1647792845543-a8032c59cbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBnYWxsZXJ5JTIwY29udGVtcG9yYXJ5JTIwYXJ0fGVufDF8fHx8MTc2OTUwNTcyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "4 min walk",
    isSheltered: true,
    co2Saved: "0.5kg",
  },
  {
    id: 5,
    name: "Contemporary Art Space",
    category: "Cultural",
    image: "https://images.unsplash.com/photo-1767294274414-5e1e6c3974e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwZXhoaWJpdGlvbiUyMHNwYWNlfGVufDF8fHx8MTc2OTUwNjYwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "6 min walk",
    isSheltered: false,
    co2Saved: "0.8kg",
  },
  // Leisure
  {
    id: 6,
    name: "Rooftop Garden Cafe",
    category: "Leisure",
    image: "https://images.unsplash.com/photo-1767732182449-395bdcbf875f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhc2lhbiUyMHJvb2Z0b3AlMjBjYWZlfGVufDF8fHx8MTc2OTUwNTk1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "4 min walk",
    isSheltered: true,
    co2Saved: "0.5kg",
  },
  {
    id: 7,
    name: "Wellness Studio",
    category: "Leisure",
    image: "https://images.unsplash.com/photo-1767605565789-5b18cdbbf6ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwcGVhY2VmdWwlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk1MDA4OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "7 min walk",
    isSheltered: true,
    co2Saved: "0.9kg",
  },
  {
    id: 8,
    name: "Vintage Bookstore",
    category: "Leisure",
    image: "https://images.unsplash.com/photo-1722733858725-5bed8c670eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rc3RvcmUlMjBjb3p5JTIwYXRtb3NwaGVyZXxlbnwxfHx8fDE3Njk1MDU3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "5 min walk",
    isSheltered: true,
    co2Saved: "0.6kg",
  },
  // Work
  {
    id: 9,
    name: "Modern Coworking Hub",
    category: "Work",
    image: "https://images.unsplash.com/photo-1626187777040-ffb7cb2c5450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3dvcmtpbmclMjBzcGFjZSUyMG1vZGVybnxlbnwxfHx8fDE3Njk1MDEzMDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "3 min walk",
    isSheltered: true,
    co2Saved: "0.4kg",
  },
  {
    id: 10,
    name: "Business Center Lounge",
    category: "Work",
    image: "https://images.unsplash.com/photo-1647792845543-a8032c59cbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBnYWxsZXJ5JTIwY29udGVtcG9yYXJ5JTIwYXJ0fGVufDF8fHx8MTc2OTUwNTcyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    walkTime: "6 min walk",
    isSheltered: true,
    co2Saved: "0.8kg",
  },
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredAttractions =
    activeFilter === "all"
      ? allAttractions
      : allAttractions.filter(
          (attraction) => attraction.category.toLowerCase() === activeFilter
        );

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] overflow-hidden">
      {/* iPhone 14/15 Pro Container - 393 x 852 (No status bar) */}
      <div className="max-w-[393px] min-h-[852px] mx-auto bg-[#F5F5F7] relative shadow-2xl">
        {/* Main Content with 24px margins */}
        <div className="pb-28">
          {/* Header */}
          <header className="px-6 pt-8 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Abdullah Hukum
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E0004D] shadow-lg shadow-[#E0004D]/20">
              <MapPin className="w-4 h-4 text-white" fill="currentColor" />
              <span className="text-white text-sm font-semibold">Kelana Jaya Line</span>
            </div>
          </header>

          {/* Dynamic Route Map Strip */}
          <RouteMap />

          {/* Train Hero Section (Swipable) */}
          <TrainHero />

          {/* Discovery Deck - Nearby Gems */}
          <div className="px-6 py-6">
            <h2 className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-4">
              Nearby Gems
            </h2>

            {/* Filter Tabs */}
            <div className="mb-4">
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
            
            {/* Horizontal Scrolling Cards */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {filteredAttractions.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Glass Search Bar (FAB Style) */}
        <GlassSearchBar />
      </div>
    </div>
  );
}

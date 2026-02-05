import { useState } from "react"; // Import useState
import { Sparkles, Loader2 } from "lucide-react"; // Import Loader icon

// Define props so the parent (App.tsx) can handle the logic
interface GlassSearchBarProps {
  onSearch: (query: string) => void;
  isThinking: boolean;
}

export function GlassSearchBar({ onSearch, isThinking }: GlassSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="fixed bottom-8 left-6 right-6 z-50">
      <form onSubmit={handleSubmit} className="w-full group">
        <div className="relative rounded-full bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]">
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent" />
          
          <div className="relative flex items-center gap-3 px-6 py-4">
            {/* Icon changes to Spinner when thinking */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#E0004D] to-[#B8003D] flex items-center justify-center shadow-lg text-white">
              {isThinking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" fill="currentColor" />
              )}
            </div>
            
            {/* Actual Input Field */}
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isThinking ? "Consulting the rails..." : "Ask RailRonda (e.g., 'Quiet cafe with plugs')"}
              disabled={isThinking}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 font-medium"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
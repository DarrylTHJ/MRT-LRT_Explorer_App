interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "All", icon: "✨" },
  { id: "food", label: "Food", icon: "🍜" },
  { id: "cultural", label: "Cultural", icon: "🎭" },
  { id: "leisure", label: "Leisure", icon: "☕" },
  { id: "work", label: "Work", icon: "💼" },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300
            ${
              activeFilter === filter.id
                ? "bg-[#E0004D] text-white shadow-lg shadow-[#E0004D]/30"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
            }
          `}
        >
          <span className="text-base">{filter.icon}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}

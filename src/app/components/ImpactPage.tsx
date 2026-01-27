import { motion } from "motion/react";
import { ArrowLeft, Leaf, Trees, Wind, Award, Trophy } from "lucide-react";

interface ImpactPageProps {
  onBack: () => void;
}

export default function ImpactPage({ onBack }: ImpactPageProps) {
  // Mock Data
  const stats = {
    level: 5,
    title: "Eco Guardian",
    currentXP: 1245,
    nextLevelXP: 1500,
    co2Saved: 12.5,
    treesEquivalent: 3,
  };

  const progressPercent = (stats.currentXP / stats.nextLevelXP) * 100;

  return (
    <motion.div
      className="h-full w-full bg-[#F0FDF4] overflow-y-auto relative z-50"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="bg-[#15803d] text-white px-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-[#22c55e] rounded-full mix-blend-overlay opacity-20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-20%] w-80 h-80 bg-[#4ade80] rounded-full mix-blend-overlay opacity-20 blur-3xl" />

        <div className="relative z-10">
          
          {/* --- TOP ROW: Back Button + Badge + Trophy --- */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1 bg-[#dcfce7]/20 rounded-full backdrop-blur-sm border border-[#dcfce7]/10">
                    <Leaf className="w-3.5 h-3.5 text-[#4ade80]" fill="currentColor" />
                    <span className="text-[#dcfce7] font-bold text-[10px] uppercase tracking-wider">
                        Sustainability
                    </span>
                </div>
            </div>
            
            <Trophy className="w-6 h-6 text-[#fbbf24] drop-shadow-md" />
          </div>

          {/* Title Section */}
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Level {stats.level}</h1>
          <p className="text-[#bbf7d0] text-sm font-medium">{stats.title}</p>

          {/* XP Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold mb-2 text-[#dcfce7]">
              <span>{stats.currentXP} XP</span>
              <span>{stats.nextLevelXP} XP</span>
            </div>
            <div className="h-3 w-full bg-[#052e16]/30 rounded-full overflow-hidden border border-[#ffffff]/10 backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <p className="text-[10px] text-[#86efac] mt-2 text-right">
              {stats.nextLevelXP - stats.currentXP} XP to Level {stats.level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-8 space-y-5">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide">Total CO2 Saved</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl font-extrabold text-[#15803d]">{stats.co2Saved}</span>
                        <span className="text-lg text-gray-400 font-medium">kg</span>
                    </div>
                </div>
                <div className="p-3 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform duration-300">
                    <Wind className="w-6 h-6" />
                </div>
            </div>
            <p className="text-xs text-gray-400 relative z-10">
                You've prevented as much carbon as driving a car for <span className="text-[#15803d] font-bold">120km</span>!
            </p>
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Wind className="w-32 h-32 text-green-800" />
            </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center hover:border-green-200 transition-colors"
            >
                <div className="mb-3 p-3 bg-green-50 rounded-2xl">
                    <Trees className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.treesEquivalent}</span>
                <span className="text-xs text-gray-400 font-medium mt-1">Trees Planted</span>
            </motion.div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center hover:border-green-200 transition-colors"
            >
                <div className="mb-3 p-3 bg-green-50 rounded-2xl">
                    <Award className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">Top 5%</span>
                <span className="text-xs text-gray-400 font-medium mt-1">Of Travelers</span>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
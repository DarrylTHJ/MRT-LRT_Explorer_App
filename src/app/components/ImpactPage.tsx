import { motion } from "motion/react";
import { ArrowLeft, Leaf, Trees, Wind, Award, Trophy } from "lucide-react";

interface ImpactPageProps {
  onBack: () => void;
}

export default function ImpactPage({ onBack }: ImpactPageProps) {
  // Mock Data for "Level 5 User"
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
      initial={{ opacity: 0, x: "100%" }} // Slide in from right
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="bg-[#15803d] text-white px-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors mb-6 backdrop-blur-md">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#dcfce7]/20 rounded-full backdrop-blur-sm">
               <Leaf className="w-4 h-4 text-[#4ade80]" fill="currentColor" />
               <span className="text-[#dcfce7] font-bold text-xs uppercase tracking-wider">Sustainability Tracker</span>
            </div>
            <Trophy className="w-6 h-6 text-[#fbbf24]" />
          </div>

          <h1 className="text-3xl font-bold mb-1 tracking-tight">Level {stats.level}</h1>
          <p className="text-[#bbf7d0] text-sm font-medium">{stats.title}</p>

          {/* XP Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold mb-2 text-[#dcfce7]">
              <span>{stats.currentXP} XP</span>
              <span>{stats.nextLevelXP} XP</span>
            </div>
            <div className="h-3 w-full bg-[#052e16]/30 rounded-full overflow-hidden border border-[#ffffff]/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
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
                <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                    <Wind className="w-6 h-6" />
                </div>
            </div>
            <p className="text-xs text-gray-400 relative z-10">
                You've prevented as much carbon as driving a car for <span className="text-[#15803d] font-bold">120km</span>!
            </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center"
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
                className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 flex flex-col items-center text-center"
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
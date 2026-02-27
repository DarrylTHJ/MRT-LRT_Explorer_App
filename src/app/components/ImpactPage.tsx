import { motion } from "motion/react";
import { ArrowLeft, Leaf, Trees, Wind, Award, Trophy, Gift, Coffee } from "lucide-react";

interface ImpactStats {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  co2Saved: number;
  treesEquivalent: number;
  rankingPercent: number;
  points?: number;
}

interface ImpactPageProps {
  onBack: () => void;
  stats?: ImpactStats;
}

export default function ImpactPage({ onBack, stats }: ImpactPageProps) {
  // Default stats for a new user
  const data: ImpactStats = stats ?? {
    level: 0,
    title: "New Eco Explorer",
    currentXP: 0,
    nextLevelXP: 500,
    co2Saved: 0,
    treesEquivalent: 0,
    rankingPercent: 0,
    points: 0,
  };

  const progressPercent = Math.min((data.currentXP / data.nextLevelXP) * 100, 100);

  const rewardList = [
    { name: "Coffee Badge", pointsRequired: 50, icon: Coffee },
    { name: "Eco Bag", pointsRequired: 100, icon: Gift },
    { name: "VIP Eco Badge", pointsRequired: 200, icon: Trophy },
  ];

  return (
    <motion.div
      className="h-full w-full bg-[#F0FDF4] overflow-y-auto relative z-50"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="bg-[#15803d] text-white px-6 pt-8 pb-6 rounded-b-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-56 h-56 bg-[#22c55e] rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-15%] w-72 h-72 bg-[#4ade80] rounded-full opacity-20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button aria-label="Go back" onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#dcfce7]/20 rounded-full border border-[#dcfce7]/10">
                <Leaf className="w-3.5 h-3.5 text-[#4ade80]" fill="currentColor" />
                <span className="text-[#dcfce7] font-bold text-[10px] uppercase tracking-wider">
                  Sustainability
                </span>
              </div>
            </div>
            <Trophy className="w-6 h-6 text-[#fbbf24]" />
          </div>

          {/* Level & XP */}
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Level {data.level}</h1>
          <p className="text-[#bbf7d0] text-sm font-medium">{data.title}</p>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[#dcfce7]">
              <span>{data.currentXP} XP</span>
              <span>{data.nextLevelXP} XP</span>
            </div>
            <div className="h-2.5 w-full bg-[#052e16]/30 rounded-full overflow-hidden border border-white/10">
              <motion.div className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e]" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
            </div>
            <p className="text-[10px] text-[#86efac] mt-1 text-right">{data.nextLevelXP - data.currentXP} XP to Level {data.level + 1}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6 grid grid-cols-3 gap-3">
        {/* CO2 Saved */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center text-center">
          <Wind className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-lg font-bold text-[#15803d]">{data.co2Saved} kg</span>
          <span className="text-[10px] text-gray-400 mt-1">CO₂ Saved</span>
        </motion.div>

        {/* Trees */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center text-center">
          <Trees className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-lg font-bold text-gray-800">{data.treesEquivalent}</span>
          <span className="text-[10px] text-gray-400 mt-1">Trees Equivalent</span>
        </motion.div>

        {/* Ranking */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center text-center">
          <Award className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-lg font-bold text-gray-800">Top {data.rankingPercent}%</span>
          <span className="text-[10px] text-gray-400 mt-1">Travelers</span>
        </motion.div>
      </div>

      {/* Points Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="px-6">
        <div className="bg-yellow-50 p-4 rounded-2xl shadow-md border border-yellow-200 mb-3">
          <h3 className="text-yellow-800 font-semibold mb-1">Your Points</h3>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-yellow-700">{data.points ?? 0}</span>
            <span className="text-xs text-gray-500">Points from trips</span>
          </div>
          <div className="h-2.5 w-full bg-yellow-100 rounded-full overflow-hidden mt-2">
            <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600" initial={{ width: 0 }} animate={{ width: `${Math.min((data.points ?? 0)/200*100, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        </div>

        {/* Rewards Section */}
        <h3 className="text-gray-700 font-semibold mb-2">Available Rewards</h3>
        <div className="space-y-2">
          {rewardList.map((reward, idx) => {
            const Icon = reward.icon;
            const canClaim = (data.points ?? 0) >= reward.pointsRequired;
            return (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${canClaim ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${canClaim ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 text-sm">{reward.name}</span>
                    <p className="text-[10px] text-gray-500">{reward.pointsRequired} pts</p>
                  </div>
                </div>
                <button className={`px-2 py-1 rounded-lg text-xs font-semibold ${canClaim ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={!canClaim}>
                  Claim
                </button>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Leaf,
  Wind,
  MapPin,
  Trophy,
  Gift,
  Coffee,
} from "lucide-react";

/* =====================
   CONFIG / CONSTANTS
===================== */
const CO2_PER_KM = 0.192; // kg CO2 per km
//const XP_PER_KM = 10;
const KM_PER_LEVEL = 20;
const POINTS_PER_KM = 10;

/* Level badges */
const levelBadges = [
  { minLevel: 0, icon: <Leaf className="w-5 h-5 text-green-400" /> },
  { minLevel: 3, icon: <MapPin className="w-5 h-5 text-green-600" /> },
  { minLevel: 6, icon: <Trophy className="w-5 h-5 text-yellow-400" /> },
];

/* =====================
   TYPES
===================== */
interface ImpactStats {
  distanceTravelled: number;
  points: number;
}

interface ImpactPageProps {
  onBack: () => void;
  stats?: ImpactStats;
}

/* =====================
   COMPONENT
===================== */
export default function ImpactPage({ onBack, stats }: ImpactPageProps) {
  const baseData: ImpactStats = stats ?? {
    distanceTravelled: 161,
    points: 141 * POINTS_PER_KM,
  };

  // Derived values
  const totalKM = Math.floor(baseData.distanceTravelled);
  const level = Math.floor(totalKM / KM_PER_LEVEL);
  const currentKM = totalKM % KM_PER_LEVEL;

  const co2Saved = Number((baseData.distanceTravelled * CO2_PER_KM).toFixed(2));
  const progressPercent = Math.min((currentKM / KM_PER_LEVEL) * 100, 100);

  const levelTitle =
    level === 0
      ? "New Eco Explorer"
      : level < 3
      ? "Green Commuter"
      : level < 6
      ? "Eco Guardian"
      : "Sustainability Champion";

  const currentBadge =
    levelBadges
      .filter((b) => level >= b.minLevel)
      .slice(-1)[0]?.icon ?? <Leaf className="w-5 h-5 text-green-400" />;

  const rewardList = [
    { name: "Free Coffee", pointsRequired: 50, icon: Coffee },
    { name: "Eco Tote Bag", pointsRequired: 100, icon: Gift },
    { name: "Eco Champion Badge", pointsRequired: 200, icon: Trophy },
  ];

  /* =====================
     Animation States
  ====================== */
  const [animatedDistance, setAnimatedDistance] = useState(0);
  const [animatedCO2, setAnimatedCO2] = useState(0);
  //const [animatedKM, setAnimatedKM] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;

    const distanceStep = baseData.distanceTravelled / steps;
    const co2Step = co2Saved / steps;
    //const xpStep = totalXP / steps;
    const pointsStep = baseData.points / steps;

    const interval = setInterval(() => {
      start++;
      setAnimatedDistance((prev) => Math.min(prev + distanceStep, baseData.distanceTravelled));
      setAnimatedCO2((prev) => Math.min(prev + co2Step, co2Saved));
      //setAnimatedXP((prev) => Math.min(prev + distanceStep, totalKM));
      setAnimatedPoints((prev) => Math.min(prev + pointsStep, baseData.points));

      if (start >= steps) {
        clearInterval(interval);
        // Show level up toast if user leveled up
        if (level > prevLevel) {
          setShowLevelUp(true);
          setPrevLevel(level);
          setTimeout(() => setShowLevelUp(false), 2000);
        }
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [baseData, co2Saved, totalKM, level, prevLevel]);

  return (
    <motion.div
      className="h-full w-full bg-[#F0FDF4] overflow-y-auto relative"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Level-Up Toast */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
          >
            🎉 Level Up! You are now {levelTitle}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="bg-[#15803d] text-white px-6 pt-8 pb-6 rounded-b-2xl shadow-lg relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#22c55e] rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#4ade80] rounded-full opacity-20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wide">
                <Leaf className="w-3.5 h-3.5 text-green-300" />
                Sustainability
              </div>
            </div>
            {/* Badge Bounce */}
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6 }}
            >
              {currentBadge}
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold">Level {level}</h1>
          <p className="text-green-200 text-sm">{levelTitle}</p>

          {/* XP BAR */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-1 text-green-100">
              <span>{Math.floor(animatedDistance % KM_PER_LEVEL)} KM</span>
              <span>{KM_PER_LEVEL} KM</span>
            </div>

            <div className="h-2.5 w-full bg-green-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${(currentKM / KM_PER_LEVEL) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            <p className="text-[10px] text-green-200 mt-1 text-right">
              {KM_PER_LEVEL - currentKM} XP to next level
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="px-6 py-6 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
          <MapPin className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-800">{Math.floor(animatedDistance)} km</div>
          <div className="text-[10px] text-gray-400">Distance Travelled</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
          <Wind className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-700">{animatedCO2.toFixed(2)} kg</div>
          <div className="text-[10px] text-gray-400">CO₂ Saved</div>
        </div>
      </div>

      {/* POINTS */}
      <div className="px-6 mb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-yellow-800">Your Points</h3>
            <span className="text-2xl font-bold text-yellow-700">{Math.floor(animatedPoints)}</span>
          </div>
          <div className="h-2.5 bg-yellow-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((animatedPoints / 200) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* REWARDS */}
      <div className="px-6 pb-8">
        <h3 className="font-semibold text-gray-700 mb-3">Available Rewards</h3>
        <div className="space-y-2">
          {rewardList.map((reward, idx) => {
            const Icon = reward.icon;
            const canClaim = baseData.points >= reward.pointsRequired;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  canClaim ? "bg-green-50 border-green-400" : "bg-gray-100 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${canClaim ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{reward.name}</div>
                    <div className="text-[10px] text-gray-500">{reward.pointsRequired} pts</div>
                  </div>
                </div>
                <button
                  disabled={!canClaim}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                    canClaim ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Claim
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Award, Medal, Crown, Sparkles } from "lucide-react";
import CostumeCard from "./CostumeCard";
import WinnerCelebrationModal from "./WinnerCelebrationModal";
import { useApp } from "../../hooks/useApp";

const ResultsSection = ({ results }) => {
  const { user } = useApp();
  const [showCelebration, setShowCelebration] = useState(false);
  const [userRank, setUserRank] = useState(null);

  // Check if current user is in top 3 and show celebration
  useEffect(() => {
    if (!results || !user) return;

    const userResult = results.find((r) => r.userId === user.uid);
    if (userResult) {
      const rank = results.indexOf(userResult) + 1;
      if (rank <= 3) {
        setUserRank({
          rank,
          costumeName: userResult.name,
          voteCount: userResult.voteCount,
        });
        // Show celebration after a short delay
        const timer = setTimeout(() => setShowCelebration(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [results, user]);

  if (!results || results.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-display text-white mb-4">Results</h2>
        <p className="text-gray-400">No results to display yet.</p>
      </div>
    );
  }

  // Get top 3 for special display, including all tied positions
  const getWinners = () => {
    if (results.length === 0) return [];

    const winners = [];
    const topRanks = [1, 2, 3];

    for (const rank of topRanks) {
      const costumesAtRank = results.filter((r) => r.rank === rank);
      winners.push(...costumesAtRank);
      if (winners.length >= 3) break;
    }

    return winners.slice(0, 10); // Show at most 10 if there are many ties
  };

  const winners = getWinners();

  return (
    <div className="mb-12">
      {/* Winner Celebration Modal */}
      {showCelebration && userRank && (
        <WinnerCelebrationModal
          rank={userRank.rank}
          costumeName={userRank.costumeName}
          voteCount={userRank.voteCount}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl sm:text-4xl font-display text-white flex items-center gap-2">
          <Crown className="inline-block h-8 w-8 text-yellow-400" />
          Contest Results
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-gray-300 font-medium">
            {results.length} {results.length === 1 ? "Entry" : "Entries"}
          </span>
        </div>
      </div>

      {/* Winners Podium - Modern mobile-first design */}
      {winners.length > 0 && (
        <div className="mb-12">
          {/* Mobile: Stack vertically */}
          <div className="block md:hidden space-y-4">
            {winners.map((winner, index) => {
              const rank = winner.rank || index + 1;
              const configs = {
                1: {
                  icon: Trophy,
                  gradient: "from-yellow-400 via-orange-500 to-red-500",
                  textColor: "text-yellow-300",
                  iconColor: "text-yellow-400",
                  label: winner.isTied ? "1st Place (Tied)" : "1st Place",
                  emoji: "🏆",
                },
                2: {
                  icon: Medal,
                  gradient: "from-gray-300 via-gray-400 to-gray-500",
                  textColor: "text-gray-200",
                  iconColor: "text-gray-300",
                  label: winner.isTied ? "2nd Place (Tied)" : "2nd Place",
                  emoji: "🥈",
                },
                3: {
                  icon: Award,
                  gradient: "from-amber-600 via-amber-700 to-amber-800",
                  textColor: "text-amber-400",
                  iconColor: "text-amber-600",
                  label: winner.isTied ? "3rd Place (Tied)" : "3rd Place",
                  emoji: "🥉",
                },
              };
              const config = configs[rank];
              const Icon = config.icon;

              return (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-20`}
                  />
                  <div className="relative backdrop-blur-sm bg-black/40 border-2 border-orange-500/30 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Icon className={`w-12 h-12 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${config.textColor}`}
                        >
                          {config.label}
                        </p>
                        <p className="text-xl font-bold text-white font-display">
                          {winner.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {winner.voteCount}{" "}
                          {winner.voteCount === 1 ? "vote" : "votes"}
                        </p>
                      </div>
                      <div className="text-4xl">{config.emoji}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop: Podium layout */}
          <motion.div
            className="hidden md:flex justify-center items-end gap-4 mt-10 mb-10 min-h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Second Place */}
            {winners.length > 1 && (
              <motion.div
                className="relative z-10 w-1/3"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <Medal className="h-16 w-16 text-gray-300 drop-shadow-lg" />
                </div>
                <div className="relative overflow-hidden rounded-t-2xl h-40 backdrop-blur-lg bg-gradient-to-br from-gray-700/80 to-gray-800/80 border-2 border-gray-500/50 shadow-2xl p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300/10 to-transparent" />
                  <div className="relative">
                    <p className="font-bold text-gray-200 text-2xl mb-2">
                      2nd Place
                    </p>
                    <p className="text-white font-bold text-lg mb-1 font-display">
                      {winners[1].name}
                    </p>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30">
                      <Sparkles className="w-3 h-3 text-gray-300" />
                      <span className="text-gray-300 text-sm font-semibold">
                        {winners[1].voteCount} votes
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* First Place */}
            {winners.length > 0 && (
              <motion.div
                className="relative z-20 w-1/3"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="h-20 w-20 text-yellow-400 drop-shadow-lg" />
                  </motion.div>
                </div>
                <div className="relative overflow-hidden rounded-t-2xl h-56 backdrop-blur-lg bg-gradient-to-br from-orange-500/90 to-purple-600/90 border-2 border-yellow-400/50 shadow-2xl p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative"
                  >
                    <p className="font-bold text-white text-3xl mb-2">
                      1st Place!
                    </p>
                    <p className="text-white font-bold text-2xl mb-2 font-display">
                      {winners[0].name}
                    </p>
                    <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-yellow-400/30 backdrop-blur-sm border border-yellow-300/50 mb-2">
                      <Crown className="w-4 h-4 text-yellow-200" />
                      <span className="text-white text-base font-bold">
                        {winners[0].voteCount} votes
                      </span>
                    </div>
                    <p className="text-yellow-200 text-xl mt-2">
                      🏆 CHAMPION 🏆
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Third Place */}
            {winners.length > 2 && (
              <motion.div
                className="relative z-10 w-1/3"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                  <Award className="h-16 w-16 text-amber-600 drop-shadow-lg" />
                </div>
                <div className="relative overflow-hidden rounded-t-2xl h-32 backdrop-blur-lg bg-gradient-to-br from-amber-700/80 to-amber-800/80 border-2 border-amber-600/50 shadow-2xl p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent" />
                  <div className="relative">
                    <p className="font-bold text-amber-300 text-2xl mb-2">
                      3rd Place
                    </p>
                    <p className="text-white font-bold text-lg mb-1 font-display">
                      {winners[2].name}
                    </p>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-200 text-sm font-semibold">
                        {winners[2].voteCount} votes
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* All Results */}
      <h3 className="text-2xl sm:text-xl font-semibold text-orange-300 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        All Costumes
      </h3>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((costume) => (
          <CostumeCard key={costume.id} costume={costume} rank={costume.rank} />
        ))}
      </div>

      {/* Spooky Confetti Animation */}
      <div className="relative h-24 mt-12 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              top: "-5%",
              left: `${Math.random() * 100}%`,
              rotate: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              top: "100%",
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: Math.random() * 5,
            }}
          >
            {
              ["🎃", "👻", "🦇", "🕸️", "🧙‍♀️", "🧛‍♂️", "💀", "🔮"][
                Math.floor(Math.random() * 8)
              ]
            }
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;

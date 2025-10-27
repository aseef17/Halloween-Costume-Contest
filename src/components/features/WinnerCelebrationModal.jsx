import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Medal, Award, X, Sparkles, Star } from "lucide-react";
import Lottie from "lottie-react";
import Button from "../ui/Button";
import { useScrollLock } from "../../hooks/useScrollLock";

// Lottie animation data for celebrations
import trophyAnimation from "../../assets/lottie/trophy.json";
import confettiAnimation from "../../assets/lottie/confetti.json";
import fireworksAnimation from "../../assets/lottie/fireworks.json";

const WinnerCelebrationModal = ({
  rank,
  costumeName,
  voteCount,
  initialVoteCount,
  revoteVoteCount,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [confetti, setConfetti] = useState([]);

  // Lock scroll when modal is visible
  useScrollLock(isVisible);

  useEffect(() => {
    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    setConfetti(particles);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getRankConfig = () => {
    switch (rank) {
      case 1:
        return {
          icon: Trophy,
          title: "CHAMPION!",
          subtitle: "You Won 1st Place!",
          gradient: "from-yellow-400 via-orange-500 to-red-500",
          textColor: "text-yellow-300",
          bgColor: "from-yellow-500/20 to-orange-500/20",
          iconColor: "text-yellow-400",
          emoji: "🏆",
          animation: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] },
          lottieAnimation: trophyAnimation,
        };
      case 2:
        return {
          icon: Medal,
          title: "RUNNER-UP!",
          subtitle: "You Got 2nd Place!",
          gradient: "from-gray-300 via-gray-400 to-gray-500",
          textColor: "text-gray-200",
          bgColor: "from-gray-400/20 to-gray-500/20",
          iconColor: "text-gray-300",
          emoji: "🥈",
          animation: { scale: [1, 1.15, 1], y: [0, -10, 0] },
          lottieAnimation: fireworksAnimation,
        };
      case 3:
        return {
          icon: Award,
          title: "TOP THREE!",
          subtitle: "You Got 3rd Place!",
          gradient: "from-amber-600 via-amber-700 to-amber-800",
          textColor: "text-amber-400",
          bgColor: "from-amber-600/20 to-amber-800/20",
          iconColor: "text-amber-600",
          emoji: "🥉",
          animation: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
          lottieAnimation: confettiAnimation,
        };
      default:
        return null;
    }
  };

  const config = getRankConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          {/* Lottie Background Animation */}
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
            <Lottie
              animationData={config.lottieAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>

          {/* Confetti */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full z-10"
              style={{
                left: `${particle.x}%`,
                top: "-5%",
                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
              }}
              animate={{
                y: ["0vh", "110vh"],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Floating emojis */}
          {["🎃", "👻", "🦇", "⭐", "✨"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${20 + i * 20}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + i,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            >
              {emoji}
            </motion.div>
          ))}

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: -100, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {/* Glow effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} blur-3xl opacity-30 rounded-3xl`}
            />

            {/* Card content */}
            <div className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl border-2 border-orange-500/50 rounded-3xl overflow-hidden shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>

              {/* Header with animated icon */}
              <div className="relative pt-8 pb-6 px-6">
                <motion.div
                  animate={config.animation}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center mb-4"
                >
                  <div
                    className={`p-6 rounded-full bg-gradient-to-br ${config.bgColor} backdrop-blur-sm border-2 border-white/20`}
                  >
                    <Icon className={`w-16 h-16 ${config.iconColor}`} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-5xl font-halloween text-center ${config.textColor} mb-2 drop-shadow-lg`}
                >
                  {config.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl text-center text-gray-300 font-semibold"
                >
                  {config.subtitle}
                </motion.p>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-2 my-6">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                  <Star className="w-4 h-4 text-orange-400" />
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>

                {/* Costume details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-3"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30">
                    <p className="text-sm text-gray-400 mb-1">Your Costume</p>
                    <p className="text-xl font-bold text-orange-300">
                      {costumeName}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Total Votes</p>
                      <p className="text-3xl font-bold text-purple-300">
                        {voteCount}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-gray-700" />
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Rank</p>
                      <p className="text-3xl font-bold text-orange-300">
                        #{rank}
                      </p>
                    </div>
                  </div>

                  {/* Show vote breakdown if there are both initial and revote votes */}
                  {initialVoteCount > 0 && revoteVoteCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
                    >
                      <p className="text-sm text-gray-400 mb-3 text-center">
                        Vote Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">
                            Initial Votes
                          </p>
                          <p className="text-xl font-bold text-blue-300">
                            {initialVoteCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 mb-1">
                            Tie-Breaker Votes
                          </p>
                          <p className="text-xl font-bold text-purple-300">
                            {revoteVoteCount}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Emoji celebration */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-6xl text-center mt-6"
                >
                  {config.emoji}
                </motion.div>
              </div>

              {/* Footer with action */}
              <div className="px-6 pb-6">
                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                >
                  Awesome! Close
                </Button>
              </div>

              {/* Bottom decoration */}
              <div className="h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WinnerCelebrationModal;

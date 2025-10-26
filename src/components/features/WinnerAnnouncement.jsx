import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, X, Trophy, Party } from "lucide-react";
import Button from "../ui/Button";
import ConfettiEffect from "../layout/ConfettiEffect";
import { useApp } from "../../hooks/useApp";

const WinnerAnnouncement = ({ winner, rank, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const { user } = useApp();

  // Determine if this is the current user's win
  const isCurrentUserWin = user && winner && winner.userId === user.uid;

  // Trophy emoji based on rank
  const trophy =
    rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🎖️";

  // Title based on rank
  const title =
    rank === 1
      ? "GRAND WINNER!"
      : rank === 2
      ? "AWESOME 2ND PLACE!"
      : rank === 3
      ? "EXCELLENT 3RD PLACE!"
      : "HONORABLE MENTION!";

  // Message for the winner
  const message = isCurrentUserWin
    ? "Congratulations! Your costume was voted as one of the best!"
    : `This amazing costume received ${winner?.voteCount || 0} vote${
        winner?.voteCount !== 1 ? "s" : ""
      }!`;

  // Background gradient based on rank
  const bgGradient =
    rank === 1
      ? "from-yellow-500 via-orange-500 to-red-500"
      : rank === 2
      ? "from-gray-300 via-gray-400 to-gray-500"
      : rank === 3
      ? "from-amber-700 via-amber-600 to-amber-800"
      : "from-purple-600 to-indigo-700";

  // Disable confetti after a while
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {showConfetti && <ConfettiEffect intensity={rank === 1 ? 2 : 1} />}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`relative max-w-md w-full rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Background with animated gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-90`}
          ></div>
          {/* Close button */}
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white z-10 p-1 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Content */}
          <div className="relative p-8 text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-7xl mx-auto"
            >
              {trophy}
            </motion.div>

            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-halloween text-white mb-4"
            >
              {title}
            </motion.h2>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-black/30 p-4 rounded-xl mb-6"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {winner?.name || "Mystery Costume"}
              </h3>
              <p className="text-white/80 mb-4">
                {winner?.description || "No description provided"}
              </p>
              <p className="text-xl font-bold text-yellow-300">
                {winner?.voteCount || 0}{" "}
                {winner?.voteCount === 1 ? "vote" : "votes"}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/90 mb-6"
            >
              {message}
            </motion.p>

            {isCurrentUserWin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mb-4 flex justify-center"
              >
                <div className="px-6 py-3 bg-black/30 rounded-full text-yellow-300 text-xl font-bold animate-pulse">
                  🎉 You won! 🎉
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white"
              >
                {rank === 1
                  ? "Continue to winners gallery"
                  : "Return to results"}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WinnerAnnouncement;

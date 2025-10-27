import React from "react";
import { motion } from "motion/react";
import { X, Trophy, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";

const RevoteNotificationModal = ({
  isOpen,
  onClose,
  userRank,
  tiedCostumes,
  excludedUserIds,
  currentUserId,
}) => {
  if (!isOpen) return null;

  const isUserExcluded = excludedUserIds?.includes(currentUserId);
  const tiedCostumeNames = tiedCostumes
    ?.map((costume) => costume.name)
    .join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md mx-auto"
      >
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-black/90 backdrop-blur-xl border border-orange-500/30">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-orange-300 font-display">
                  Contest Results
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User's Rank */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/20">
                  <CheckCircle2 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-300 font-semibold text-lg">
                    Your Position: #{userRank}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {userRank === 1
                      ? "Congratulations! You're in first place!"
                      : userRank === 2
                        ? "Great job! You're in second place!"
                        : userRank === 3
                          ? "Well done! You're in third place!"
                          : "Thanks for participating!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tie Information */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-yellow-300 font-semibold text-base mb-2">
                    First Place Tie Detected!
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    There are {tiedCostumes?.length} costumes tied for first
                    place:{" "}
                    <span className="text-orange-300 font-semibold">
                      {tiedCostumeNames}
                    </span>
                  </p>
                  <p className="text-yellow-300 text-sm font-medium">
                    A revote has begun to break the tie!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {isUserExcluded ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 font-semibold text-base mb-1">
                      You're One of the Tied Contestants
                    </p>
                    <p className="text-gray-400 text-sm">
                      Since you're tied for first place, you cannot participate
                      in the revote. Other users will vote to determine the
                      winner among the tied costumes.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-300 font-semibold text-base mb-1">
                      You Can Vote in the Revote
                    </p>
                    <p className="text-gray-400 text-sm">
                      You can now vote for your favorite among the tied costumes
                      to help break the tie.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6">
              <Button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 text-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Continue to Contest
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 text-4xl opacity-20 pointer-events-none">
            🏆
          </div>
          <div className="absolute -bottom-4 -left-4 text-4xl opacity-20 pointer-events-none">
            🎃
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RevoteNotificationModal;

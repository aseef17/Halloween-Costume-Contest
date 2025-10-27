import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trophy, Users, AlertCircle, Crown } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import HalloweenIcon from "../layout/HalloweenIcon";

const RevoteNotificationModal = ({
  isOpen,
  onClose,
  userRank,
  tiedCostumes,
  isExcludedFromRevote,
  userCostume,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

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
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-orange-900/40 via-gray-900/60 to-purple-900/40 border-orange-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/30">
                      <Trophy className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-halloween text-orange-300">
                        Tie-Breaker Required!
                      </h2>
                      <p className="text-gray-400 text-sm">
                        A revote has been initiated
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content based on user status */}
                {isExcludedFromRevote ? (
                  <div className="space-y-4">
                    {/* Tied User Message */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                      <Crown className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-orange-300 mb-2">
                          Congratulations! You're in the Tie!
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          Your costume "{userCostume?.title}" is tied for first
                          place with:
                        </p>
                        <div className="space-y-2">
                          {tiedCostumes
                            .filter((costume) => costume.id !== userCostume?.id)
                            .map((costume) => (
                              <div
                                key={costume.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="text-gray-400">•</span>
                                <span className="text-white font-medium">
                                  {costume.title}
                                </span>
                                <span className="text-gray-500">
                                  by {costume.userName}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-blue-300 font-semibold mb-1">
                          Revote Rules
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Since you're tied for first place, you cannot vote in
                          the revote. Other users will vote to determine the
                          winner!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Non-tied User Message */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                      <Users className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-purple-300 mb-2">
                          Your Rank: #{userRank}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          The first place is tied between these costumes:
                        </p>
                        <div className="space-y-2">
                          {tiedCostumes.map((costume) => (
                            <div
                              key={costume.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-gray-400">•</span>
                              <span className="text-white font-medium">
                                {costume.title}
                              </span>
                              <span className="text-gray-500">
                                by {costume.userName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
                      <Trophy className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-green-300 font-semibold mb-1">
                          Your Vote Matters!
                        </h4>
                        <p className="text-gray-300 text-sm">
                          You can now vote for your favorite among the tied
                          costumes to help determine the winner!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <HalloweenIcon type="ghost" size="sm" animate />
                    <span>May the best costume win!</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RevoteNotificationModal;

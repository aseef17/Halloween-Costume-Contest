import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Vote, Info, Sparkles } from "lucide-react";
import CostumeCard from "./CostumeCard";
import { useApp } from "../../hooks/useApp";

const VotingSection = ({ costumes }) => {
  const { currentUserVote } = useApp();

  if (!costumes || costumes.length === 0) {
    return null;
  }

  const hasVoted = !!currentUserVote;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-3xl sm:text-4xl font-halloween text-orange-300 flex items-center gap-2">
          <Vote className="h-7 w-7 sm:h-8 sm:w-8" />
          Cast Your Vote!
        </h2>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-500/30">
          <Info className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300 font-medium">
            {hasVoted ? "You can change your vote" : "Pick your favorite"}
          </span>
        </div>
      </div>

      {hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4 sm:p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-start sm:items-center gap-3">
              <div className="flex-shrink-0 p-2 rounded-full bg-green-500/20">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-300 text-sm sm:text-base mb-1">
                  Vote Cast Successfully!
                </p>
                <p className="text-xs sm:text-sm text-green-300/80">
                  You can change your vote at any time while voting is open.
                </p>
              </div>
              <Sparkles className="hidden sm:block w-5 h-5 text-green-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Costume count badge */}
      <div className="flex items-center justify-between mb-4 sm:hidden">
        <span className="text-sm text-gray-400">
          {costumes.length} {costumes.length === 1 ? "Costume" : "Costumes"}
        </span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
          <Info className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-gray-300">
            {hasVoted ? "Change vote" : "Pick one"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {costumes.map((costume, index) => (
          <motion.div
            key={costume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CostumeCard costume={costume} showVoteButton={true} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default VotingSection;

import React, { useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Award,
  Edit,
  Trash2,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "../ui/Button";
import CostumeService from "../../services/CostumeService";
import { formatDate, cn } from "../../utils";
import { useApp } from "../../hooks/useApp";
import { useCostumeOperations } from "../../hooks/useAsyncOperations";
import { promiseToast } from "../../utils/toastUtils";
import { ariaLabels, keyboardNavigation } from "../../utils/accessibility";
import { animationVariants, hoverAnimations } from "../../utils/animations";

const CostumeCard = ({
  costume,
  rank,
  showVoteButton = false,
  showEditOptions = false,
  isPreview = false,
  onEdit,
}) => {
  const { user, appSettings, currentUserVote } = useApp();
  const { isLoading, voteForCostume, deleteCostume } = useCostumeOperations();

  // Memoized computed values
  const computedValues = useMemo(() => {
    const isVotedFor =
      currentUserVote && currentUserVote.costumeId === costume.id;
    const canVote =
      appSettings.votingEnabled &&
      user &&
      (appSettings.allowSelfVote || costume.userId !== user.uid);
    const isOwnCostume = user && costume.userId === user.uid;
    const showRank = rank && appSettings.resultsVisible;

    return { isVotedFor, canVote, isOwnCostume, showRank };
  }, [
    currentUserVote,
    costume.id,
    appSettings.votingEnabled,
    appSettings.allowSelfVote,
    appSettings.resultsVisible,
    user,
    costume.userId,
    rank,
  ]);

  // Optimized callbacks
  const handleVote = useCallback(async () => {
    if (!user) return;

    // Don't allow voting on own costume unless self-voting is enabled
    if (costume.userId === user.uid && !appSettings.allowSelfVote) return;

    try {
      await promiseToast.voteCast(
        voteForCostume(costume.id, user.uid, appSettings),
      );
    } catch (error) {
      // Error is handled by the promise toast
      console.error("Error voting:", error);
    }
  }, [user, costume.userId, costume.id, appSettings, voteForCostume]);

  const handleDeleteCostume = useCallback(async () => {
    if (!costume || !user) return;

    try {
      await promiseToast.costumeDelete(deleteCostume(costume.id));
    } catch (error) {
      // Error is handled by the promise toast
      console.error("Error deleting costume:", error);
    }
  }, [costume, user, deleteCostume]);

  const { isVotedFor, canVote, isOwnCostume, showRank } = computedValues;

  return (
    <motion.div
      className={cn(
        "relative rounded-3xl shadow-2xl border backdrop-blur-xl",
        "bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40",
        "hover:shadow-orange-500/20 transition-all duration-300",
        showRank && rank <= 3
          ? "border-orange-400/70 shadow-orange-400/20"
          : "border-orange-500/40 shadow-orange-500/10",
        isVotedFor && "ring-2 ring-purple-500/50 border-purple-500/50",
      )}
      {...animationVariants.fadeInUp}
      transition={{ duration: 0.5 }}
      {...hoverAnimations.cardHover}
      role="article"
      aria-label={`Costume: ${costume.name}`}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-3xl" />

      {/* Rank badge for top 3 */}
      {showRank && rank <= 3 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="absolute -top-3 -right-3 z-10"
        >
          <div
            className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full border-4 border-black/50",
              rank === 1 && "bg-gradient-to-br from-yellow-400 to-orange-500",
              rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-500",
              rank === 3 && "bg-gradient-to-br from-amber-600 to-amber-800",
            )}
          >
            <Award className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </motion.div>
      )}

      {/* Voted indicator */}
      {isVotedFor && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-purple-500/90 backdrop-blur-sm border border-purple-300/50"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white">Your Vote</span>
          </div>
        </motion.div>
      )}

      <div className="relative flex flex-col h-full p-6 overflow-hidden rounded-3xl">
        <div className="mb-4">
          {/* Rank indicator */}
          {showRank && (
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border",
                  rank === 1 &&
                    "bg-yellow-400/20 border-yellow-400/50 text-yellow-300",
                  rank === 2 &&
                    "bg-gray-400/20 border-gray-400/50 text-gray-200",
                  rank === 3 &&
                    "bg-amber-600/20 border-amber-600/50 text-amber-400",
                  rank > 3 &&
                    "bg-orange-500/20 border-orange-500/50 text-orange-300",
                )}
              >
                #{rank}
                {costume.isTied && " (Tied)"}
                {rank === 1 && " 🏆"}
                {rank === 2 && " 🥈"}
                {rank === 3 && " 🥉"}
              </div>
            </div>
          )}

          <h3
            className={cn(
              "text-2xl sm:text-3xl font-bold text-orange-300 font-display mb-2 leading-tight",
              rank && rank <= 3 && "text-3xl sm:text-4xl",
            )}
          >
            {costume.name}
          </h3>

          {costume.userName && !isOwnCostume && (
            <p className="text-gray-400 text-sm mb-3 font-medium">
              by {costume.userName}
            </p>
          )}
          {isOwnCostume && (
            <p className="text-orange-400 text-sm mb-3 font-medium">by You</p>
          )}

          {/* Costume Image */}
          {costume.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden border-2 border-orange-500/20">
              <img
                src={costume.imageUrl}
                alt={`${costume.name} costume`}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <p className="text-gray-300 text-sm sm:text-base mb-4 line-clamp-3">
            {costume.description}
          </p>

          {!isPreview && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="w-3 h-3" />
              <span>Submitted {formatDate(costume.submittedAt)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {/* Vote count badge */}
          {showRank && appSettings.resultsVisible && costume.voteCount > 0 && (
            <div className="space-y-2">
              {/* Total votes */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Total Votes
                </span>
                <span className="text-2xl font-bold text-orange-300">
                  {costume.voteCount}
                </span>
              </div>

              {/* Show initial and revote votes separately for tied costumes */}
              {(appSettings.revoteMode ||
                (appSettings.resultsVisible &&
                  costume.initialVoteCount > 0 &&
                  costume.revoteVoteCount > 0)) &&
                costume.initialVoteCount > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                      <span className="text-xs text-gray-400">Initial</span>
                      <span className="text-sm font-semibold text-blue-300">
                        {costume.initialVoteCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                      <span className="text-xs text-gray-400">
                        Tie Breaker Vote
                      </span>
                      <span className="text-sm font-semibold text-purple-300">
                        {costume.revoteVoteCount || 0}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {showVoteButton && canVote && (
              <Button
                onClick={handleVote}
                disabled={isLoading}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 text-sm sm:text-base font-semibold rounded-xl transition-all",
                  isVotedFor
                    ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                    : "bg-gradient-to-r from-orange-500 to-purple-700 hover:from-orange-600 hover:to-purple-800",
                )}
                aria-label={ariaLabels.vote(costume.name)}
                aria-pressed={isVotedFor}
                onKeyDown={keyboardNavigation.handleEnter(handleVote)}
                {...hoverAnimations.buttonHover}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Processing...
                  </>
                ) : isVotedFor ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Voted
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Vote
                  </>
                )}
              </Button>
            )}

            {showEditOptions &&
              appSettings.contestActive &&
              !appSettings.votingEnabled &&
              !appSettings.resultsVisible && (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 py-2.5 px-4 rounded-xl border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/10"
                    onClick={onEdit}
                    aria-label={ariaLabels.edit(costume.name)}
                    onKeyDown={keyboardNavigation.handleEnter(onEdit)}
                    {...hoverAnimations.buttonHover}
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Button>

                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/30"
                    onClick={handleDeleteCostume}
                    disabled={isLoading}
                    aria-label={ariaLabels.delete(costume.name)}
                    onKeyDown={keyboardNavigation.handleEnter(
                      handleDeleteCostume,
                    )}
                    {...hoverAnimations.buttonHover}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Delete
                      </>
                    )}
                  </Button>
                </>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CostumeCard;

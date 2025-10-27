import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import {
  LogOut,
  UserCircle,
  Skull,
  PlusCircle,
  Settings,
  Ghost,
  Play,
  Pause,
  Eye,
  EyeOff,
  RotateCcw,
  Trophy,
  Zap,
  AlertCircle,
  Mail,
} from "lucide-react";
import Lottie from "lottie-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import CostumeCard from "./CostumeCard";
import CostumeForm from "./CostumeForm";
import VotingSection from "./VotingSection";
import ResultsSection from "./ResultsSection";
import HalloweenIcon from "../layout/HalloweenIcon";
import { useApp } from "../../hooks/useApp";
import { gridClasses, typography } from "../../utils/responsive";
import { ariaLabels, keyboardNavigation } from "../../utils/accessibility";
import { animationVariants, hoverAnimations } from "../../utils/animations";
import { cn, shuffleArray } from "../../utils";
import { CostumeCardSkeleton, VotingSectionSkeleton } from "../ui/Skeleton";
import { useAdminOperations } from "../../hooks/useAsyncOperations";
import { adminToasts, promiseToast } from "../../utils/toastUtils";

const Dashboard = ({ onSwitchToAdmin, isAdmin }) => {
  const { user, userCostume, costumes, appSettings, costumeResults } = useApp();

  const [showAddCostume, setShowAddCostume] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [showQuickControls, setShowQuickControls] = useState(false);

  const {
    isLoading: isAdminLoading,
    toggleVoting,
    toggleResults,
    startRevote,
    endRevote,
  } = useAdminOperations();

  // Memoized filtered costumes for voting
  const votableCostumes = useMemo(() => {
    if (!costumes.length) return [];

    let filtered;

    // If in revote mode, only show the tied costumes
    if (appSettings.revoteMode && appSettings.revoteCostumeIds?.length > 0) {
      filtered = costumes.filter((costume) =>
        appSettings.revoteCostumeIds.includes(costume.id),
      );
    } else {
      // Normal voting mode - filter out own costume if self-voting not allowed
      filtered = costumes.filter(
        (costume) => appSettings.allowSelfVote || costume.userId !== user?.uid,
      );
    }

    return shuffleArray(filtered);
  }, [
    costumes,
    appSettings.allowSelfVote,
    appSettings.revoteMode,
    appSettings.revoteCostumeIds,
    user?.uid,
  ]);

  // Memoized other costumes (excluding user's own)
  const otherCostumes = useMemo(() => {
    if (!costumes.length) return [];

    return costumes.filter((costume) => costume.userId !== user?.uid);
  }, [costumes, user?.uid]);

  // Optimized callbacks
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const handleEditCostume = useCallback((costume) => {
    setEditingCostume(costume);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCostume(null);
  }, []);

  const handleCostumeSuccess = useCallback(() => {
    setShowAddCostume(false);
    setEditingCostume(null);
  }, []);

  // Admin quick actions
  const handleToggleVoting = useCallback(async () => {
    try {
      await toggleVoting(!appSettings.votingEnabled);
      if (!appSettings.votingEnabled) {
        adminToasts.votingEnabled();
      } else {
        adminToasts.votingDisabled();
      }
    } catch (error) {
      console.error("Error toggling voting:", error);
    }
  }, [appSettings.votingEnabled, toggleVoting]);

  const handleToggleResults = useCallback(async () => {
    try {
      await toggleResults(!appSettings.resultsVisible);
      if (!appSettings.resultsVisible) {
        adminToasts.resultsShown();
      } else {
        adminToasts.resultsHidden();
      }
    } catch (error) {
      console.error("Error toggling results:", error);
    }
  }, [appSettings.resultsVisible, toggleResults]);

  const handleStartRevote = useCallback(async () => {
    const firstPlaceTied = costumeResults.filter((c) => c.rank === 1);
    if (firstPlaceTied.length > 1) {
      try {
        const tiedIds = firstPlaceTied.map((c) => c.id);
        await promiseToast.revoteStart(startRevote(tiedIds));
      } catch (error) {
        adminToasts.revoteError();
        console.error("Error starting revote:", error);
      }
    }
  }, [costumeResults, startRevote]);

  const handleEndRevote = useCallback(async () => {
    try {
      await promiseToast.revoteEnd(endRevote());
    } catch (error) {
      adminToasts.revoteError();
      console.error("Error ending revote:", error);
    }
  }, [endRevote]);

  // Check for first place ties
  const firstPlaceTie = useMemo(() => {
    if (!costumeResults || costumeResults.length < 2) return null;
    const firstPlace = costumeResults.filter((c) => c.rank === 1);
    if (firstPlace.length > 1 && firstPlace[0].voteCount > 0) {
      return firstPlace;
    }
    return null;
  }, [costumeResults]);

  // Loading states
  const isLoadingCostumes = !costumes.length;
  const isLoadingVoting = appSettings.votingEnabled && !votableCostumes.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8"
    >
      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-full bg-yellow-500/20">
                  <Mail className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-yellow-300 font-semibold text-lg mb-2">
                    Email Verification Required
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Please verify your email address to participate in the
                    contest. Check your inbox (and spam folder) for a
                    verification link.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/10"
                      onClick={() => window.location.reload()}
                    >
                      <AlertCircle className="w-4 h-4" />
                      Refresh After Verification
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      {/* Header - Mobile optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <motion.h1
              {...animationVariants.fadeInDown}
              className={cn(
                typography.h1,
                "text-white mb-2 flex items-center gap-3",
              )}
            >
              <HalloweenIcon type="pumpkin" size="lg" animate />
              <span className="leading-tight">Spooktacular Contest</span>
            </motion.h1>
            <p className="text-sm sm:text-base text-gray-400">
              Welcome back,{" "}
              <span className="text-orange-300 font-semibold">
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
              !
            </p>
          </div>

          <div className={gridClasses.buttonGroup}>
            {isAdmin && onSwitchToAdmin && (
              <Button
                variant="ghost"
                className="flex items-center gap-2 self-start sm:self-auto rounded-xl hover:bg-orange-900/20 text-orange-300 hover:text-orange-200"
                onClick={onSwitchToAdmin}
                aria-label={ariaLabels.toggle("admin panel")}
                onKeyDown={keyboardNavigation.handleEnter(onSwitchToAdmin)}
                {...hoverAnimations.buttonHover}
              >
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </Button>
            )}
            <Button
              variant="ghost"
              className="flex items-center gap-2 self-start sm:self-auto rounded-xl hover:bg-red-900/20 text-gray-300 hover:text-red-400"
              onClick={handleLogout}
              aria-label={ariaLabels.logout}
              onKeyDown={keyboardNavigation.handleEnter(handleLogout)}
              {...hoverAnimations.buttonHover}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Admin Controls - Only for admins */}
      {isAdmin && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-900/40 via-gray-900/60 to-orange-900/40 border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-300">
                    Quick Admin Controls
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickControls(!showQuickControls)}
                  className="text-purple-300 hover:text-purple-200"
                >
                  {showQuickControls ? "Hide" : "Show"}
                </Button>
              </div>

              {showQuickControls && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                >
                  {/* Toggle Voting */}
                  <Button
                    onClick={handleToggleVoting}
                    disabled={isAdminLoading}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                      appSettings.votingEnabled
                        ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                        : "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900",
                    )}
                  >
                    {appSettings.votingEnabled ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Close Voting
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Open Voting
                      </>
                    )}
                  </Button>

                  {/* Toggle Results */}
                  <Button
                    onClick={handleToggleResults}
                    disabled={isAdminLoading}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                      appSettings.resultsVisible
                        ? "bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900"
                        : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900",
                    )}
                  >
                    {appSettings.resultsVisible ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Results
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Results
                      </>
                    )}
                  </Button>

                  {/* Revote Controls */}
                  {appSettings.revoteMode ? (
                    <Button
                      onClick={handleEndRevote}
                      disabled={isAdminLoading}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                    >
                      <RotateCcw className="h-4 w-4" />
                      End Revote
                    </Button>
                  ) : firstPlaceTie && firstPlaceTie.length > 1 ? (
                    <Button
                      onClick={handleStartRevote}
                      disabled={isAdminLoading}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900"
                    >
                      <Trophy className="h-4 w-4" />
                      Start Revote
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gray-600/50 cursor-not-allowed"
                    >
                      <Trophy className="h-4 w-4" />
                      No Tie
                    </Button>
                  )}

                  {/* Full Admin Panel */}
                  <Button
                    onClick={onSwitchToAdmin}
                    variant="ghost"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border-2 border-purple-500/30 hover:bg-purple-900/20 text-purple-300"
                  >
                    <Settings className="h-4 w-4" />
                    Full Admin
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Contest Status - Modern card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40 border-orange-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skull className="h-5 w-5 text-orange-400" />
                  <h2 className="text-lg sm:text-xl font-semibold text-orange-300">
                    Contest Status
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {appSettings.votingEnabled
                    ? "Voting is open! Cast your vote for your favorite costume."
                    : appSettings.resultsVisible
                      ? "The contest has ended. Check out the results!"
                      : "Submissions are open. Add your costume to join the fun!"}
                </p>
              </div>

              <div className="flex sm:flex-col gap-3 sm:gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full animate-pulse",
                      appSettings.contestActive ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                  <span className="text-xs sm:text-sm text-gray-300 font-medium">
                    {appSettings.contestActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full animate-pulse",
                      appSettings.votingEnabled
                        ? "bg-green-500"
                        : "bg-yellow-500",
                    )}
                  />
                  <span className="text-xs sm:text-sm text-gray-300 font-medium">
                    {appSettings.votingEnabled ? "Voting" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User's Costume Section */}
      {/* Your Costume Section - Only show when voting is NOT enabled */}
      {!appSettings.votingEnabled && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-2xl sm:text-3xl font-display text-white flex items-center gap-3">
              <HalloweenIcon type="ghost" size="md" animate />
              Your Costume
            </h2>

            {!userCostume &&
              !appSettings.votingEnabled &&
              !showAddCostume &&
              user?.emailVerified && (
                <Button
                  onClick={() => setShowAddCostume(true)}
                  variant="default"
                  animation="spooky"
                  className="flex items-center justify-center gap-2 py-2.5 sm:py-2 px-5 w-full sm:w-auto"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="font-semibold">Add Costume</span>
                </Button>
              )}
          </div>

          {showAddCostume && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <CostumeForm
                userId={user.uid}
                onSuccess={handleCostumeSuccess}
                onCancel={() => setShowAddCostume(false)}
              />
            </motion.div>
          )}

          {editingCostume && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <CostumeForm
                costume={editingCostume}
                isEdit={true}
                userId={user.uid}
                onSuccess={handleCostumeSuccess}
                onCancel={handleCancelEdit}
              />
            </motion.div>
          )}

          {/* Your Costume Section - Only show when voting is NOT enabled */}
          {!appSettings.votingEnabled && (
            <>
              {userCostume ? (
                <CostumeCard
                  costume={
                    appSettings.resultsVisible
                      ? costumeResults.find((c) => c.id === userCostume.id) ||
                        userCostume
                      : userCostume
                  }
                  showEditOptions={!appSettings.votingEnabled}
                  showVoteButton={appSettings.votingEnabled}
                  rank={
                    appSettings.resultsVisible
                      ? costumeResults.find((c) => c.id === userCostume.id)
                          ?.rank
                      : undefined
                  }
                  onEdit={() => handleEditCostume(userCostume)}
                />
              ) : !showAddCostume ? (
                <Card className="text-center p-8 sm:p-12 border-dashed border-2 border-orange-500/30 backdrop-blur-xl bg-gradient-to-br from-black/40 via-gray-900/40 to-orange-900/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <UserCircle className="h-16 w-16 sm:h-20 sm:w-20 text-orange-500/50 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-display text-white mb-2">
                      No Costume Yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md mx-auto">
                      {appSettings.votingEnabled
                        ? "Costume submissions are now closed."
                        : "Add your costume to join the Halloween contest!"}
                    </p>

                    {!appSettings.votingEnabled && user?.emailVerified && (
                      <Button
                        onClick={() => setShowAddCostume(true)}
                        variant="default"
                        animation="haunted"
                        className="flex items-center gap-2 mx-auto py-3 px-6"
                      >
                        <PlusCircle className="h-5 w-5" />
                        <span className="font-semibold">Add Your Costume</span>
                      </Button>
                    )}
                  </div>
                </Card>
              ) : null}
            </>
          )}
        </motion.div>
      )}

      {/* Other Costumes Section - Only show when voting is NOT enabled */}
      {!appSettings.votingEnabled &&
        costumes.filter((costume) => costume.userId !== user?.uid).length >
          0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-display text-white flex items-center gap-3 mb-6">
              <HalloweenIcon type="ghost" size="md" animate />
              Other Costumes
            </h2>
            <div className={gridClasses.costumeGrid}>
              {isLoadingCostumes
                ? Array.from({ length: 6 }).map((_, index) => (
                    <CostumeCardSkeleton key={index} />
                  ))
                : otherCostumes.map((costume) => {
                    const costumeWithRank = appSettings.resultsVisible
                      ? costumeResults.find((c) => c.id === costume.id) ||
                        costume
                      : costume;
                    return (
                      <CostumeCard
                        key={costume.id}
                        costume={costumeWithRank}
                        showVoteButton={appSettings.votingEnabled}
                        rank={
                          appSettings.resultsVisible
                            ? costumeWithRank.rank
                            : undefined
                        }
                      />
                    );
                  })}
            </div>
          </motion.div>
        )}

      {/* Voting or Results Section */}
      {appSettings.votingEnabled && votableCostumes.length > 0 ? (
        isLoadingVoting ? (
          <VotingSectionSkeleton />
        ) : (
          <VotingSection costumes={votableCostumes} />
        )
      ) : appSettings.resultsVisible ? (
        <ResultsSection results={costumeResults} />
      ) : null}

      {/* If voting is enabled but there are no costumes to vote for */}
      {appSettings.votingEnabled && votableCostumes.length === 0 && (
        <Card className="text-center p-8 sm:p-12 backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40 border-orange-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Ghost className="h-16 w-16 sm:h-20 sm:w-20 text-orange-500/50 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-display text-white mb-2">
              No Costumes to Vote On
            </h3>
            <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto">
              There are no other costumes to vote for at the moment.
              {!userCostume &&
                " You can still add your own costume if submissions are open!"}
            </p>
          </div>
        </Card>
      )}

      {/* Footer with spooky decorations */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-4 mb-4 text-xl">
          {["🎃", "👻", "💀", "🧟‍♂️", "🦇", "🕸️", "🕷️"].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -10, 0],
                rotate: [0, i % 2 ? 10 : -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2 + (i % 3),
                delay: i * 0.2,
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        <p>Halloween Costume Contest © 2025</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;

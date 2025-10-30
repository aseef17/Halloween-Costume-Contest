import { useState, useEffect, useMemo, useCallback } from "react";
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
  AlertTriangle,
  Mail,
  RefreshCw,
} from "lucide-react";
import Lottie from "lottie-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import CostumeCard from "./CostumeCard";
import CostumeForm from "./CostumeForm";
import VotingSection from "./VotingSection";
import RevoteSection from "./RevoteSection";
import ResultsSection from "./ResultsSection";
import RevoteNotificationModal from "./RevoteNotificationModal";
import UnvotedUsersModal from "../ui/UnvotedUsersModal";
import NotificationService from "../../services/NotificationService";
import logger from "../../utils/logger";
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
  const {
    user,
    userCostume,
    costumes,
    votes,
    revoteVotes,
    appSettings,
    costumeResults,
  } = useApp();

  const [showAddCostume, setShowAddCostume] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [showQuickControls, setShowQuickControls] = useState(false);
  const [showRevoteNotification, setShowRevoteNotification] = useState(false);
  const [showUnvotedUsersModal, setShowUnvotedUsersModal] = useState(false);
  const [unvotedUsers, setUnvotedUsers] = useState([]);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isMovingToNextPhase, setIsMovingToNextPhase] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [dismissedModals, setDismissedModals] = useState({
    revoteNotification: false,
    winnerCelebration: false,
  });

  const {
    isLoading: isAdminLoading,
    toggleVoting,
    toggleResults,
    closeVotingWithAutoRevote,
    endRevote,
  } = useAdminOperations();

  // Memoized filtered costumes for voting
  const votableCostumes = useMemo(() => {
    if (!costumes.length) return [];

    let filtered;

    // If in revote mode, only show the tied costumes
    if (
      appSettings.revoteMode &&
      appSettings.revoteCostumeIds &&
      appSettings.revoteCostumeIds.length > 0
    ) {
      filtered = costumes.filter((costume) =>
        appSettings.revoteCostumeIds.includes(costume.id)
      );
    } else {
      // Normal voting mode - filter out own costume if self-voting not allowed
      // BUT if there's only one costume total, allow voting for it
      const otherCostumes = costumes.filter(
        (costume) => costume.userId !== user?.uid
      );

      if (otherCostumes.length === 0 && costumes.length === 1) {
        // Only one costume exists (user's own) - allow voting for it
        filtered = costumes;
      } else {
        // Multiple costumes exist - apply normal filtering
        filtered = costumes.filter(
          (costume) => appSettings.allowSelfVote || costume.userId !== user?.uid
        );
      }
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
      logger.error("Error signing out:", error);
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
      logger.error("Error toggling voting:", error);
    }
  }, [appSettings.votingEnabled, toggleVoting]);

  // New simplified handlers for phase-based flow
  const handleCloseVotingAndShowResults = useCallback(async () => {
    try {
      const result = await promiseToast.closeVotingWithAutoRevote(
        closeVotingWithAutoRevote(costumeResults)
      );
      if (result.autoRevoteTriggered) {
        adminToasts.autoRevoteTriggered();
      } else {
        adminToasts.votingDisabled();
        adminToasts.resultsShown();
      }
    } catch (error) {
      logger.error("Error closing voting and showing results:", error);
    }
  }, [closeVotingWithAutoRevote, costumeResults]);

  // Phase reversion handlers
  const handleRevertToContestActive = useCallback(async () => {
    try {
      await promiseToast.toggleVoting(toggleVoting(false));
      await promiseToast.toggleResults(toggleResults(false));
      adminToasts.votingDisabled();
      adminToasts.resultsHidden();
    } catch (error) {
      logger.error("Error reverting to contest active:", error);
    }
  }, [toggleVoting, toggleResults]);

  const handleRevertToVotingEnabled = useCallback(async () => {
    try {
      await promiseToast.toggleResults(toggleResults(false));
      await promiseToast.toggleVoting(toggleVoting(true));
      adminToasts.resultsHidden();
      adminToasts.votingEnabled();
    } catch (error) {
      logger.error("Error reverting to voting enabled:", error);
    }
  }, [toggleVoting, toggleResults]);

  // End revote handler
  const handleEndRevote = useCallback(async () => {
    try {
      await promiseToast.revoteEnd(endRevote());
      adminToasts.revoteEnded();
    } catch (error) {
      logger.error("Error ending revote:", error);
    }
  }, [endRevote]);

  // Fetch all users from Firestore
  const fetchAllUsers = useCallback(async () => {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../../firebaseConfig");

      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      return users;
    } catch (error) {
      logger.error("Error fetching users:", error);
      return [];
    }
  }, []);

  // Handle closing voting with unvoted users check
  const handleCloseVotingWithUnvotedCheck = useCallback(async () => {
    try {
      const allUsers = await fetchAllUsers();
      const unvoted = NotificationService.getUnvotedUsers(
        allUsers,
        votes,
        revoteVotes,
        appSettings.revoteMode
      );

      // Filter out the current admin user from notifications
      const unvotedNonAdmins = unvoted.filter((u) => u.uid !== user?.uid);

      if (unvotedNonAdmins.length > 0) {
        setUnvotedUsers(unvotedNonAdmins);
        setShowUnvotedUsersModal(true);
      } else {
        // No unvoted users, proceed with closing voting
        await handleCloseVotingAndShowResults();
      }
    } catch (error) {
      logger.error("Error checking unvoted users:", error);
      // Fallback to normal close voting
      await handleCloseVotingAndShowResults();
    }
  }, [
    fetchAllUsers,
    votes,
    revoteVotes,
    appSettings.revoteMode,
    handleCloseVotingAndShowResults,
    user?.uid,
  ]);

  // Handle ending tie breaker vote with unvoted users check
  const handleEndRevoteWithUnvotedCheck = useCallback(async () => {
    try {
      const allUsers = await fetchAllUsers();
      const unvoted = NotificationService.getUnvotedUsers(
        allUsers,
        votes,
        revoteVotes,
        true
      );

      // Filter out the current admin user from notifications
      const unvotedNonAdmins = unvoted.filter((u) => u.uid !== user?.uid);

      if (unvotedNonAdmins.length > 0) {
        setUnvotedUsers(unvotedNonAdmins);
        setShowUnvotedUsersModal(true);
      } else {
        // No unvoted users, proceed with ending revote
        await handleEndRevote();
      }
    } catch (error) {
      logger.error("Error checking unvoted users for revote:", error);
      // Fallback to normal end revote
      await handleEndRevote();
    }
  }, [fetchAllUsers, votes, revoteVotes, handleEndRevote, user?.uid]);

  // Send reminders to users
  const handleSendReminders = useCallback(
    async (usersToNotify) => {
      setIsSendingReminders(true);
      try {
        const notificationType = appSettings.revoteMode
          ? "tie_breaker_reminder"
          : "voting_reminder";
        await NotificationService.sendVotingReminders(
          usersToNotify,
          notificationType
        );

        adminToasts.votingEnabled(); // Success message for reminders sent
      } catch (error) {
        logger.error("Error sending reminders:", error);
      } finally {
        setIsSendingReminders(false);
      }
    },
    [appSettings.revoteMode]
  );

  // Move to next phase
  const handleMoveToNextPhase = useCallback(async () => {
    setIsMovingToNextPhase(true);
    try {
      // Close the modal first
      setShowUnvotedUsersModal(false);

      if (appSettings.revoteMode) {
        await handleEndRevote();
      } else {
        await handleCloseVotingAndShowResults();
      }
    } catch (error) {
      logger.error("Error moving to next phase:", error);
    } finally {
      setIsMovingToNextPhase(false);
    }
  }, [
    appSettings.revoteMode,
    handleEndRevote,
    handleCloseVotingAndShowResults,
  ]);

  // Refetch unvoted users
  const handleRefetchUnvotedUsers = useCallback(async () => {
    setIsRefetching(true);
    try {
      const allUsers = await fetchAllUsers();
      const unvoted = NotificationService.getUnvotedUsers(
        allUsers,
        votes,
        revoteVotes,
        appSettings.revoteMode
      );

      // Filter out the current admin user from notifications
      const unvotedNonAdmins = unvoted.filter((u) => u.uid !== user?.uid);
      setUnvotedUsers(unvotedNonAdmins);
    } catch (error) {
      logger.error("Error refetching unvoted users:", error);
    } finally {
      setIsRefetching(false);
    }
  }, [fetchAllUsers, votes, revoteVotes, appSettings.revoteMode, user?.uid]);

  // Reset dismissed modals when relevant state changes
  useEffect(() => {
    // Reset revote notification dismissal when revote mode changes
    if (appSettings.revoteMode && appSettings.votingEnabled) {
      setDismissedModals((prev) => ({ ...prev, revoteNotification: false }));
    }
  }, [appSettings.revoteMode, appSettings.votingEnabled]);

  // Show revote notification when revote mode starts (only if not dismissed)
  useEffect(() => {
    if (
      appSettings.revoteMode &&
      appSettings.votingEnabled &&
      !dismissedModals.revoteNotification &&
      !showRevoteNotification
    ) {
      // Small delay to ensure the revote has been properly set up
      const timer = setTimeout(() => {
        setShowRevoteNotification(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    appSettings.revoteMode,
    appSettings.votingEnabled,
    dismissedModals.revoteNotification,
    showRevoteNotification,
  ]);

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
                "text-white mb-2 flex items-center gap-3"
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

      {/* Quick Admin Controls - Simplified Phase-Based */}
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
              <div className="flex items-center justify-between mb-4">
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
                  className="space-y-4"
                >
                  {/* Phase Progress Indicator */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {/* Contest Active */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        !appSettings.votingEnabled &&
                        !appSettings.resultsVisible &&
                        !appSettings.revoteMode
                          ? "bg-green-500/20 border border-green-500/30"
                          : "bg-gray-500/20 border border-gray-500/30"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          !appSettings.votingEnabled &&
                          !appSettings.resultsVisible &&
                          !appSettings.revoteMode
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-white">
                        Contest Active
                      </span>
                    </div>

                    {/* Voting Enabled */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        appSettings.votingEnabled &&
                        !appSettings.resultsVisible &&
                        !appSettings.revoteMode
                          ? "bg-blue-500/20 border border-blue-500/30"
                          : "bg-gray-500/20 border border-gray-500/30"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          appSettings.votingEnabled &&
                          !appSettings.resultsVisible &&
                          !appSettings.revoteMode
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-white">
                        Voting Enabled
                      </span>
                    </div>

                    {/* Revote In Progress */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        appSettings.revoteMode && appSettings.votingEnabled
                          ? "bg-orange-500/20 border border-orange-500/30"
                          : "bg-gray-500/20 border border-gray-500/30"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          appSettings.revoteMode && appSettings.votingEnabled
                            ? "bg-orange-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-white">
                        Tie Breaker Vote In Progress
                      </span>
                    </div>

                    {/* Results Shown */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        !appSettings.votingEnabled &&
                        appSettings.resultsVisible &&
                        !appSettings.revoteMode
                          ? "bg-purple-500/20 border border-purple-500/30"
                          : "bg-gray-500/20 border border-gray-500/30"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          !appSettings.votingEnabled &&
                          appSettings.resultsVisible &&
                          !appSettings.revoteMode
                            ? "bg-purple-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-white">
                        Results Shown
                      </span>
                    </div>
                  </div>

                  {/* Main Action Button */}
                  <div className="text-center">
                    {!appSettings.votingEnabled &&
                    !appSettings.resultsVisible ? (
                      <div>
                        <p className="text-gray-400 text-sm mb-3">
                          Contest is active. Ready to start voting?
                        </p>
                        <Button
                          onClick={() => handleToggleVoting(true)}
                          disabled={isAdminLoading}
                          className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {isAdminLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </motion.div>
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Start Voting
                            </>
                          )}
                        </Button>
                      </div>
                    ) : appSettings.votingEnabled &&
                      !appSettings.resultsVisible ? (
                      <div>
                        <p className="text-gray-400 text-sm mb-3">
                          Voting is active. Ready to close voting and show
                          results?
                        </p>
                        <Button
                          onClick={handleCloseVotingWithUnvotedCheck}
                          disabled={isAdminLoading}
                          className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                        >
                          {isAdminLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </motion.div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Close Voting & Show Results
                            </>
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* Phase Reversion Controls */}
                  {(appSettings.votingEnabled ||
                    appSettings.resultsVisible) && (
                    <div className="text-center pt-4 border-t border-purple-500/20">
                      <p className="text-gray-400 text-xs mb-3">
                        Need to go back? Revert to previous phase
                      </p>
                      <div className="flex gap-2 justify-center">
                        {appSettings.resultsVisible && (
                          <Button
                            onClick={handleRevertToVotingEnabled}
                            disabled={isAdminLoading}
                            variant="outline"
                            className="flex items-center gap-2 text-blue-300 border-blue-500/50 hover:bg-blue-500/10"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Back to Voting
                          </Button>
                        )}
                        {appSettings.votingEnabled && (
                          <Button
                            onClick={handleRevertToContestActive}
                            disabled={isAdminLoading}
                            variant="outline"
                            className="flex items-center gap-2 text-green-300 border-green-500/50 hover:bg-green-500/10"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Back to Contest
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* End Revote Controls */}
                  {appSettings.revoteMode && appSettings.votingEnabled && (
                    <div className="text-center pt-4 border-t border-purple-500/20">
                      <p className="text-gray-400 text-xs mb-3">
                        Tie Breaker Vote is active. End it when all eligible
                        users have voted.
                      </p>
                      <Button
                        onClick={handleEndRevoteWithUnvotedCheck}
                        disabled={isAdminLoading}
                        className="flex items-center gap-2 mx-auto rounded-xl py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        <Trophy className="h-4 w-4" />
                        End Tie Breaker Vote
                      </Button>
                    </div>
                  )}

                  {/* Full Admin Panel */}
                  <div className="text-center pt-4 border-t border-purple-500/20">
                    <Button
                      onClick={onSwitchToAdmin}
                      variant="ghost"
                      className="flex items-center justify-center gap-2 mx-auto rounded-xl font-semibold border-2 border-purple-500/30 hover:bg-purple-900/20 text-purple-300"
                    >
                      <Settings className="h-4 w-4" />
                      Full Admin Panel
                    </Button>
                  </div>
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
                      appSettings.contestActive ? "bg-green-500" : "bg-red-500"
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
                        : "bg-yellow-500"
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
      {/* Your Costume Section */}
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
            !appSettings.resultsVisible &&
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

          {/* Costume submission status messages */}
          {!userCostume && user?.emailVerified && (
            <div className="text-center">
              {appSettings.votingEnabled ? (
                <p className="text-yellow-400 text-sm">
                  ⚠️ Costume submission is closed while voting is active
                </p>
              ) : appSettings.resultsVisible ? (
                <p className="text-purple-400 text-sm">
                  🏁 Contest is over - costume submission is closed
                </p>
              ) : null}
            </div>
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

        {/* Your Costume Section */}
        <>
          {userCostume ? (
            <CostumeCard
              costume={
                appSettings.resultsVisible
                  ? costumeResults.find((c) => c.id === userCostume.id) ||
                    userCostume
                  : userCostume
              }
              showEditOptions={
                appSettings.contestActive &&
                !appSettings.votingEnabled &&
                !appSettings.resultsVisible
              }
              showVoteButton={appSettings.votingEnabled}
              rank={
                appSettings.resultsVisible
                  ? costumeResults.find((c) => c.id === userCostume.id)?.rank
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

                {appSettings.contestActive &&
                  !appSettings.votingEnabled &&
                  !appSettings.resultsVisible &&
                  user?.emailVerified && (
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
      </motion.div>

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
        ) : appSettings.revoteMode ? (
          <RevoteSection costumes={votableCostumes} />
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
              {costumes.length === 0
                ? "No costumes have been submitted yet. Be the first to add one!"
                : costumes.length === 1 && costumes[0]?.userId === user?.uid
                ? "You're the only one who has submitted a costume so far. Wait for others to join!"
                : "There are no other costumes to vote for at the moment."}
            </p>
            {costumes.length === 0 &&
              appSettings.contestActive &&
              !appSettings.votingEnabled &&
              !appSettings.resultsVisible && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowAddCostume(true)}
                    variant="default"
                    animation="haunted"
                    className="flex items-center gap-2 mx-auto py-3 px-6"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-semibold">Add Your Costume</span>
                  </Button>
                </div>
              )}
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

      {/* Revote Notification Modal */}
      <RevoteNotificationModal
        isOpen={showRevoteNotification}
        onClose={() => {
          setShowRevoteNotification(false);
          setDismissedModals((prev) => ({ ...prev, revoteNotification: true }));
        }}
        userRank={
          costumeResults.findIndex((costume) => costume.userId === user?.uid) +
          1
        }
        tiedCostumes={costumeResults.filter((costume) => costume.rank === 1)}
        isExcludedFromRevote={appSettings.revoteExcludedUserIds?.includes(
          user?.uid
        )}
        userCostume={userCostume}
      />

      {/* Unvoted Users Modal */}
      <UnvotedUsersModal
        isOpen={showUnvotedUsersModal}
        onClose={() => setShowUnvotedUsersModal(false)}
        unvotedUsers={unvotedUsers}
        onSendReminders={handleSendReminders}
        onMoveToNextPhase={handleMoveToNextPhase}
        onRefetch={handleRefetchUnvotedUsers}
        isSendingReminders={isSendingReminders}
        isMovingToNextPhase={isMovingToNextPhase}
        isRefetching={isRefetching}
        title={
          appSettings.revoteMode
            ? "Users Who Haven't Voted in Tie Breaker"
            : "Users Who Haven't Voted"
        }
        description={
          appSettings.revoteMode
            ? "The following users have not yet cast their tie breaker votes:"
            : "The following users have not yet cast their votes:"
        }
      />
    </motion.div>
  );
};

export default Dashboard;

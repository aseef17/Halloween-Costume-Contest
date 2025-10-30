import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import {
  LogOut,
  Settings,
  BarChart3,
  Users,
  Play,
  Pause,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Trophy,
  Loader2,
  Vote,
  UserCircle,
  Trash2,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Switch } from "../ui/Switch";
import ConfirmationModal from "../ui/ConfirmationModal";
import UnvotedUsersModal from "../ui/UnvotedUsersModal";
import NotificationService from "../../services/NotificationService";
import logger from "../../utils/logger";
import HalloweenIcon from "../layout/HalloweenIcon";
import AdminService from "../../services/AdminService";
import { useApp } from "../../hooks/useApp";
import { formatDate } from "../../utils";
import { useAdminOperations } from "../../hooks/useAsyncOperations";
import { adminToasts, promiseToast } from "../../utils/toastUtils";

const Admin = ({ onSwitchToDashboard }) => {
  const { user, costumes, votes, revoteVotes, appSettings, costumeResults } =
    useApp();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showUnvotedUsersModal, setShowUnvotedUsersModal] = useState(false);
  const [unvotedUsers, setUnvotedUsers] = useState([]);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isMovingToNextPhase, setIsMovingToNextPhase] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const {
    isLoading: isAdminLoading,
    toggleVoting,
    toggleResults,
    toggleSelfVote,
    toggleAutoRevote,
    resetContest,
    closeVotingWithAutoRevote,
  } = useAdminOperations();

  const userCount =
    costumes?.reduce((count, costume) => {
      return count + (costume.userId ? 1 : 0);
    }, 0) || 0;

  const voteCount = votes?.length || 0;
  const revoteVoteCount = revoteVotes?.length || 0;

  const handleToggleVoting = async () => {
    try {
      if (appSettings.votingEnabled) {
        // Closing voting - check for auto-revote
        const result = await closeVotingWithAutoRevote(costumeResults);
        if (result.autoRevoteTriggered) {
          adminToasts.autoRevoteTriggered();
        } else {
          adminToasts.votingDisabled();
        }
      } else {
        // Opening voting
        await toggleVoting(true);
        adminToasts.votingEnabled();
      }
    } catch (error) {
      // Error is handled by the hook
      logger.error("Error toggling voting:", error);
    }
  };

  const handleToggleSelfVote = async () => {
    try {
      await toggleSelfVote(!appSettings.allowSelfVote);
      if (!appSettings.allowSelfVote) {
        adminToasts.selfVoteEnabled();
      } else {
        adminToasts.selfVoteDisabled();
      }
    } catch (error) {
      // Error is handled by the hook
      logger.error("Error toggling self-vote:", error);
    }
  };

  const handleToggleAutoRevote = async () => {
    try {
      await toggleAutoRevote(!appSettings.autoRevoteEnabled);
      if (!appSettings.autoRevoteEnabled) {
        adminToasts.autoRevoteEnabled();
      } else {
        adminToasts.autoRevoteDisabled();
      }
    } catch (error) {
      // Error is handled by the hook
      logger.error("Error toggling auto-revote:", error);
    }
  };

  const handleResetContest = () => {
    setShowResetConfirmation(true);
  };

  const handleConfirmReset = async () => {
    try {
      setShowResetConfirmation(false);
      await promiseToast.contestReset(resetContest());
    } catch (error) {
      adminToasts.resetError();
      logger.error("Error resetting contest:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  // New simplified handlers
  const handleCloseVotingAndShowResults = async () => {
    await handleCloseVotingWithUnvotedCheck();
  };

  // Phase reversion handlers
  const handleRevertToContestActive = async () => {
    try {
      await toggleVoting(false);
      await toggleResults(false);
      adminToasts.votingDisabled();
      adminToasts.resultsHidden();
    } catch (error) {
      logger.error("Error reverting to contest active:", error);
    }
  };

  const handleRevertToVotingEnabled = async () => {
    try {
      await toggleResults(false);
      await toggleVoting(true);
      adminToasts.resultsHidden();
      adminToasts.votingEnabled();
    } catch (error) {
      logger.error("Error reverting to voting enabled:", error);
    }
  };

  // End revote handler
  const handleEndRevote = async () => {
    await handleEndRevoteWithUnvotedCheck();
  };

  // Fetch all users from Firestore
  const fetchAllUsers = async () => {
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
  };

  // Helper function to convert Firestore Timestamp to Date
  const getDateFromTimestamp = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      return new Date(timestamp);
    }
    return null;
  };

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await fetchAllUsers();
        // Sort users by lastLogin descending (most recent first)
        const sortedUsers = users.sort((a, b) => {
          const aTime = getDateFromTimestamp(a.lastLogin) || new Date(0);
          const bTime = getDateFromTimestamp(b.lastLogin) || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        setAllUsers(sortedUsers);
      } catch (error) {
        logger.error("Error loading users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Handle closing voting with unvoted users check
  const handleCloseVotingWithUnvotedCheck = async () => {
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
        await handleToggleVoting();
      }
    } catch (error) {
      logger.error("Error checking unvoted users:", error);
      // Fallback to normal close voting
      await handleToggleVoting();
    }
  };

  // Handle ending tie breaker vote with unvoted users check
  const handleEndRevoteWithUnvotedCheck = async () => {
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
  };

  // Send reminders to users
  const handleSendReminders = async (usersToNotify) => {
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
  };

  // Move to next phase
  const handleMoveToNextPhase = async () => {
    setIsMovingToNextPhase(true);
    try {
      // Close the modal first
      setShowUnvotedUsersModal(false);

      if (appSettings.revoteMode) {
        await handleEndRevote();
      } else {
        await handleToggleVoting();
      }
    } catch (error) {
      logger.error("Error moving to next phase:", error);
    } finally {
      setIsMovingToNextPhase(false);
    }
  };

  // Refetch unvoted users
  const handleRefetchUnvotedUsers = async () => {
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
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      await promiseToast.userDeleted(AdminService.deleteUser(userToDelete.uid));

      // Refresh users list
      const users = await fetchAllUsers();
      const sortedUsers = users.sort((a, b) => {
        const aTime = getDateFromTimestamp(a.lastLogin) || new Date(0);
        const bTime = getDateFromTimestamp(b.lastLogin) || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      setAllUsers(sortedUsers);

      setUserToDelete(null);
    } catch (error) {
      adminToasts.deleteUserError();
      logger.error("Error deleting user:", error);
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8"
    >
      {/* Header - Mobile optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-heading text-white mb-2 flex items-center gap-3"
            >
              <HalloweenIcon type="bat" size="lg" animate />
              <span className="leading-tight">Admin Dashboard</span>
            </motion.h1>
            <p className="text-sm sm:text-base text-gray-400">
              Welcome,{" "}
              <span className="text-orange-300 font-semibold">
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToDashboard && (
              <Button
                variant="ghost"
                className="flex items-center gap-2 self-start sm:self-auto rounded-xl hover:bg-purple-900/20 text-purple-300 hover:text-purple-200"
                onClick={onSwitchToDashboard}
              >
                <Users className="h-4 w-4" />
                <span>Join Contest</span>
              </Button>
            )}
            <Button
              variant="ghost"
              className="flex items-center gap-2 self-start sm:self-auto rounded-xl hover:bg-red-900/20 text-gray-300 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
      {/* Quick Stats - Modern cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8"
      >
        <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-purple-900/40 border-purple-500/30 hover:border-purple-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">
                  Total Participants
                </p>
                <h3 className="text-4xl sm:text-5xl font-bold text-orange-300">
                  {userCount}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20 backdrop-blur-sm">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40 border-orange-500/30 hover:border-orange-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">
                  Total Votes
                </p>
                <h3 className="text-4xl sm:text-5xl font-bold text-orange-300">
                  {voteCount}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20 backdrop-blur-sm">
                <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-orange-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Revote Votes Card */}
        {appSettings.revoteMode && (
          <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-purple-900/40 border-purple-500/30 hover:border-purple-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">
                    Tie Breaker Votes
                  </p>
                  <h3 className="text-4xl sm:text-5xl font-bold text-purple-300">
                    {revoteVoteCount}
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-purple-500/20 backdrop-blur-sm">
                  <Vote className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-green-900/40 border-green-500/30 hover:border-green-500/50 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm mb-2">
                  Contest Status
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`h-3 w-3 rounded-full animate-pulse ${
                      appSettings.contestActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <h3 className="text-xl sm:text-2xl font-bold text-orange-300">
                    {appSettings.contestActive ? "Active" : "Inactive"}
                  </h3>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        appSettings.votingEnabled
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-xs text-gray-400">
                      {appSettings.votingEnabled
                        ? "Voting Open"
                        : "Voting Closed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        appSettings.resultsVisible
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-xs text-gray-400">
                      {appSettings.resultsVisible
                        ? "Results Visible"
                        : "Results Hidden"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      {/* Contest Phase Controls - Simplified */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40 border-orange-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-6 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Contest Phase Control
            </h2>

            {/* Phase Progress Indicator */}
            <div className="mb-8">
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
            </div>

            {/* Main Action Button */}
            <div className="text-center mb-6">
              {!appSettings.votingEnabled && !appSettings.resultsVisible ? (
                <div>
                  <p className="text-gray-400 text-sm mb-4">
                    Contest is active. Users can submit costumes. Ready to start
                    voting?
                  </p>
                  <Button
                    onClick={() => handleToggleVoting(true)}
                    disabled={isAdminLoading}
                    className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
                          <RefreshCw className="h-5 w-5" />
                        </motion.div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        Start Voting
                      </>
                    )}
                  </Button>
                </div>
              ) : appSettings.votingEnabled && !appSettings.resultsVisible ? (
                <div>
                  <p className="text-gray-400 text-sm mb-4">
                    Voting is active. Users can vote for costumes. Ready to
                    close voting and show results?
                  </p>
                  <Button
                    onClick={handleCloseVotingAndShowResults}
                    disabled={isAdminLoading}
                    className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-8 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
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
                          <RefreshCw className="h-5 w-5" />
                        </motion.div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-5 w-5" />
                        Close Voting & Show Results
                      </>
                    )}
                  </Button>
                </div>
              ) : !appSettings.votingEnabled && appSettings.resultsVisible ? (
                <div>
                  <p className="text-gray-400 text-sm mb-4">
                    Results are shown. Contest is complete. Ready to reset for
                    next contest?
                  </p>
                  <Button
                    onClick={handleResetContest}
                    disabled={isAdminLoading}
                    className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
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
                          <RefreshCw className="h-5 w-5" />
                        </motion.div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5" />
                        Reset Contest
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Settings Section */}
            <div className="border-t border-orange-500/20 pt-6">
              <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Contest Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Self-Vote Toggle */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-black/40 to-blue-900/20 border border-blue-500/20">
                  <h4 className="text-base font-semibold text-orange-300 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Self-Vote Option
                  </h4>
                  <p className="text-gray-400 text-xs mb-3">
                    Allow users to vote for their own costumes
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      {appSettings.allowSelfVote ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={appSettings.allowSelfVote || false}
                      onCheckedChange={handleToggleSelfVote}
                      disabled={isAdminLoading}
                    />
                  </div>
                </div>

                {/* Auto-Revote Toggle */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-black/40 to-purple-900/20 border border-purple-500/20">
                  <h4 className="text-base font-semibold text-orange-300 mb-2 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Auto Tie Breaker Vote on Tie
                  </h4>
                  <p className="text-gray-400 text-xs mb-3">
                    Automatically start tie-breaker when first place is tied
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      {appSettings.autoRevoteEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={appSettings.autoRevoteEnabled || false}
                      onCheckedChange={handleToggleAutoRevote}
                      disabled={isAdminLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Reversion Controls */}
            {(appSettings.votingEnabled || appSettings.resultsVisible) && (
              <div className="pt-6 border-t border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-blue-400" />
                  Phase Reversion
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Need to go back? Revert to previous phase if users forgot to
                  add costumes.
                </p>
                <div className="flex gap-3 flex-wrap">
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
              <div className="pt-6 border-t border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-400" />
                  End Tie Breaker Vote
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Tie Breaker Vote is active. End it when all eligible users
                  have voted.
                </p>
                <Button
                  onClick={handleEndRevote}
                  disabled={isAdminLoading}
                  className="flex items-center gap-2 rounded-xl py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Trophy className="h-4 w-4" />
                  End Tie Breaker Vote
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
      {/* Users List - Mobile responsive */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-blue-900/40 border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-halloween text-orange-300 flex items-center gap-2">
                <UserCircle className="h-6 w-6" />
                Application Users
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  setIsLoadingUsers(true);
                  try {
                    const users = await fetchAllUsers();
                    const sortedUsers = users.sort((a, b) => {
                      const aTime =
                        getDateFromTimestamp(a.lastLogin) || new Date(0);
                      const bTime =
                        getDateFromTimestamp(b.lastLogin) || new Date(0);
                      return bTime.getTime() - aTime.getTime();
                    });
                    setAllUsers(sortedUsers);
                  } catch (error) {
                    logger.error("Error refreshing users:", error);
                  } finally {
                    setIsLoadingUsers(false);
                  }
                }}
                disabled={isLoadingUsers}
                className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingUsers ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {isLoadingUsers && allUsers.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-300 mx-auto mb-2" />
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : allUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No users found in the application.
              </p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-blue-500/20">
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Name
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Email
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Role
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Last Login
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((userItem) => (
                        <tr
                          key={userItem.uid}
                          className="border-b border-gray-800/50 hover:bg-blue-500/5 transition-colors"
                        >
                          <td className="p-3 text-orange-300 font-medium">
                            {userItem.displayName || "N/A"}
                          </td>
                          <td className="p-3 text-gray-300 text-sm">
                            {userItem.email || "N/A"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                userItem.role === "admin"
                                  ? "bg-purple-900/30 text-purple-300"
                                  : "bg-gray-700/30 text-gray-300"
                              }`}
                            >
                              {userItem.role === "admin" ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 text-sm">
                            {userItem.lastLogin
                              ? formatDate(userItem.lastLogin)
                              : "Never"}
                          </td>
                          <td className="p-3 text-right">
                            {userItem.uid !== user?.uid ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUserToDelete(userItem)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                disabled={isDeletingUser}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-xs">You</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {allUsers.map((userItem, index) => (
                    <motion.div
                      key={userItem.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-black/40 to-blue-900/20 border border-blue-500/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-orange-300 font-semibold">
                            {userItem.displayName || "N/A"}
                          </h3>
                          <p className="text-gray-400 text-xs mt-1">
                            {userItem.email || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              userItem.role === "admin"
                                ? "bg-purple-900/30 text-purple-300"
                                : "bg-gray-700/30 text-gray-300"
                            }`}
                          >
                            {userItem.role === "admin" ? "Admin" : "User"}
                          </span>
                          {userItem.uid !== user?.uid && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserToDelete(userItem)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                              disabled={isDeletingUser}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500 text-xs">
                          Last login:
                        </span>
                        <span className="text-gray-400 text-xs">
                          {userItem.lastLogin
                            ? formatDate(userItem.lastLogin)
                            : "Never"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>
      {/* Costume Submissions - Mobile responsive */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-purple-900/40 border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-halloween text-orange-300 mb-4 sm:mb-6 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Costume Submissions
            </h2>

            {costumes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No costumes have been submitted yet.
              </p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-orange-500/20">
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Name
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Description
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Submitted
                        </th>
                        <th className="p-3 text-gray-400 font-medium text-sm">
                          Votes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costumes.map((costume) => (
                        <tr
                          key={costume.id}
                          className="border-b border-gray-800/50 hover:bg-orange-500/5 transition-colors"
                        >
                          <td className="p-3 text-orange-300 font-medium">
                            {costume.name}
                          </td>
                          <td className="p-3 text-gray-300 text-sm">
                            {costume.description.length > 50
                              ? `${costume.description.slice(0, 50)}...`
                              : costume.description}
                          </td>
                          <td className="p-3 text-gray-400 text-sm">
                            {formatDate(costume.submittedAt)}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 text-orange-300 bg-orange-900/30 rounded-full font-medium text-sm">
                              {
                                votes.filter(
                                  (vote) => vote.costumeId === costume.id
                                ).length
                              }
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {costumes.map((costume, index) => (
                    <motion.div
                      key={costume.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-black/40 to-purple-900/20 border border-purple-500/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-orange-300 font-semibold">
                          {costume.name}
                        </h3>
                        <span className="inline-flex items-center justify-center px-2 py-1 text-orange-300 bg-orange-900/30 rounded-full font-medium text-sm">
                          {
                            votes.filter(
                              (vote) => vote.costumeId === costume.id
                            ).length
                          }{" "}
                          votes
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                        {costume.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(costume.submittedAt)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>
      {/* Voting Results */}
      {votes.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40 border-orange-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative p-5 sm:p-6">
              <h2 className="text-2xl sm:text-3xl font-halloween text-orange-300 mb-4 sm:mb-6 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Current Results
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {costumeResults.map((costume, index) => (
                  <motion.div
                    key={costume.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-gradient-to-br from-black/40 to-orange-900/20 border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg text-white bg-gradient-to-br from-orange-500 to-purple-700 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-orange-300 mb-1">
                        {costume.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-1">
                        {costume.description}
                      </p>
                    </div>
                    <div className="flex items-center sm:items-end gap-1 self-start sm:self-auto">
                      <span className="text-3xl sm:text-2xl font-bold text-orange-300">
                        {costume.voteCount}
                      </span>
                      <span className="text-gray-400 text-sm mb-0 sm:mb-1">
                        {costume.voteCount === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      {/* Reset Contest - Always visible at bottom */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-red-900/20 via-gray-900/60 to-red-900/20 border-red-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl sm:text-3xl font-halloween text-red-300">
                  Danger Zone
                </h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                ⚠️ This will permanently delete ALL costumes, votes, and images.
                <br />
                <span className="text-red-400 font-semibold">
                  This action cannot be undone!
                </span>
                <br />
                <span className="text-gray-500 text-xs">
                  Auto Tie Breaker Vote on Tie will be enabled after reset.
                </span>
              </p>
              <Button
                onClick={handleResetContest}
                disabled={isAdminLoading}
                className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
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
                    Resetting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Reset Contest
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Reset Contest Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={handleConfirmReset}
        title="Reset Contest"
        message="Are you sure you want to reset the entire contest? This will permanently delete all costumes, votes, and user data. The contest will return to the initial state where users can submit costumes."
        confirmText="Reset Contest"
        confirmVariant="destructive"
        isLoading={isAdminLoading}
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

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <ConfirmationModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${
            userToDelete.displayName || userToDelete.email || "this user"
          }? This will permanently delete their profile, all costumes, votes, and uploaded images. Note: Firebase Authentication deletion requires server-side Admin SDK. The user's authentication will remain, but they won't be able to access the app since their Firestore document will be deleted.`}
          confirmText="Delete User"
          confirmVariant="destructive"
          isLoading={isDeletingUser}
        />
      )}
    </motion.div>
  );
};

export default Admin;

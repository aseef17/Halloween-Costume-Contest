import React from "react";
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
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Switch } from "../ui/Switch";
import HalloweenIcon from "../layout/HalloweenIcon";
import AdminService from "../../services/AdminService";
import { useApp } from "../../hooks/useApp";
import { formatDate } from "../../utils";
import { useAdminOperations } from "../../hooks/useAsyncOperations";
import { adminToasts, promiseToast } from "../../utils/toastUtils";

const Admin = ({ onSwitchToDashboard }) => {
  const { user, costumes, votes, appSettings, costumeResults } = useApp();
  const {
    isLoading: isAdminLoading,
    toggleVoting,
    toggleResults,
    toggleSelfVote,
    toggleAutoRevote,
    resetContest,
    closeVotingWithAutoRevote,
  } = useAdminOperations();

  const userCount = costumes.reduce((count, costume) => {
    return count + (costume.userId ? 1 : 0);
  }, 0);

  const voteCount = votes.length;

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
      console.error("Error toggling voting:", error);
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
      console.error("Error toggling self-vote:", error);
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
      console.error("Error toggling auto-revote:", error);
    }
  };

  const handleResetContest = async () => {
    try {
      await promiseToast.resetContest(resetContest());
    } catch (error) {
      adminToasts.resetError();
      console.error("Error resetting contest:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // New simplified handlers
  const handleCloseVotingAndShowResults = async () => {
    try {
      // Close voting and check for auto-revote
      const result = await closeVotingWithAutoRevote(costumeResults);
      if (result.autoRevoteTriggered) {
        adminToasts.autoRevoteTriggered();
      } else {
        adminToasts.votingDisabled();
        adminToasts.resultsShown();
      }
    } catch (error) {
      console.error("Error closing voting and showing results:", error);
    }
  };

  // Phase reversion handlers
  const handleRevertToContestActive = async () => {
    try {
      await toggleVoting(false);
      await toggleResults(false);
      adminToasts.votingDisabled();
      adminToasts.resultsHidden();
    } catch (error) {
      console.error("Error reverting to contest active:", error);
    }
  };

  const handleRevertToVotingEnabled = async () => {
    try {
      await toggleResults(false);
      await toggleVoting(true);
      adminToasts.resultsHidden();
      adminToasts.votingEnabled();
    } catch (error) {
      console.error("Error reverting to voting enabled:", error);
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
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    !appSettings.votingEnabled && !appSettings.resultsVisible
                      ? "bg-green-500/20 border border-green-500/30"
                      : "bg-gray-500/20 border border-gray-500/30"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !appSettings.votingEnabled && !appSettings.resultsVisible
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-white">
                    Contest Active
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    appSettings.votingEnabled && !appSettings.resultsVisible
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-gray-500/20 border border-gray-500/30"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      appSettings.votingEnabled && !appSettings.resultsVisible
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-white">
                    Voting Enabled
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    !appSettings.votingEnabled && appSettings.resultsVisible
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-gray-500/20 border border-gray-500/30"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !appSettings.votingEnabled && appSettings.resultsVisible
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
                    Auto-Revote on Tie
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
          </div>
        </Card>
      </motion.div>

      {/* Costume Submissions - Mobile responsive */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
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
                                  (vote) => vote.costumeId === costume.id,
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
                              (vote) => vote.costumeId === costume.id,
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

      {/* Phase Reversion Controls */}
      {(appSettings.votingEnabled || appSettings.resultsVisible) && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6 sm:mb-8 overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-900/40 via-gray-900/60 to-green-900/40 border-blue-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative p-5 sm:p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <RotateCcw className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl sm:text-3xl font-halloween text-blue-300">
                    Phase Reversion
                  </h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Need to go back? Revert to previous phase if users forgot to
                  add costumes
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            </div>
          </Card>
        </motion.div>
      )}

      {/* Secure Reset Contest - Only show when contest is active */}
      {!appSettings.votingEnabled && !appSettings.resultsVisible && (
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
                  ⚠️ This will permanently delete ALL costumes, votes, and
                  images.
                  <br />
                  <span className="text-red-400 font-semibold">
                    This action cannot be undone!
                  </span>
                  <br />
                  <span className="text-gray-500 text-xs">
                    Auto-Revote on Tie will be enabled after reset.
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
      )}
    </motion.div>
  );
};

export default Admin;

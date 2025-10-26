import { useState } from "react";
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
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const {
    isLoading: isAdminLoading,
    toggleVoting,
    toggleResults,
    toggleSelfVote,
    resetContest,
  } = useAdminOperations();

  const userCount = costumes.reduce((count, costume) => {
    return count + (costume.userId ? 1 : 0);
  }, 0);

  const voteCount = votes.length;

  const handleToggleVoting = async () => {
    try {
      await toggleVoting(!appSettings.votingEnabled);
      if (!appSettings.votingEnabled) {
        adminToasts.votingEnabled();
      } else {
        adminToasts.votingDisabled();
      }
    } catch (error) {
      // Error is handled by the hook
      console.error("Error toggling voting:", error);
    }
  };

  const handleToggleResults = async () => {
    try {
      await toggleResults(!appSettings.resultsVisible);
      if (!appSettings.resultsVisible) {
        adminToasts.resultsShown();
      } else {
        adminToasts.resultsHidden();
      }
    } catch (error) {
      // Error is handled by the hook
      console.error("Error toggling results:", error);
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

  const handleResetContest = async () => {
    try {
      await promiseToast.contestReset(resetContest());
      setShowConfirmReset(false);
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

      {/* Contest Controls - Modern design */}
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
              Contest Controls
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-black/40 to-purple-900/20 border border-purple-500/20">
                <h3 className="text-base sm:text-lg font-semibold text-orange-300 mb-2 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Voting Status
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
                  {appSettings.votingEnabled
                    ? "Voting is currently open. Users can vote for their favorite costumes."
                    : "Voting is currently closed. Enable voting to allow users to cast votes."}
                </p>
                <Button
                  onClick={handleToggleVoting}
                  disabled={isAdminLoading}
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
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
                      Updating...
                    </>
                  ) : appSettings.votingEnabled ? (
                    <>
                      <Pause className="h-5 w-5" />
                      Close Voting
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Open Voting
                    </>
                  )}
                </Button>
                {appSettings.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Updated: {formatDate(appSettings.lastUpdated)}
                  </p>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-black/40 to-green-900/20 border border-green-500/20">
                <h3 className="text-base sm:text-lg font-semibold text-orange-300 mb-2 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Results Visibility
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
                  {appSettings.resultsVisible
                    ? "Results are currently visible to all users."
                    : "Results are currently hidden from users."}
                </p>
                <Button
                  onClick={handleToggleResults}
                  disabled={isAdminLoading}
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
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
                      Updating...
                    </>
                  ) : appSettings.resultsVisible ? (
                    <>
                      <EyeOff className="h-5 w-5" />
                      Hide Results
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5" />
                      Show Results
                    </>
                  )}
                </Button>
              </div>

              {/* Self-Vote Toggle */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-black/40 to-blue-900/20 border border-blue-500/20">
                <h3 className="text-base sm:text-lg font-semibold text-orange-300 mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Self-Vote Option
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
                  {appSettings.allowSelfVote
                    ? "Users can vote for their own costumes."
                    : "Users cannot vote for their own costumes."}
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
                {isAdminLoading && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Updating...
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-orange-500/20 my-6 pt-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-900/20 to-black/40 border border-red-500/30">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-orange-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Reset Contest
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      This will delete all costumes and votes, and reset the
                      contest settings.
                    </p>
                    <p className="text-red-400 text-xs sm:text-sm font-semibold mt-2">
                      ⚠️ This action cannot be undone!
                    </p>
                  </div>
                  {!showConfirmReset ? (
                    <Button
                      onClick={() => setShowConfirmReset(true)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto rounded-xl py-2.5 px-5 whitespace-nowrap"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Reset Contest
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => setShowConfirmReset(false)}
                        variant="ghost"
                        className="flex items-center justify-center gap-2 rounded-xl hover:bg-gray-800/50"
                      >
                        <XCircle className="h-5 w-5" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleResetContest}
                        disabled={isAdminLoading}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded-xl"
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
                            <AlertTriangle className="h-5 w-5" />
                            Confirm Reset
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                {appSettings.lastReset && (
                  <p className="text-xs text-gray-500 mt-3 text-center sm:text-left">
                    Last reset: {formatDate(appSettings.lastReset)}
                  </p>
                )}
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
    </motion.div>
  );
};

export default Admin;

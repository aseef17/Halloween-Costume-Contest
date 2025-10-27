import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, AlertCircle, Bell, CheckCircle } from "lucide-react";
import Button from "./Button";

const UnvotedUsersModal = ({
  isOpen,
  onClose,
  unvotedUsers,
  onSendReminders,
  onMoveToNextPhase,
  isSendingReminders = false,
  isMovingToNextPhase = false,
  title = "Users Who Haven't Voted",
  description = "The following users have not yet cast their votes:",
}) => {
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const handleUserToggle = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === unvotedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(unvotedUsers.map((user) => user.uid)));
    }
  };

  const handleSendReminders = async () => {
    const usersToNotify =
      selectedUsers.size > 0
        ? unvotedUsers.filter((user) => selectedUsers.has(user.uid))
        : unvotedUsers;

    await onSendReminders(usersToNotify);
    setSelectedUsers(new Set());
  };

  const handleMoveToNextPhase = async () => {
    await onMoveToNextPhase();
  };

  const handleClose = () => {
    setSelectedUsers(new Set());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-500/20">
                    <Users className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {unvotedUsers.length} user
                      {unvotedUsers.length !== 1 ? "s" : ""} haven't voted
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
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-4">{description}</p>

                {unvotedUsers.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {selectedUsers.size === unvotedUsers.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                    <span className="text-gray-400 text-xs">
                      {selectedUsers.size} selected
                    </span>
                  </div>
                )}
              </div>

              {/* User List */}
              <div className="space-y-2">
                {unvotedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-300 font-medium">
                      All users have voted!
                    </p>
                    <p className="text-gray-400 text-sm">
                      No reminders needed.
                    </p>
                  </div>
                ) : (
                  unvotedUsers.map((user) => (
                    <div
                      key={user.uid}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedUsers.has(user.uid)
                          ? "border-orange-500/50 bg-orange-500/10"
                          : "border-gray-600/50 bg-gray-800/50 hover:border-gray-500/50"
                      }`}
                      onClick={() => handleUserToggle(user.uid)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedUsers.has(user.uid)
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-500"
                          }`}
                        >
                          {selectedUsers.has(user.uid) && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {user.displayName || "Anonymous User"}
                          </p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            {unvotedUsers.length > 0 && (
              <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Bell className="h-4 w-4" />
                    <span>
                      Send voting reminders to{" "}
                      {selectedUsers.size || unvotedUsers.length} user
                      {selectedUsers.size !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                      <Button
                        onClick={handleSendReminders}
                        disabled={isSendingReminders || isMovingToNextPhase}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 flex-1"
                      >
                        <Bell className="h-4 w-4" />
                        {isSendingReminders ? "Sending..." : "Send Reminders"}
                      </Button>
                      <Button
                        onClick={handleMoveToNextPhase}
                        disabled={isSendingReminders || isMovingToNextPhase}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isMovingToNextPhase
                          ? "Moving..."
                          : "Move to Next Phase"}
                      </Button>
                    </div>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      disabled={isSendingReminders || isMovingToNextPhase}
                      className="sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UnvotedUsersModal;

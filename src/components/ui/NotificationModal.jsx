import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Vote, AlertCircle, CheckCircle } from "lucide-react";
import Button from "./Button";
import { useApp } from "../../contexts/CombinedContext";
import NotificationService from "../../services/NotificationService";
import logger from "../../utils/logger";

const NotificationModal = () => {
  const { user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = NotificationService.getUserNotifications(
      user.uid,
      (userNotifications) => {
        setNotifications(userNotifications);
        setIsVisible(userNotifications.length > 0);
        setCurrentNotificationIndex(0);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const handleDismiss = async (notificationId) => {
    try {
      await NotificationService.dismissNotification(notificationId);
      logger.log("Notification dismissed by user:", notificationId);
    } catch (error) {
      logger.error("Error dismissing notification:", error);
    }
  };

  const handleDismissAll = async () => {
    try {
      for (const notification of notifications) {
        await NotificationService.dismissNotification(notification.id);
      }
      setIsVisible(false);
      logger.log("All notifications dismissed by user");
    } catch (error) {
      logger.error("Error dismissing all notifications:", error);
    }
  };

  const handleNext = () => {
    if (currentNotificationIndex < notifications.length - 1) {
      setCurrentNotificationIndex(currentNotificationIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentNotificationIndex > 0) {
      setCurrentNotificationIndex(currentNotificationIndex - 1);
    }
  };

  if (!isVisible || notifications.length === 0) return null;

  const currentNotification = notifications[currentNotificationIndex];
  const isVotingReminder = currentNotification.type === "voting_reminder";
  const isTieBreakerReminder =
    currentNotification.type === "tie_breaker_reminder";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 via-red-500/20 to-purple-500/20 border border-orange-500/30 backdrop-blur-xl shadow-2xl">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-purple-500/10" />

            {/* Pulsing border effect */}
            <div className="absolute inset-0 rounded-3xl border-2 border-orange-400/50 animate-pulse" />

            <div className="relative p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-orange-500/20 border border-orange-500/30">
                    <Bell className="h-6 w-6 text-orange-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-orange-300">
                      {currentNotification.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {notifications.length > 1
                        ? `Notification ${currentNotificationIndex + 1} of ${
                            notifications.length
                          }`
                        : "Important Update"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDismissAll}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-full bg-red-500/20 border border-red-500/30">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-base leading-relaxed">
                      {currentNotification.message}
                    </p>
                  </div>
                </div>

                {/* Action prompt */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Vote className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 font-semibold text-sm">
                      Action Required
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {isVotingReminder
                      ? "Please cast your vote for your favorite costume to help determine the winner!"
                      : isTieBreakerReminder
                        ? "The tie breaker vote is still open! Please cast your vote to help determine the winner."
                        : "Please take action to continue participating in the contest."}
                  </p>
                </div>
              </div>

              {/* Navigation and Actions */}
              <div className="space-y-4">
                {/* Navigation for multiple notifications */}
                {notifications.length > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentNotificationIndex === 0}
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:bg-gray-800"
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {notifications.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentNotificationIndex
                              ? "bg-orange-400"
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      onClick={handleNext}
                      disabled={
                        currentNotificationIndex === notifications.length - 1
                      }
                      variant="outline"
                      size="sm"
                      className="text-gray-400 border-gray-600 hover:bg-gray-800"
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDismiss(currentNotification.id)}
                    variant="outline"
                    className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={handleDismissAll}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    Go Vote Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationModal;

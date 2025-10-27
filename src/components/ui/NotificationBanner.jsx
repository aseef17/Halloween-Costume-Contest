import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Vote, AlertCircle } from "lucide-react";
import Button from "./Button";
import { useApp } from "../../contexts/CombinedContext";
import NotificationService from "../../services/NotificationService";
import logger from "../../utils/logger";

const NotificationBanner = () => {
  const { user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = NotificationService.getUserNotifications(
      user.uid,
      (userNotifications) => {
        setNotifications(userNotifications);
        setIsVisible(userNotifications.length > 0);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

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

  if (!isVisible || notifications.length === 0) return null;

  const latestNotification = notifications[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />

            <div className="relative p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-full bg-orange-500/20">
                  <Bell className="h-6 w-6 text-orange-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-orange-300">
                      {latestNotification.title}
                    </h3>
                    <div className="px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                      <span className="text-xs text-orange-300 font-medium">
                        {notifications.length} notification
                        {notifications.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">
                    {latestNotification.message}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Vote className="h-3 w-3" />
                    <span>Cast your vote to help determine the winner!</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleDismissAll}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Animated border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationBanner;

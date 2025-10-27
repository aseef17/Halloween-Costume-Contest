import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import logger from "../utils/logger";

class NotificationService {
  /**
   * Send voting reminder notifications to users
   * @param {Array} users - Array of user objects to notify
   * @param {string} type - Type of notification ('voting_reminder' or 'tie_breaker_reminder')
   */
  async sendVotingReminders(users, type = "voting_reminder") {
    try {
      const notifications = users.map((user) => ({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Anonymous User",
        type,
        title:
          type === "tie_breaker_reminder"
            ? "Tie Breaker Vote Reminder"
            : "Voting Reminder",
        message:
          type === "tie_breaker_reminder"
            ? "The tie breaker vote is still open! Please cast your vote to help determine the winner."
            : "Voting is still open! Please cast your vote for your favorite costume.",
        createdAt: serverTimestamp(),
        read: false,
        dismissed: false,
      }));

      const batch = [];
      for (const notification of notifications) {
        const docRef = await addDoc(
          collection(db, "notifications"),
          notification,
        );
        batch.push(docRef);
      }

      logger.log(`Sent ${notifications.length} voting reminder notifications`);
      return { success: true, count: notifications.length };
    } catch (error) {
      logger.error("Error sending voting reminders:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   * @param {string} userId - User ID
   * @param {Function} callback - Callback function to handle notifications
   * @returns {Function} Unsubscribe function
   */
  getUserNotifications(userId, callback) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("dismissed", "==", false),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(notifications);
      },
      (error) => {
        logger.error("Error fetching user notifications:", error);
        callback([]);
      },
    );
  }

  /**
   * Dismiss a notification
   * @param {string} notificationId - Notification ID
   */
  async dismissNotification(notificationId) {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      logger.log("Notification dismissed:", notificationId);
    } catch (error) {
      logger.error("Error dismissing notification:", error);
      throw error;
    }
  }

  /**
   * Get users who haven't voted
   * @param {Array} allUsers - All users in the system
   * @param {Array} votes - All votes cast
   * @param {Array} revoteVotes - All revote votes cast (optional)
   * @param {boolean} isRevoteMode - Whether we're in revote mode
   * @returns {Array} Users who haven't voted
   */
  getUnvotedUsers(allUsers, votes, revoteVotes = [], isRevoteMode = false) {
    const votesToCheck = isRevoteMode ? revoteVotes : votes;
    const votedUserIds = new Set(votesToCheck.map((vote) => vote.voterId));

    return allUsers.filter((user) => !votedUserIds.has(user.uid));
  }
}

export default new NotificationService();

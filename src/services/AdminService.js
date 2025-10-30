// src/services/AdminService.js
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
  serverTimestamp,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import logger from "../utils/logger";

// Helper function to detect first place ties
const detectFirstPlaceTie = (costumeResults) => {
  if (!costumeResults || costumeResults.length < 2) return null;

  const firstPlace = costumeResults.filter((costume) => costume.rank === 1);
  if (firstPlace.length > 1 && firstPlace[0].voteCount > 0) {
    return firstPlace;
  }
  return null;
};

// Helper function to commit batch with retry logic
const commitBatchWithRetry = async (batch, operationName, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await batch.commit();
      return true;
    } catch (error) {
      logger.error(
        `Error committing ${operationName} batch (attempt ${attempt}/${maxRetries}):`,
        error
      );

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const AdminService = {
  // Update app settings
  async updateAppSettings(settings) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      await updateDoc(settingsRef, {
        ...settings,
        lastUpdated: serverTimestamp(),
      });
      return true;
    } catch (error) {
      logger.error("Error updating app settings:", error);
      throw error;
    }
  },

  // Toggle voting
  async toggleVoting(enabled) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      const updateData = {
        votingEnabled: enabled,
        lastUpdated: serverTimestamp(),
      };

      // If disabling voting, also clear revote fields
      if (!enabled) {
        updateData.revoteMode = false;
        updateData.revoteCostumeIds = [];
        updateData.revoteExcludedUserIds = [];
      }

      await updateDoc(settingsRef, updateData);
      return true;
    } catch (error) {
      logger.error("Error toggling voting:", error);
      throw error;
    }
  },

  // Toggle results visibility
  async toggleResults(visible) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      await updateDoc(settingsRef, {
        resultsVisible: visible,
        lastUpdated: serverTimestamp(),
      });
      return true;
    } catch (error) {
      logger.error("Error toggling results visibility:", error);
      throw error;
    }
  },

  // Toggle self-vote option
  async toggleSelfVote(allowSelfVote) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      await updateDoc(settingsRef, {
        allowSelfVote: allowSelfVote,
        lastUpdated: serverTimestamp(),
      });
      return true;
    } catch (error) {
      logger.error("Error toggling self-vote option:", error);
      throw error;
    }
  },

  // Toggle auto-revote option
  async toggleAutoRevote(enabled) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      await updateDoc(settingsRef, {
        autoRevoteEnabled: enabled,
        lastUpdated: serverTimestamp(),
      });
      return true;
    } catch (error) {
      logger.error("Error toggling auto-revote option:", error);
      throw error;
    }
  },

  // Start revote for first place ties
  async startRevote(tiedCostumeIds, excludedUserIds = []) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");

      // Update settings to enable revote mode
      await updateDoc(settingsRef, {
        votingEnabled: true,
        resultsVisible: true,
        revoteMode: true,
        revoteCostumeIds: tiedCostumeIds,
        revoteExcludedUserIds: excludedUserIds,
        lastUpdated: serverTimestamp(),
      });

      logger.log(`Started revote for ${tiedCostumeIds.length} tied costumes`);
      logger.log(`Excluded users: ${excludedUserIds.length}`);
      return true;
    } catch (error) {
      logger.error("Error starting revote:", error);
      throw error;
    }
  },

  // End revote and clear revote data
  async endRevote() {
    try {
      // Clear all revote votes
      const revotesSnapshot = await getDocs(collection(db, "revotes"));
      if (revotesSnapshot.size > 0) {
        const batch = writeBatch(db);
        revotesSnapshot.forEach((revoteDoc) => {
          batch.delete(doc(db, "revotes", revoteDoc.id));
        });
        await commitBatchWithRetry(batch, "revote votes clearing");
        logger.log(`✅ Cleared ${revotesSnapshot.size} revote votes`);
      }

      // Update settings to disable revote mode
      const settingsRef = doc(db, "appSettings", "settings");
      await updateDoc(settingsRef, {
        votingEnabled: false,
        resultsVisible: true,
        revoteMode: false,
        revoteCostumeIds: [],
        revoteExcludedUserIds: [],
        lastUpdated: serverTimestamp(),
      });

      logger.log("Ended revote and cleared revote data");
      return true;
    } catch (error) {
      logger.error("Error ending revote:", error);
      throw error;
    }
  },

  // Check if revote can be automatically ended
  async checkRevoteCompletion() {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      const settingsSnap = await getDoc(settingsRef);
      const settings = settingsSnap.data();

      if (!settings.revoteMode) return { canEnd: false };

      // Get all eligible voters (users not excluded from revote)
      const usersSnapshot = await getDocs(collection(db, "users"));
      const eligibleVoters = usersSnapshot.docs
        .map((doc) => doc.id)
        .filter((userId) => !settings.revoteExcludedUserIds.includes(userId));

      // Get all revote votes
      const revotesSnapshot = await getDocs(collection(db, "revotes"));
      const revoteVoters = revotesSnapshot.docs.map(
        (doc) => doc.data().voterId
      );

      // Check if all eligible voters have voted
      const allVoted = eligibleVoters.every((voterId) =>
        revoteVoters.includes(voterId)
      );

      return {
        canEnd: allVoted,
        eligibleVoters: eligibleVoters.length,
        votedVoters: revoteVoters.length,
        remainingVoters: eligibleVoters.filter(
          (voterId) => !revoteVoters.includes(voterId)
        ),
      };
    } catch (error) {
      logger.error("Error checking revote completion:", error);
      return { canEnd: false };
    }
  },

  // Close voting with auto-revote check
  async closeVotingWithAutoRevote(costumeResults) {
    try {
      const settingsRef = doc(db, "appSettings", "settings");

      // Check for first place ties first (only if we have costume results)
      const firstPlaceTie =
        costumeResults && costumeResults.length > 0
          ? detectFirstPlaceTie(costumeResults)
          : null;

      if (firstPlaceTie && firstPlaceTie.length > 1) {
        // Get current settings to check if auto-revote is enabled
        const settingsDoc = await getDoc(settingsRef);
        const settings = settingsDoc.data();

        if (settings.autoRevoteEnabled) {
          // Calculate excluded users (costume owners)
          const excludedUserIds = firstPlaceTie
            .map((costume) => costume.userId)
            .filter(Boolean);

          // Start revote automatically (this sets votingEnabled: true and resultsVisible: true)
          await AdminService.startRevote(
            firstPlaceTie.map((costume) => costume.id),
            excludedUserIds
          );

          return {
            autoRevoteTriggered: true,
            tiedCostumes: firstPlaceTie,
            excludedUserIds,
          };
        }
      }

      // No auto-revote or no tie - close voting and show results
      await updateDoc(settingsRef, {
        votingEnabled: false,
        resultsVisible: true,
        lastUpdated: serverTimestamp(),
      });

      return { autoRevoteTriggered: false };
    } catch (error) {
      logger.error("Error closing voting with auto-revote check:", error);
      throw error;
    }
  },

  // Reset entire contest (clear votes, costumes, users, reset settings, delete images)
  async resetContest() {
    logger.log("Starting contest reset...");

    try {
      // Add a small delay to ensure any pending operations complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Step 1: Delete all votes
      logger.log("Deleting votes...");
      const votesSnapshot = await getDocs(collection(db, "votes"));
      const votesCount = votesSnapshot.size;

      if (votesCount > 0) {
        const votesBatch = writeBatch(db);
        votesSnapshot.forEach((voteDoc) => {
          votesBatch.delete(doc(db, "votes", voteDoc.id));
        });
        await commitBatchWithRetry(votesBatch, "votes deletion");
        logger.log(`✅ Deleted ${votesCount} votes`);
      } else {
        logger.log("✅ No votes to delete");
      }

      // Step 1.5: Delete all revote votes
      logger.log("Deleting revote votes...");
      const revotesSnapshot = await getDocs(collection(db, "revotes"));
      const revotesCount = revotesSnapshot.size;

      if (revotesCount > 0) {
        const revotesBatch = writeBatch(db);
        revotesSnapshot.forEach((revoteDoc) => {
          revotesBatch.delete(doc(db, "revotes", revoteDoc.id));
        });
        await commitBatchWithRetry(revotesBatch, "revote votes deletion");
        logger.log(`✅ Deleted ${revotesCount} revote votes`);
      } else {
        logger.log("✅ No revote votes to delete");
      }

      // Step 2: Delete all costumes
      logger.log("Deleting costumes...");
      const costumesSnapshot = await getDocs(collection(db, "costumes"));
      const costumesCount = costumesSnapshot.size;

      if (costumesCount > 0) {
        const costumesBatch = writeBatch(db);
        costumesSnapshot.forEach((costumeDoc) => {
          costumesBatch.delete(doc(db, "costumes", costumeDoc.id));
        });
        await commitBatchWithRetry(costumesBatch, "costumes deletion");
        logger.log(`✅ Deleted ${costumesCount} costumes`);
      } else {
        logger.log("✅ No costumes to delete");
      }

      // Step 3: Clear user contest data (keep user documents but reset contest-related fields)
      logger.log("👥 Clearing user contest data...");
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersCount = usersSnapshot.size;
      logger.log(`   Found ${usersCount} users to update`);

      if (usersCount > 0) {
        // Use multiple batches if needed (Firestore limit is 500 ops per batch)
        const batchSize = 500;
        const batches = [];
        let currentBatch = writeBatch(db);
        let operationCount = 0;

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          // Clear contest-related fields but keep user document
          currentBatch.update(doc(db, "users", userDoc.id), {
            costumeSubmitted: false,
            costumeId: null,
            lastCostumeSubmission: null,
            // Keep: uid, email, displayName, role, emailVerified, createdAt, lastLogin
          });
          logger.log(
            `  🔄 Clearing contest data: ${userData.email || userDoc.id}`
          );
          operationCount++;

          // Create new batch if we hit the limit
          if (operationCount === batchSize) {
            batches.push(currentBatch);
            currentBatch = writeBatch(db);
            operationCount = 0;
          }
        });

        // Add the last batch if it has operations
        if (operationCount > 0) {
          batches.push(currentBatch);
        }

        // Commit all batches with retry logic
        await Promise.all(
          batches.map(async (batch, index) => {
            await commitBatchWithRetry(
              batch,
              `user data clearing batch ${index + 1}`
            );
          })
        );
        logger.log(`✅ Cleared contest data for ${usersCount} users`);
      } else {
        logger.log("✅ No users to update");
      }

      // Step 4: Reset app settings
      logger.log("Resetting app settings...");
      const settingsRef = doc(db, "appSettings", "settings");
      await setDoc(settingsRef, {
        votingEnabled: false,
        resultsVisible: false,
        contestActive: true,
        allowSelfVote: false,
        revoteMode: false,
        revoteCostumeIds: [],
        revoteExcludedUserIds: [],
        autoRevoteEnabled: true,
        lastReset: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      logger.log("✅ App settings reset");

      // Step 5: Delete all images from Firebase Storage
      logger.log("Deleting images from storage...");
      try {
        const imagesRef = ref(storage, "costume-images");
        const imagesList = await listAll(imagesRef);
        const imagesCount = imagesList.items.length;

        if (imagesCount > 0) {
          // Delete all images
          const deletePromises = imagesList.items.map((imageRef) => {
            return deleteObject(imageRef);
          });

          await Promise.all(deletePromises);
          logger.log(`✅ Deleted ${imagesCount} images from storage`);
        } else {
          logger.log("✅ No images to delete");
        }
      } catch (storageError) {
        logger.error("⚠️ Error deleting images from storage:", storageError);
        logger.log("⚠️ Continuing with reset despite storage error");
        // Continue even if image deletion fails
      }

      logger.log("🎉 Contest reset completed successfully!");
      return true;
    } catch (error) {
      logger.error("❌ Error resetting contest:", error);
      logger.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  },

  // Delete a user and all their associated data (cascade delete)
  async deleteUser(userId) {
    logger.log(`Starting deletion for user: ${userId}`);

    try {
      // Step 1: Get user data FIRST (needed for image path construction)
      // We need displayName and uid before deleting the user document
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const userData = userSnap.data();
      const userDisplayName = userData.displayName || "user";
      logger.log(`Deleting user: ${userData.email || userId}`);

      // Step 2: Delete user's costumes (queried by userId - only this user's costumes)
      logger.log("Deleting user's costumes...");
      const costumesRef = collection(db, "costumes");
      const costumesQuery = query(costumesRef, where("userId", "==", userId));
      const costumesSnapshot = await getDocs(costumesQuery);
      const costumesCount = costumesSnapshot.size;

      if (costumesCount > 0) {
        // Delete costume documents first
        const costumesBatch = writeBatch(db);
        costumesSnapshot.forEach((costumeDoc) => {
          costumesBatch.delete(doc(db, "costumes", costumeDoc.id));
        });
        await commitBatchWithRetry(costumesBatch, "costumes deletion");
        logger.log(`✅ Deleted ${costumesCount} costumes`);
      } else {
        logger.log("✅ No costumes to delete");
      }

      // Step 3: Delete user's costume images from storage
      // Using the storage path pattern: costume-images/costume-{sanitizedDisplayName}-{userId}
      logger.log("Deleting user's costume images from storage...");
      let deletedImagesCount = 0;
      try {
        // Sanitize displayName the same way ImageUpload does
        const sanitizedUserName = userDisplayName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        const fileName = `costume-${sanitizedUserName}-${userId}`;
        const imagePath = `costume-images/${fileName}`;
        const imageRef = ref(storage, imagePath);

        try {
          await deleteObject(imageRef);
          deletedImagesCount++;
          logger.log(`✅ Deleted image: ${imagePath}`);
        } catch (error) {
          // Image might not exist (user never uploaded, or already deleted)
          if (error.code !== "storage/object-not-found") {
            logger.error(`Error deleting image ${imagePath}:`, error);
          } else {
            logger.log(
              `Image not found (may already be deleted): ${imagePath}`
            );
          }
        }
      } catch (error) {
        logger.error("Error deleting user's images:", error);
        // Continue even if image deletion fails
      }

      // Step 4: Delete user's votes (queried by voterId - only votes cast BY this user)
      logger.log("Deleting user's votes...");
      const votesRef = collection(db, "votes");
      const votesQuery = query(votesRef, where("voterId", "==", userId));
      const votesSnapshot = await getDocs(votesQuery);
      const votesCount = votesSnapshot.size;

      if (votesCount > 0) {
        const votesBatch = writeBatch(db);
        votesSnapshot.forEach((voteDoc) => {
          votesBatch.delete(doc(db, "votes", voteDoc.id));
        });
        await commitBatchWithRetry(votesBatch, "votes deletion");
        logger.log(`✅ Deleted ${votesCount} votes`);
      } else {
        logger.log("✅ No votes to delete");
      }

      // Step 5: Delete user's revote votes (queried by voterId - only revote votes cast BY this user)
      logger.log("Deleting user's revote votes...");
      const revotesRef = collection(db, "revotes");
      const revotesQuery = query(revotesRef, where("voterId", "==", userId));
      const revotesSnapshot = await getDocs(revotesQuery);
      const revotesCount = revotesSnapshot.size;

      if (revotesCount > 0) {
        const revotesBatch = writeBatch(db);
        revotesSnapshot.forEach((revoteDoc) => {
          revotesBatch.delete(doc(db, "revotes", revoteDoc.id));
        });
        await commitBatchWithRetry(revotesBatch, "revote votes deletion");
        logger.log(`✅ Deleted ${revotesCount} revote votes`);
      } else {
        logger.log("✅ No revote votes to delete");
      }

      // Step 6: Delete user document from Firestore LAST
      // This must be done last because we needed the user data for image deletion
      logger.log("Deleting user document...");
      await deleteDoc(userRef);
      logger.log("✅ User document deleted");

      // Note: Firebase Auth deletion requires Admin SDK (server-side)
      // The user's authentication will remain but they won't be able to access the app
      // since their Firestore document is deleted

      logger.log(
        `🎉 User deletion completed successfully for: ${
          userData.email || userId
        }`
      );
      return {
        success: true,
        deletedCostumes: costumesCount,
        deletedVotes: votesCount,
        deletedRevoteVotes: revotesCount,
        deletedImages: deletedImagesCount,
      };
    } catch (error) {
      logger.error("❌ Error deleting user:", error);
      logger.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  },
};

export default AdminService;

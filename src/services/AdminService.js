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
} from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
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
      console.error("Error updating app settings:", error);
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
      console.error("Error toggling voting:", error);
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
      console.error("Error toggling results visibility:", error);
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
      console.error("Error toggling self-vote option:", error);
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
      console.error("Error toggling auto-revote option:", error);
      throw error;
    }
  },

  // Start revote for first place ties
  async startRevote(tiedCostumeIds, excludedUserIds = []) {
    try {
      const batch = writeBatch(db);

      // Instead of deleting votes, mark them as initial votes
      const votesSnapshot = await getDocs(collection(db, "votes"));
      votesSnapshot.forEach((voteDoc) => {
        batch.update(doc(db, "votes", voteDoc.id), {
          isInitialVote: true,
          isRevoteVote: false,
        });
      });

      // Update settings to enable revote mode
      const settingsRef = doc(db, "appSettings", "settings");
      batch.update(settingsRef, {
        votingEnabled: true,
        resultsVisible: true, // Show results during revote
        revoteMode: true,
        revoteCostumeIds: tiedCostumeIds,
        revoteExcludedUserIds: excludedUserIds,
        lastUpdated: serverTimestamp(),
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error starting revote:", error);
      throw error;
    }
  },

  // End revote mode
  async endRevote() {
    try {
      const settingsRef = doc(db, "appSettings", "settings");
      await updateDoc(settingsRef, {
        revoteMode: false,
        revoteCostumeIds: [],
        revoteExcludedUserIds: [],
        votingEnabled: false,
        lastUpdated: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error ending revote:", error);
      throw error;
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
      console.error("Error closing voting with auto-revote check:", error);
      throw error;
    }
  },

  // Reset entire contest (clear votes, costumes, users, reset settings, delete images)
  async resetContest() {
    logger.log("Starting contest reset...");

    try {
      // Step 1: Delete all votes
      logger.log("Deleting votes...");
      const votesSnapshot = await getDocs(collection(db, "votes"));
      const votesCount = votesSnapshot.size;

      if (votesCount > 0) {
        const votesBatch = writeBatch(db);
        votesSnapshot.forEach((voteDoc) => {
          votesBatch.delete(doc(db, "votes", voteDoc.id));
        });
        await votesBatch.commit();
        logger.log(`✅ Deleted ${votesCount} votes`);
      } else {
        logger.log("✅ No votes to delete");
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
        await costumesBatch.commit();
        logger.log(`✅ Deleted ${costumesCount} costumes`);
      } else {
        logger.log("✅ No costumes to delete");
      }

      // Step 3: Delete ALL users (they will be recreated on next login)
      logger.log("👥 Deleting all users from 'users' collection...");
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersCount = usersSnapshot.size;
      logger.log(`   Found ${usersCount} users to delete`);

      if (usersCount > 0) {
        // Use multiple batches if needed (Firestore limit is 500 ops per batch)
        const batchSize = 500;
        const batches = [];
        let currentBatch = writeBatch(db);
        let operationCount = 0;

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          currentBatch.delete(doc(db, "users", userDoc.id));
          logger.log(`  ❌ Queuing deletion: ${userData.email || userDoc.id}`);
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

        // Commit all batches
        logger.log(`   Committing ${batches.length} batch(es)...`);
        await Promise.all(batches.map((batch) => batch.commit()));
        logger.log(
          `✅ Deleted ${usersCount} users (will be recreated on next login)`
        );
      } else {
        logger.log("✅ No users to delete");
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

      // Step 6: Sign out the current user
      logger.log("🚪 Signing out current user...");
      await signOut(auth);
      logger.log("✅ User signed out");

      logger.log("Contest reset completed successfully!");
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
};

export default AdminService;

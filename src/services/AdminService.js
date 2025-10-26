// src/services/AdminService.js
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "../firebaseConfig";

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
      await updateDoc(settingsRef, {
        votingEnabled: enabled,
        lastUpdated: serverTimestamp(),
      });
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

  // Start revote for first place ties
  async startRevote(tiedCostumeIds) {
    try {
      const batch = writeBatch(db);

      // Delete all existing votes
      const votesSnapshot = await getDocs(collection(db, "votes"));
      votesSnapshot.forEach((voteDoc) => {
        batch.delete(doc(db, "votes", voteDoc.id));
      });

      // Update settings to enable revote mode
      const settingsRef = doc(db, "appSettings", "settings");
      batch.update(settingsRef, {
        votingEnabled: true,
        resultsVisible: false,
        revoteMode: true,
        revoteCostumeIds: tiedCostumeIds,
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
        votingEnabled: false,
        lastUpdated: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error ending revote:", error);
      throw error;
    }
  },

  // Delete all images from Firebase Storage
  async deleteAllImages() {
    try {
      const imagesRef = ref(storage, "costume-images");
      const imagesList = await listAll(imagesRef);

      // Delete all images
      const deletePromises = imagesList.items.map((imageRef) => {
        return deleteObject(imageRef);
      });

      await Promise.all(deletePromises);
      console.log(`Deleted ${imagesList.items.length} images from storage`);
      return true;
    } catch (error) {
      console.error("Error deleting images from storage:", error);
      throw error;
    }
  },

  // Reset entire contest (clear votes, costumes, reset settings, delete images)
  async resetContest() {
    try {
      const batch = writeBatch(db);

      // 1. Delete all votes
      const votesSnapshot = await getDocs(collection(db, "votes"));
      votesSnapshot.forEach((voteDoc) => {
        batch.delete(doc(db, "votes", voteDoc.id));
      });

      // 2. Delete all costumes
      const costumesSnapshot = await getDocs(collection(db, "costumes"));
      costumesSnapshot.forEach((costumeDoc) => {
        batch.delete(doc(db, "costumes", costumeDoc.id));
      });

      // 3. Reset app settings
      const settingsRef = doc(db, "appSettings", "settings");
      batch.update(settingsRef, {
        votingEnabled: false,
        resultsVisible: false,
        contestActive: true,
        allowSelfVote: false,
        lastReset: serverTimestamp(),
      });

      // Commit batch
      await batch.commit();

      // 4. Delete all images from Firebase Storage
      await this.deleteAllImages();

      return true;
    } catch (error) {
      console.error("Error resetting contest:", error);
      throw error;
    }
  },
};

export default AdminService;

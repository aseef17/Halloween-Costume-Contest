// src/services/CostumeService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const CostumeService = {
  // Submit a new costume
  async createCostume(costumeData, userId, userName) {
    try {
      // First check if user already has a costume
      const costumesRef = collection(db, "costumes");
      const q = query(costumesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error(
          "You already have a costume submission. Please edit or delete it first.",
        );
      }

      const newCostume = {
        ...costumeData,
        userId,
        userName: userName || "Anonymous",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        hasVoted: false,
      };

      const docRef = await addDoc(collection(db, "costumes"), newCostume);
      return { id: docRef.id, ...newCostume };
    } catch (error) {
      console.error("Error creating costume:", error);
      throw error;
    }
  },

  // Update existing costume
  async updateCostume(costumeId, costumeData) {
    try {
      const costumeRef = doc(db, "costumes", costumeId);

      const updates = {
        ...costumeData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(costumeRef, updates);
      return { id: costumeId, ...updates };
    } catch (error) {
      console.error("Error updating costume:", error);
      throw error;
    }
  },

  // Delete costume
  async deleteCostume(costumeId) {
    try {
      const costumeRef = doc(db, "costumes", costumeId);
      await deleteDoc(costumeRef);
      return true;
    } catch (error) {
      console.error("Error deleting costume:", error);
      throw error;
    }
  },

  // Vote for a costume
  async voteForCostume(costumeId, userId) {
    try {
      // First check if user has already voted
      const votesRef = collection(db, "votes");
      const q = query(votesRef, where("voterId", "==", userId));
      const querySnapshot = await getDocs(q);

      // If user has already voted, update their vote
      if (!querySnapshot.empty) {
        const existingVote = querySnapshot.docs[0];
        await updateDoc(doc(db, "votes", existingVote.id), {
          costumeId,
          timestamp: serverTimestamp(),
        });
        return { id: existingVote.id, costumeId, voterId: userId };
      }

      // Otherwise create a new vote
      const newVote = {
        costumeId,
        voterId: userId,
        timestamp: serverTimestamp(),
      };

      const voteRef = await addDoc(collection(db, "votes"), newVote);
      return { id: voteRef.id, ...newVote };
    } catch (error) {
      console.error("Error voting for costume:", error);
      throw error;
    }
  },

  // Remove a vote
  async removeVote(voteId) {
    try {
      const voteRef = doc(db, "votes", voteId);
      await deleteDoc(voteRef);
      return true;
    } catch (error) {
      console.error("Error removing vote:", error);
      throw error;
    }
  },
};

export default CostumeService;

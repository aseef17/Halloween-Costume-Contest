import React, { createContext, useState, useEffect, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { ADMIN_EMAILS } from "./utils";

// Create contexts
const AppContext = createContext(null);

// Context provider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [costumes, setCostumes] = useState([]);
  const [userCostume, setUserCostume] = useState(null);
  const [votes, setVotes] = useState([]);
  const [appSettings, setAppSettings] = useState({
    votingEnabled: false,
    resultsVisible: false,
    contestActive: true,
    lastReset: null,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserVote, setCurrentUserVote] = useState(null);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Check if user exists in Firestore, if not create profile
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || userData.displayName || "",
            role: userData.role || "user",
            lastLogin: new Date(),
          });
          setIsAdmin(
            userData.role === "admin" || ADMIN_EMAILS.includes(fbUser.email),
          );
        } else {
          // Create new user document
          const newUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "",
            role: ADMIN_EMAILS.includes(fbUser.email) ? "admin" : "user",
            createdAt: new Date(),
            lastLogin: new Date(),
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
          setIsAdmin(ADMIN_EMAILS.includes(fbUser.email));
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to app settings
  useEffect(() => {
    if (!user) return;

    const settingsRef = doc(db, "appSettings", "settings");
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAppSettings(snapshot.data());
      } else {
        // Initialize settings if they don't exist
        setDoc(settingsRef, {
          votingEnabled: false,
          resultsVisible: false,
          contestActive: true,
          lastReset: new Date(),
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Optimized Firebase listeners with error handling
  useEffect(() => {
    if (!user) return;

    let costumesUnsubscribe;
    let votesUnsubscribe;

    // Listen to costumes
    const costumesRef = collection(db, "costumes");
    costumesUnsubscribe = onSnapshot(
      costumesRef,
      (snapshot) => {
        const costumesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCostumes(costumesData);

        // Find user's own costume
        const userCostume = costumesData.find(
          (costume) => costume.userId === user.uid,
        );
        setUserCostume(userCostume || null);
      },
      (error) => {
        console.error("Error listening to costumes:", error);
        setCostumes([]);
        setUserCostume(null);
      },
    );

    // Listen to votes
    const votesRef = collection(db, "votes");
    votesUnsubscribe = onSnapshot(
      votesRef,
      (snapshot) => {
        const votesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVotes(votesData);

        // Find current user's vote
        const userVote = votesData.find((vote) => vote.voterId === user.uid);
        setCurrentUserVote(userVote || null);
      },
      (error) => {
        console.error("Error listening to votes:", error);
        setVotes([]);
        setCurrentUserVote(null);
      },
    );

    return () => {
      costumesUnsubscribe?.();
      votesUnsubscribe?.();
    };
  }, [user]);

  // Memoized calculated values for better performance
  const costumeResults = useMemo(() => {
    if (!costumes.length) return [];

    // Create a vote count map for O(1) lookup instead of O(n) filtering
    const voteCountMap = votes.reduce((acc, vote) => {
      acc[vote.costumeId] = (acc[vote.costumeId] || 0) + 1;
      return acc;
    }, {});

    // Sort costumes by vote count
    const sorted = costumes
      .map((costume) => ({
        ...costume,
        voteCount: voteCountMap[costume.id] || 0,
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    // Add rank and tie information
    let currentRank = 1;
    let currentVoteCount = sorted[0]?.voteCount;

    return sorted.map((costume, index) => {
      // Update rank only when vote count changes
      if (costume.voteCount !== currentVoteCount) {
        currentRank = index + 1;
        currentVoteCount = costume.voteCount;
      }

      // Check if next costume has same vote count (tied)
      const nextCostume = sorted[index + 1];
      const isTied =
        (index > 0 && sorted[index - 1].voteCount === costume.voteCount) ||
        (nextCostume && nextCostume.voteCount === costume.voteCount);

      return {
        ...costume,
        rank: currentRank,
        isTied,
      };
    });
  }, [costumes, votes]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      authLoading,
      costumes,
      userCostume,
      votes,
      currentUserVote,
      appSettings,
      isAdmin,
      costumeResults,
    }),
    [
      user,
      authLoading,
      costumes,
      userCostume,
      votes,
      currentUserVote,
      appSettings,
      isAdmin,
      costumeResults,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;

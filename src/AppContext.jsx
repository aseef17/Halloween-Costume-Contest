import React, { createContext, useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { ADMIN_EMAILS } from "./utils";
import logger from "./utils/logger";

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
        try {
          // CRITICAL: Reload user to get latest verification status
          await fbUser.reload();

          // First, check if there was a recent reset
          const settingsRef = doc(db, "appSettings", "settings");
          const settingsSnap = await getDoc(settingsRef);
          const settings = settingsSnap.exists() ? settingsSnap.data() : null;
          const lastReset = settings?.lastReset?.toDate();

          // Check if user exists in Firestore
          const userRef = doc(db, "users", fbUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const userLastLogin = userData.lastLogin?.toDate();

            // If user's last login was before the last reset, update their lastLogin
            // This handles the case where contest was reset but user document still exists
            if (lastReset && userLastLogin && userLastLogin < lastReset) {
              logger.log(
                "Contest was reset. Updating user's lastLogin timestamp.",
              );
              // Update the user's lastLogin to be after the reset
              await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
              });
              // Continue with normal user setup
            }

            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || userData.displayName || "",
              role: userData.role || "user",
              emailVerified: fbUser.emailVerified,
              lastLogin: new Date(),
            });
            setIsAdmin(
              userData.role === "admin" || ADMIN_EMAILS.includes(fbUser.email),
            );
          } else {
            // User document doesn't exist - create new user document
            // This handles both new registrations and post-reset logins
            logger.log(
              "User document not found. Creating new user document...",
            );
            const newUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || "",
              role: ADMIN_EMAILS.includes(fbUser.email) ? "admin" : "user",
              emailVerified: fbUser.emailVerified,
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
            setIsAdmin(ADMIN_EMAILS.includes(fbUser.email));
          }
        } catch (error) {
          logger.error("Error loading user data:", error);
          // If there's an error, sign out the user
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to user document to detect deletion (for immediate logout during reset)
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          // User document was deleted - force logout immediately
          logger.log(
            "User document deleted (contest reset detected). Forcing logout...",
          );
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      },
      (error) => {
        logger.error("Error listening to user document:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

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

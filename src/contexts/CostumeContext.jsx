import React, { createContext, useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Create Costume Context
const CostumeContext = createContext(null);

// Costume Context Provider
export const CostumeProvider = ({ children }) => {
  const [costumes, setCostumes] = useState([]);
  const [userCostume, setUserCostume] = useState(null);
  const [votes, setVotes] = useState([]);
  const [currentUserVote, setCurrentUserVote] = useState(null);
  const [isLoadingCostumes, setIsLoadingCostumes] = useState(true);

  // Listen for costumes changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "costumes"),
      (snapshot) => {
        const costumesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCostumes(costumesData);
        setIsLoadingCostumes(false);
      },
      (error) => {
        console.error("Error fetching costumes:", error);
        setIsLoadingCostumes(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Listen for votes changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "votes"),
      (snapshot) => {
        const votesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVotes(votesData);
      },
      (error) => {
        console.error("Error fetching votes:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Calculate costume results with vote counts
  const costumeResults = useMemo(() => {
    if (!costumes.length || !votes.length) return [];

    // Create vote count maps for initial and revote votes
    const initialVoteCountMap = votes.reduce((acc, vote) => {
      if (vote.isInitialVote) {
        acc[vote.costumeId] = (acc[vote.costumeId] || 0) + 1;
      }
      return acc;
    }, {});

    const revoteVoteCountMap = votes.reduce((acc, vote) => {
      if (vote.isRevoteVote) {
        acc[vote.costumeId] = (acc[vote.costumeId] || 0) + 1;
      }
      return acc;
    }, {});

    // Create total vote count map (for backward compatibility)
    const totalVoteCountMap = votes.reduce((acc, vote) => {
      acc[vote.costumeId] = (acc[vote.costumeId] || 0) + 1;
      return acc;
    }, {});

    return costumes
      .map((costume) => ({
        ...costume,
        voteCount: totalVoteCountMap[costume.id] || 0,
        initialVoteCount: initialVoteCountMap[costume.id] || 0,
        revoteVoteCount: revoteVoteCountMap[costume.id] || 0,
      }))
      .sort((a, b) => b.voteCount - a.voteCount);
  }, [costumes, votes]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      costumes,
      userCostume,
      votes,
      currentUserVote,
      costumeResults,
      isLoadingCostumes,
      setUserCostume,
      setCurrentUserVote,
    }),
    [
      costumes,
      userCostume,
      votes,
      currentUserVote,
      costumeResults,
      isLoadingCostumes,
      setUserCostume,
      setCurrentUserVote,
    ],
  );

  return (
    <CostumeContext.Provider value={contextValue}>
      {children}
    </CostumeContext.Provider>
  );
};

// Custom hook to use costume context
export const useCostumes = () => {
  const context = React.useContext(CostumeContext);
  if (!context) {
    throw new Error("useCostumes must be used within a CostumeProvider");
  }
  return context;
};

export default CostumeContext;

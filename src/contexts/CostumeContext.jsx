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
  const [revoteVotes, setRevoteVotes] = useState([]);
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

  // Listen for revote votes changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "revotes"),
      (snapshot) => {
        const revoteVotesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRevoteVotes(revoteVotesData);
      },
      (error) => {
        console.error("Error fetching revote votes:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Calculate costume results with vote counts
  const costumeResults = useMemo(() => {
    if (!costumes.length) return [];

    // Create vote count maps for initial votes
    const initialVoteCountMap = votes.reduce((acc, vote) => {
      acc[vote.costumeId] = (acc[vote.costumeId] || 0) + 1;
      return acc;
    }, {});

    // Create vote count map for revote votes
    const revoteVoteCountMap = revoteVotes.reduce((acc, vote) => {
      acc[vote.costumeId] = (acc[vote.costumeId] || 0) + 1;
      return acc;
    }, {});

    // Create total vote count map (initial + revote)
    const totalVoteCountMap = {};
    costumes.forEach((costume) => {
      totalVoteCountMap[costume.id] =
        (initialVoteCountMap[costume.id] || 0) +
        (revoteVoteCountMap[costume.id] || 0);
    });

    return costumes
      .map((costume) => ({
        ...costume,
        voteCount: totalVoteCountMap[costume.id] || 0,
        initialVoteCount: initialVoteCountMap[costume.id] || 0,
        revoteVoteCount: revoteVoteCountMap[costume.id] || 0,
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((costume, index, sortedArray) => {
        // Calculate rank with proper tie handling
        let rank = index + 1;

        // If this costume has the same vote count as the previous one, it's tied
        if (
          index > 0 &&
          costume.voteCount === sortedArray[index - 1].voteCount
        ) {
          // Find the first costume with this vote count to get the correct rank
          const firstWithSameVotes = sortedArray.findIndex(
            (c) => c.voteCount === costume.voteCount,
          );
          rank = firstWithSameVotes + 1;
        }

        return {
          ...costume,
          rank,
          isTied:
            index > 0 && costume.voteCount === sortedArray[index - 1].voteCount,
        };
      });
  }, [costumes, votes, revoteVotes]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      costumes,
      userCostume,
      votes,
      revoteVotes,
      costumeResults,
      isLoadingCostumes,
      setUserCostume,
    }),
    [
      costumes,
      userCostume,
      votes,
      revoteVotes,
      costumeResults,
      isLoadingCostumes,
      setUserCostume,
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

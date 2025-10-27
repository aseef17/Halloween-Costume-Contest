import React, { useMemo } from "react";
import { AuthProvider } from "./AuthContext";
import { CostumeProvider } from "./CostumeContext";
import { AppSettingsProvider } from "./AppSettingsContext";
import { useAuth } from "./AuthContext";
import { useCostumes } from "./CostumeContext";
import { useAppSettings } from "./AppSettingsContext";

/**
 * Combined context provider that wraps all individual context providers
 * This maintains the same API as the original AppProvider while using separated contexts
 */
export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        <CostumeProvider>{children}</CostumeProvider>
      </AppSettingsProvider>
    </AuthProvider>
  );
};

/**
 * Custom hook that combines all context values
 * This maintains backward compatibility with existing components
 */
export const useApp = () => {
  const auth = useAuth();
  const costumes = useCostumes();
  const settings = useAppSettings();

  // Calculate current user vote based on voting mode
  const currentUserVote = useMemo(() => {
    if (!auth.user?.uid) return null;

    // In revote mode, check revote votes
    if (settings.appSettings.revoteMode) {
      const revoteVote =
        costumes.revoteVotes.find((vote) => vote.voterId === auth.user.uid) ||
        null;
      return revoteVote;
    }

    // In normal mode, check regular votes
    const normalVote =
      costumes.votes.find((vote) => vote.voterId === auth.user.uid) || null;
    return normalVote;
  }, [
    auth.user?.uid,
    costumes.votes,
    costumes.revoteVotes,
    settings.appSettings.revoteMode,
  ]);

  return {
    // Auth context
    user: auth.user,
    authLoading: auth.authLoading,
    isAdmin: auth.isAdmin,

    // Costume context
    costumes: costumes.costumes,
    userCostume: costumes.userCostume,
    votes: costumes.votes,
    revoteVotes: costumes.revoteVotes,
    currentUserVote,
    costumeResults: costumes.costumeResults,
    isLoadingCostumes: costumes.isLoadingCostumes,
    setUserCostume: costumes.setUserCostume,
    setCurrentUserVote: costumes.setCurrentUserVote,

    // App settings context
    appSettings: settings.appSettings,
    isLoadingSettings: settings.isLoadingSettings,
    setAppSettings: settings.setAppSettings,
  };
};

export default AppProvider;

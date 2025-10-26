import React from "react";
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

  return {
    // Auth context
    user: auth.user,
    authLoading: auth.authLoading,
    isAdmin: auth.isAdmin,

    // Costume context
    costumes: costumes.costumes,
    userCostume: costumes.userCostume,
    votes: costumes.votes,
    currentUserVote: costumes.currentUserVote,
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

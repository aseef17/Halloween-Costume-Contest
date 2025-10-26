import React, { createContext, useState, useEffect, useMemo } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Create App Settings Context
const AppSettingsContext = createContext(null);

// App Settings Context Provider
export const AppSettingsProvider = ({ children }) => {
  const [appSettings, setAppSettings] = useState({
    votingEnabled: false,
    resultsVisible: false,
    allowSelfVote: false,
    contestActive: true,
    lastReset: null,
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Listen for app settings changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "app"),
      (doc) => {
        if (doc.exists()) {
          const settingsData = doc.data();
          setAppSettings({
            votingEnabled: settingsData.votingEnabled || false,
            resultsVisible: settingsData.resultsVisible || false,
            allowSelfVote: settingsData.allowSelfVote || false,
            contestActive: settingsData.contestActive !== false,
            lastReset: settingsData.lastReset || null,
          });
        }
        setIsLoadingSettings(false);
      },
      (error) => {
        console.error("Error fetching app settings:", error);
        setIsLoadingSettings(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      appSettings,
      isLoadingSettings,
      setAppSettings,
    }),
    [appSettings, isLoadingSettings, setAppSettings],
  );

  return (
    <AppSettingsContext.Provider value={contextValue}>
      {children}
    </AppSettingsContext.Provider>
  );
};

// Custom hook to use app settings context
export const useAppSettings = () => {
  const context = React.useContext(AppSettingsContext);
  if (!context) {
    throw new Error(
      "useAppSettings must be used within an AppSettingsProvider",
    );
  }
  return context;
};

export default AppSettingsContext;

import { useContext } from "react";
import AppContext from "../AppContext";

/**
 * Custom hook to use the app context
 * Separated from AppContext.jsx to avoid fast refresh warnings
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

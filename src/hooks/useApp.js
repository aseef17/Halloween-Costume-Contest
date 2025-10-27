import { useApp as useCombinedApp } from "../contexts/CombinedContext";

/**
 * Custom hook to use the app context
 * Uses the new separated context structure
 */
export function useApp() {
  return useCombinedApp();
}

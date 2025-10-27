import { useState, useCallback } from "react";

/**
 * Custom hook for handling async operations with loading and error states
 */
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, ...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    clearError,
  };
};

/**
 * Custom hook for handling costume operations
 */
export const useCostumeOperations = () => {
  const { isLoading, error, execute, clearError } = useAsyncOperation();

  const createCostume = useCallback(
    async (costumeData, userId, userName) => {
      const { CostumeService } = await import("../services/CostumeService");
      return execute(
        CostumeService.createCostume,
        costumeData,
        userId,
        userName,
      );
    },
    [execute],
  );

  const updateCostume = useCallback(
    async (costumeId, costumeData) => {
      const { CostumeService } = await import("../services/CostumeService");
      return execute(CostumeService.updateCostume, costumeId, costumeData);
    },
    [execute],
  );

  const deleteCostume = useCallback(
    async (costumeId) => {
      const { CostumeService } = await import("../services/CostumeService");
      return execute(CostumeService.deleteCostume, costumeId);
    },
    [execute],
  );

  const voteForCostume = useCallback(
    async (costumeId, userId, appSettings = {}) => {
      const { CostumeService } = await import("../services/CostumeService");
      return execute(
        CostumeService.voteForCostume,
        costumeId,
        userId,
        appSettings,
      );
    },
    [execute],
  );

  return {
    isLoading,
    error,
    clearError,
    createCostume,
    updateCostume,
    deleteCostume,
    voteForCostume,
  };
};

/**
 * Custom hook for handling admin operations
 */
export const useAdminOperations = () => {
  const { isLoading, error, execute, clearError } = useAsyncOperation();

  const toggleVoting = useCallback(
    async (enabled) => {
      const { AdminService } = await import("../services/AdminService");
      return execute(AdminService.toggleVoting, enabled);
    },
    [execute],
  );

  const toggleResults = useCallback(
    async (visible) => {
      const { AdminService } = await import("../services/AdminService");
      return execute(AdminService.toggleResults, visible);
    },
    [execute],
  );

  const toggleSelfVote = useCallback(
    async (allowSelfVote) => {
      const { AdminService } = await import("../services/AdminService");
      return execute(AdminService.toggleSelfVote, allowSelfVote);
    },
    [execute],
  );

  const resetContest = useCallback(async () => {
    const { AdminService } = await import("../services/AdminService");
    return execute(AdminService.resetContest);
  }, [execute]);

  const startRevote = useCallback(
    async (tiedCostumeIds, excludedUserIds = []) => {
      const { AdminService } = await import("../services/AdminService");
      return execute(AdminService.startRevote, tiedCostumeIds, excludedUserIds);
    },
    [execute],
  );

  const toggleAutoRevote = useCallback(
    async (enabled) => {
      const { AdminService } = await import("../services/AdminService");
      return execute(AdminService.toggleAutoRevote, enabled);
    },
    [execute],
  );

  const closeVotingWithAutoRevote = useCallback(
    async (costumeResults) => {
      const { AdminService } = await import("../services/AdminService");
      return execute(AdminService.closeVotingWithAutoRevote, costumeResults);
    },
    [execute],
  );

  const endRevote = useCallback(async () => {
    const { AdminService } = await import("../services/AdminService");
    return execute(AdminService.endRevote);
  }, [execute]);

  return {
    isLoading,
    error,
    clearError,
    toggleVoting,
    toggleResults,
    toggleSelfVote,
    toggleAutoRevote,
    resetContest,
    startRevote,
    endRevote,
    closeVotingWithAutoRevote,
  };
};

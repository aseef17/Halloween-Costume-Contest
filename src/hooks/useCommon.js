import { useState, useCallback, useEffect, useMemo } from "react";
import { useApp } from "./useApp";
import { useCostumeOperations } from "./useAsyncOperations";

/**
 * Custom hook for managing modal state
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};

/**
 * Custom hook for managing form state
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const setError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validate = useCallback(
    (validationRules) => {
      const newErrors = {};

      Object.keys(validationRules).forEach((field) => {
        const rule = validationRules[field];
        const value = values[field];

        if (rule.required && (!value || value.trim() === "")) {
          newErrors[field] = rule.message || `${field} is required`;
        } else if (rule.pattern && !rule.pattern.test(value)) {
          newErrors[field] = rule.message || `${field} is invalid`;
        } else if (rule.minLength && value.length < rule.minLength) {
          newErrors[field] =
            rule.message ||
            `${field} must be at least ${rule.minLength} characters`;
        } else if (rule.maxLength && value.length > rule.maxLength) {
          newErrors[field] =
            rule.message ||
            `${field} must be no more than ${rule.maxLength} characters`;
        } else if (rule.custom && !rule.custom(value)) {
          newErrors[field] = rule.message || `${field} is invalid`;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [values]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouchedField,
    reset,
    validate,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 * Custom hook for managing local storage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Custom hook for managing debounced values
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for managing window size
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array is correct here

  return windowSize;
};

/**
 * Custom hook for managing keyboard shortcuts
 */
export const useKeyboardShortcut = (key, callback, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === key && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        callback(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * Custom hook for managing costume voting logic
 */
export const useCostumeVoting = () => {
  const { user, appSettings, currentUserVote } = useApp();
  const { voteForCostume } = useCostumeOperations();

  const canVote = useCallback(
    (costume) => {
      if (!appSettings.votingEnabled || !user) return false;
      if (!appSettings.allowSelfVote && costume.userId === user.uid)
        return false;
      return true;
    },
    [appSettings.votingEnabled, appSettings.allowSelfVote, user]
  );

  const hasVoted = useCallback(
    (costumeId) => {
      return currentUserVote && currentUserVote.costumeId === costumeId;
    },
    [currentUserVote]
  );

  const handleVote = useCallback(
    async (costumeId) => {
      if (!canVote({ userId: user.uid })) return;

      try {
        await voteForCostume(costumeId, user.uid);
      } catch (error) {
        console.error("Error voting:", error);
        throw error;
      }
    },
    [canVote, user, voteForCostume]
  );

  return {
    canVote,
    hasVoted,
    handleVote,
  };
};

/**
 * Custom hook for managing costume filtering and sorting
 */
export const useCostumeFiltering = (costumes) => {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, votes, name

  const filteredAndSortedCostumes = useMemo(() => {
    let filtered = costumes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (costume) =>
          costume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          costume.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort costumes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case "oldest":
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case "votes":
          return (b.voteCount || 0) - (a.voteCount || 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [costumes, searchTerm, sortBy]);

  const userCostumes = useMemo(
    () =>
      filteredAndSortedCostumes.filter(
        (costume) => costume.userId === user?.uid
      ),
    [filteredAndSortedCostumes, user?.uid]
  );

  const otherCostumes = useMemo(
    () =>
      filteredAndSortedCostumes.filter(
        (costume) => costume.userId !== user?.uid
      ),
    [filteredAndSortedCostumes, user?.uid]
  );

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredAndSortedCostumes,
    userCostumes,
    otherCostumes,
  };
};

export default {
  useModal,
  useForm,
  useLocalStorage,
  useDebounce,
  useWindowSize,
  useKeyboardShortcut,
  useCostumeVoting,
  useCostumeFiltering,
};

/**
 * Accessibility utilities and helpers
 */

// ARIA labels for common actions
export const ariaLabels = {
  vote: (costumeName) => `Vote for ${costumeName}`,
  edit: (costumeName) => `Edit ${costumeName}`,
  delete: (costumeName) => `Delete ${costumeName}`,
  submit: "Submit costume",
  cancel: "Cancel",
  close: "Close",
  toggle: (action) => `Toggle ${action}`,
  upload: "Upload image",
  remove: "Remove image",
  login: "Sign in",
  logout: "Sign out",
  register: "Create account",
};

// Focus management utilities
export const focusManagement = {
  // Focus trap for modals
  trapFocus: (element) => {
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => element.removeEventListener("keydown", handleTabKey);
  },

  // Restore focus after modal closes
  restoreFocus: (previousElement) => {
    if (previousElement && typeof previousElement.focus === "function") {
      previousElement.focus();
    }
  },
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle Enter key for buttons
  handleEnter: (callback) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  },

  // Handle Escape key
  handleEscape: (callback) => (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      callback();
    }
  },

  // Handle Arrow keys for navigation
  handleArrows: (onUp, onDown, onLeft, onRight) => (e) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        onUp?.();
        break;
      case "ArrowDown":
        e.preventDefault();
        onDown?.();
        break;
      case "ArrowLeft":
        e.preventDefault();
        onLeft?.();
        break;
      case "ArrowRight":
        e.preventDefault();
        onRight?.();
        break;
    }
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce text to screen readers
  announce: (text, priority = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = text;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Create visually hidden text
  visuallyHidden: "sr-only",
};

// Color contrast utilities
export const colorContrast = {
  // High contrast mode detection
  prefersHighContrast: () => {
    return window.matchMedia("(prefers-contrast: high)").matches;
  },

  // Reduced motion detection
  prefersReducedMotion: () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // Dark mode detection
  prefersDarkMode: () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  },
};

// Form accessibility helpers
export const formAccessibility = {
  // Generate unique IDs for form elements
  generateId: (prefix = "form") =>
    `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Create accessible form field
  createFieldProps: (id, label, error) => ({
    id,
    "aria-label": label,
    "aria-describedby": error ? `${id}-error` : undefined,
    "aria-invalid": !!error,
  }),

  // Create error message props
  createErrorProps: (id) => ({
    id: `${id}-error`,
    role: "alert",
    "aria-live": "polite",
  }),
};

// Loading state accessibility
export const loadingAccessibility = {
  // Loading button props
  loadingButton: (isLoading, loadingText = "Loading...") => ({
    "aria-busy": isLoading,
    "aria-label": isLoading ? loadingText : undefined,
    disabled: isLoading,
  }),

  // Loading content props
  loadingContent: (isLoading) => ({
    "aria-busy": isLoading,
    "aria-live": isLoading ? "polite" : "off",
  }),
};

// Animation accessibility
export const animationAccessibility = {
  // Respect reduced motion preferences
  getAnimationProps: (defaultProps, reducedMotionProps = {}) => {
    if (colorContrast.prefersReducedMotion()) {
      return {
        ...defaultProps,
        ...reducedMotionProps,
        transition: { duration: 0 },
      };
    }
    return defaultProps;
  },

  // Safe animation duration
  getSafeDuration: (duration) => {
    return colorContrast.prefersReducedMotion() ? 0 : duration;
  },
};

export default {
  ariaLabels,
  focusManagement,
  keyboardNavigation,
  screenReader,
  colorContrast,
  formAccessibility,
  loadingAccessibility,
  animationAccessibility,
};

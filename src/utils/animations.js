/**
 * Micro-interactions and animation utilities
 */

// Common animation variants
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },

  scaleInBounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: { opacity: 0, scale: 0.3 },
  },

  // Slide animations
  slideInUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
  },

  slideInDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  },

  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

// Hover animations
export const hoverAnimations = {
  // Button hover
  buttonHover: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    whileTap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  },

  // Card hover
  cardHover: {
    whileHover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
    whileTap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  },

  // Icon hover
  iconHover: {
    whileHover: {
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.2 },
    },
    whileTap: {
      scale: 0.9,
      transition: { duration: 0.1 },
    },
  },

  // Image hover
  imageHover: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  },
};

// Loading animations
export const loadingAnimations = {
  // Spinner
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  // Pulse
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Bounce
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Shimmer
  shimmer: {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

// Success animations
export const successAnimations = {
  // Checkmark
  checkmark: {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  },

  // Confetti burst
  confetti: {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },

  // Star burst
  starBurst: {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: 1,
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  },
};

// Error animations
export const errorAnimations = {
  // Shake
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  },

  // Wiggle
  wiggle: {
    animate: {
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  },
};

// Page transition animations
export const pageTransitions = {
  // Slide transition
  slideTransition: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },

  // Fade transition
  fadeTransition: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Scale transition
  scaleTransition: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// Gesture animations
export const gestureAnimations = {
  // Drag
  drag: {
    drag: true,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.2,
    whileDrag: { scale: 1.1 },
  },

  // Swipe
  swipe: {
    drag: "x",
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.2,
    onDragEnd: (event, info) => {
      if (info.offset.x > 100) {
        // Swipe right action
      } else if (info.offset.x < -100) {
        // Swipe left action
      }
    },
  },
};

// Utility functions
export const animationUtils = {
  // Create staggered animation
  createStagger: (delay = 0.1) => ({
    animate: {
      transition: {
        staggerChildren: delay,
      },
    },
  }),

  // Create spring animation
  createSpring: (stiffness = 300, damping = 20) => ({
    type: "spring",
    stiffness,
    damping,
  }),

  // Create ease animation
  createEase: (duration = 0.3, ease = "easeInOut") => ({
    duration,
    ease,
  }),

  // Respect reduced motion
  respectReducedMotion: (animation, fallback = {}) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return fallback;
    }
    return animation;
  },
};

export default {
  animationVariants,
  hoverAnimations,
  loadingAnimations,
  successAnimations,
  errorAnimations,
  pageTransitions,
  gestureAnimations,
  animationUtils,
};

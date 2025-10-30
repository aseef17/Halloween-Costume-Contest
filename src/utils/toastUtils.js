import { toast } from "sonner";

/**
 * Enhanced toast notifications with Halloween theme
 */
export const halloweenToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      icon: "🎃",
      duration: 4000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      icon: "👻",
      duration: 5000,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast.info(message, {
      icon: "🦇",
      duration: 3000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast.warning(message, {
      icon: "⚠️",
      duration: 4000,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      icon: "🕷️",
      ...options,
    });
  },
};

/**
 * Specific toast messages for common actions
 */
export const costumeToasts = {
  submitted: () => halloweenToast.success("Costume submitted successfully! 🎃"),
  updated: () => halloweenToast.success("Costume updated! ✨"),
  deleted: () => halloweenToast.success("Costume deleted! 🗑️"),
  voteCast: () =>
    halloweenToast.success("Vote cast! Your choice has been recorded 🗳️"),
  voteChanged: () => halloweenToast.info("Vote changed! 🔄"),
  alreadyExists: () =>
    halloweenToast.error(
      "You already have a costume! Edit or delete it first 👻"
    ),
  uploadSuccess: () =>
    halloweenToast.success("Image uploaded successfully! 📸"),
  uploadError: () =>
    halloweenToast.error("Failed to upload image. Please try again 👻"),
};

export const adminToasts = {
  votingEnabled: () =>
    halloweenToast.success("Voting is now enabled! Let the games begin! 🎮"),
  votingDisabled: () => halloweenToast.info("Voting has been disabled 🛑"),
  resultsShown: () => halloweenToast.success("Results are now visible! 🏆"),
  resultsHidden: () => halloweenToast.info("Results are now hidden 👻"),
  selfVoteEnabled: () =>
    halloweenToast.success("Self-voting is now enabled! 🎯"),
  selfVoteDisabled: () => halloweenToast.info("Self-voting is now disabled 🚫"),
  autoRevoteEnabled: () =>
    halloweenToast.success(
      "Auto tie breaker vote is now enabled! Ties will be handled automatically! 🔄"
    ),
  autoRevoteDisabled: () =>
    halloweenToast.info(
      "Auto tie breaker vote is now disabled. Manual control required 🎮"
    ),
  autoRevoteTriggered: () =>
    halloweenToast.success(
      "Auto tie breaker vote triggered! Breaking the tie automatically! 🏆"
    ),
  contestReset: () =>
    halloweenToast.success("Contest has been reset! Fresh start! 🔄"),
  resetError: () =>
    halloweenToast.error("Failed to reset contest. Please try again 👻"),
  revoteError: () =>
    halloweenToast.error(
      "Failed to manage tie breaker vote. Please try again 👻"
    ),
  deleteUserError: () =>
    halloweenToast.error("Failed to delete user. Please try again 👻"),
};

export const authToasts = {
  loginSuccess: () => halloweenToast.success("Welcome back! 🎃"),
  loginError: (error) => {
    const messages = {
      "auth/invalid-email": "Invalid email format 👻",
      "auth/user-not-found": "No account found with this email 🕵️",
      "auth/wrong-password": "Incorrect password 🔐",
      "auth/too-many-requests": "Too many attempts. Please try again later ⏰",
      "auth/network-request-failed":
        "Network error. Please check your connection 🌐",
    };
    return halloweenToast.error(
      messages[error.code] || "Login failed. Please try again 👻"
    );
  },
  registerSuccess: () =>
    halloweenToast.success("Account created! Welcome to the contest! 🎉"),
  registerError: (error) => {
    const messages = {
      "auth/email-already-in-use": "Email already in use 📧",
      "auth/invalid-email": "Invalid email format 👻",
      "auth/weak-password":
        "Password is too weak. Use at least 6 characters 🔐",
      "auth/network-request-failed":
        "Network error. Please check your connection 🌐",
    };
    return halloweenToast.error(
      messages[error.code] || "Registration failed. Please try again 👻"
    );
  },
  logoutSuccess: () =>
    halloweenToast.info("Logged out successfully! See you next time! 👋"),
};

/**
 * Promise-based toast for async operations
 */
export const promiseToast = {
  costumeSubmit: (promise) => {
    return toast.promise(promise, {
      loading: "Submitting your ghoulish creation... 🎃",
      success: "Costume submitted! The voting begins now! Mwahahaha! 🎭",
      error: "Failed to submit costume. The spirits are not pleased 👻",
    });
  },

  costumeUpdate: (promise) => {
    return toast.promise(promise, {
      loading: "Updating your costume... ✨",
      success: "Costume updated! Looking spookier than ever! 🎃",
      error: "Failed to update costume. Try again! 👻",
    });
  },

  costumeDelete: (promise) => {
    return toast.promise(promise, {
      loading: "Deleting costume... 🗑️",
      success: "Costume deleted! Gone but not forgotten 👻",
      error: "Failed to delete costume. The spirits won't let it go! 👻",
    });
  },

  voteCast: (promise) => {
    return toast.promise(promise, {
      loading: "Casting your vote... 🗳️",
      success: "Vote cast! Your choice has been recorded! 🎯",
      error: "Failed to cast vote. Try again! 👻",
    });
  },

  imageUpload: (promise) => {
    return toast.promise(promise, {
      loading: "Uploading image... 📸",
      success: "Image uploaded! Looking spooky! 👻",
      error: "Failed to upload image. Try again! 👻",
    });
  },

  contestReset: (promise) => {
    return toast.promise(promise, {
      loading: "Resetting contest... 🔄",
      success: "Contest reset! Fresh start! 🎃",
      error: "Failed to reset contest. The spirits won't let go! 👻",
    });
  },

  revoteStart: (promise) => {
    return toast.promise(promise, {
      loading: "Starting tie breaker vote... 🔄",
      success:
        "Tie breaker vote started! Users can now vote for the tied costumes! 🏆",
      error: "Failed to start tie breaker vote. Try again! 👻",
    });
  },

  revoteEnd: (promise) => {
    return toast.promise(promise, {
      loading: "Ending tie breaker vote... ✅",
      success: "Tie breaker vote ended! Check the results! 🎉",
      error: "Failed to end tie breaker vote. Try again! 👻",
    });
  },

  userDeleted: (promise) => {
    return toast.promise(promise, {
      loading: "Deleting user and all associated data... 🗑️",
      success: "User deleted successfully! All data has been removed 👻",
      error: "Failed to delete user. Please try again! 👻",
    });
  },
};

export default halloweenToast;

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../utils";

// Toast context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Toast component
const Toast = ({ toast, onRemove }) => {
  const { id, type, title, message, duration = 5000, action } = toast;

  const icons = {
    [TOAST_TYPES.SUCCESS]: CheckCircle,
    [TOAST_TYPES.ERROR]: AlertCircle,
    [TOAST_TYPES.WARNING]: AlertTriangle,
    [TOAST_TYPES.INFO]: Info,
  };

  const colors = {
    [TOAST_TYPES.SUCCESS]: {
      bg: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30",
      icon: "text-green-400",
      title: "text-green-300",
    },
    [TOAST_TYPES.ERROR]: {
      bg: "from-red-500/20 to-rose-500/20",
      border: "border-red-500/30",
      icon: "text-red-400",
      title: "text-red-300",
    },
    [TOAST_TYPES.WARNING]: {
      bg: "from-yellow-500/20 to-orange-500/20",
      border: "border-yellow-500/30",
      icon: "text-yellow-400",
      title: "text-yellow-300",
    },
    [TOAST_TYPES.INFO]: {
      bg: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      title: "text-blue-300",
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  // Auto-remove toast after duration
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl",
        "bg-gradient-to-r",
        colorScheme.bg,
        colorScheme.border,
        "max-w-sm w-full"
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={cn("flex-shrink-0", colorScheme.icon)}
          >
            <Icon className="w-5 h-5" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={cn("text-sm font-semibold mb-1", colorScheme.title)}
              >
                {title}
              </motion.h4>
            )}

            {message && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-300 leading-relaxed"
              >
                {message}
              </motion.p>
            )}

            {/* Action button */}
            {action && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3"
              >
                <button
                  onClick={action.onClick}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                    "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20",
                    colorScheme.title
                  )}
                >
                  {action.label}
                </button>
              </motion.div>
            )}
          </div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => onRemove(id)}
            className={cn(
              "flex-shrink-0 p-1 rounded-lg transition-colors",
              "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20",
              "text-gray-400 hover:text-gray-300"
            )}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/20"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

// Toast container
const ToastContainer = ({ toasts, onRemove }) => (
  <AnimatePresence mode="popLayout">
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  </AnimatePresence>
);

// Toast provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Convenience methods
export const createToastMethods = (addToast) => ({
  success: (title, message, options = {}) =>
    addToast({ type: TOAST_TYPES.SUCCESS, title, message, ...options }),

  error: (title, message, options = {}) =>
    addToast({ type: TOAST_TYPES.ERROR, title, message, ...options }),

  warning: (title, message, options = {}) =>
    addToast({ type: TOAST_TYPES.WARNING, title, message, ...options }),

  info: (title, message, options = {}) =>
    addToast({ type: TOAST_TYPES.INFO, title, message, ...options }),
});

export default ToastProvider;

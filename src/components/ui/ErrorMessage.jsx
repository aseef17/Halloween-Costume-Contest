import React from "react";
import { motion } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "../../utils";

const ErrorMessage = ({
  message,
  onClose,
  variant = "error",
  className,
  showIcon = true,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return "bg-red-500/10 border-red-500/30 text-red-300";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-300";
      case "success":
        return "bg-green-500/10 border-green-500/30 text-green-300";
      case "info":
        return "bg-blue-500/10 border-blue-500/30 text-blue-300";
      default:
        return "bg-red-500/10 border-red-500/30 text-red-300";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-red-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative p-4 rounded-xl border backdrop-blur-sm",
        "shadow-lg shadow-black/20",
        getVariantStyles(),
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "backOut" }}
            className={cn("flex-shrink-0 mt-0.5", getIconColor())}
          >
            <AlertCircle className="w-5 h-5" />
          </motion.div>
        )}

        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium leading-relaxed"
          >
            {message}
          </motion.p>
        </div>

        {onClose && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onClose}
            className={cn(
              "flex-shrink-0 p-1 rounded-full transition-colors",
              "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20",
              getIconColor(),
            )}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Animated background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "absolute inset-0 rounded-xl opacity-20 blur-sm -z-10",
          variant === "error" && "bg-red-500",
          variant === "warning" && "bg-yellow-500",
          variant === "success" && "bg-green-500",
          variant === "info" && "bg-blue-500",
        )}
      />
    </motion.div>
  );
};

export default ErrorMessage;

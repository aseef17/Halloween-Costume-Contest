import * as React from "react";
import { motion } from "motion/react";
import { cn } from "../../utils";

const Input = React.forwardRef(
  ({ className, error, errorMessage, variant = "default", ...props }, ref) => {
    const getVariantStyles = () => {
      if (error) {
        return "border-red-500/50 bg-red-500/5 focus:border-red-400 focus:ring-red-400/20";
      }

      switch (variant) {
        case "default":
          return "border-orange-500/30 bg-black/40 focus:border-orange-400 focus:ring-orange-400/20";
        case "purple":
          return "border-purple-500/30 bg-black/40 focus:border-purple-400 focus:ring-purple-400/20";
        default:
          return "border-orange-500/30 bg-black/40 focus:border-orange-400 focus:ring-orange-400/20";
      }
    };

    return (
      <div className="relative">
        <motion.input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black",
            "placeholder:text-gray-400 text-white",
            "hover:border-opacity-60",
            getVariantStyles(),
            error && "animate-pulse",
            className,
          )}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          {...props}
        />

        {error && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-0 text-xs text-red-400 flex items-center gap-1"
          >
            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
            {errorMessage}
          </motion.div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };

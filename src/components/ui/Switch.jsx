import * as React from "react";
import { motion } from "motion/react";
import { cn } from "../../utils";

const Switch = React.forwardRef(
  (
    { className, checked = false, onCheckedChange, disabled = false, ...props },
    ref
  ) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-gradient-to-r from-orange-500 to-orange-600"
            : "bg-gray-600",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        <motion.span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform"
          )}
          animate={{
            x: checked ? 20 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };

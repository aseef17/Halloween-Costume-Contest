import * as React from "react";
import { cn } from "../../utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full px-4 py-3 bg-white/10 border border-orange-500/30 rounded-lg focus:outline-none focus:border-orange-400 transition-all h-32 resize-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };

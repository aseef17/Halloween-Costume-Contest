import * as React from "react";
import { cn } from "../../utils";

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-gradient-to-br from-black via-gray-900 to-orange-900 rounded-2xl shadow-2xl border border-orange-500/30 p-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

export default Card;

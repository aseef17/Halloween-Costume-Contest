import * as React from "react";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";
import Lottie from "lottie-react";
import { cn } from "../../utils";
import successAnimation from "../../assets/lottie/success.json";
import confettiAnimation from "../../assets/lottie/confetti.json";
import fireworksAnimation from "../../assets/lottie/fireworks.json";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "border-2 border-orange-400 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        secondary:
          "border-2 border-purple-400 text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        outline:
          "border-2 border-orange-400 text-orange-300 bg-black/60 backdrop-blur-sm hover:bg-orange-500/20 hover:border-orange-300 hover:text-white hover:shadow-lg hover:shadow-orange-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        outlinePurple:
          "border-2 border-purple-400 text-purple-300 bg-black/60 backdrop-blur-sm hover:bg-purple-500/20 hover:border-purple-300 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        ghost:
          "bg-transparent text-orange-300 hover:bg-orange-500/15 hover:text-white border border-transparent hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/20",
        danger:
          "border-2 border-red-400 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:border-red-300 hover:shadow-xl hover:shadow-red-500/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        success:
          "border-2 border-green-400 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        google:
          "border-2 border-gray-200 text-gray-800 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-500/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-gray-100/50 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      },
      size: {
        default: "px-4 py-2 text-base",
        sm: "px-3 py-1.5 text-sm",
        lg: "px-6 py-3 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Spooky animation variants for different button types
const getAnimationProps = (animation, variant) => {
  const baseColor =
    variant === "purple" || variant === "outlinePurple"
      ? "124, 58, 237"
      : "255, 117, 24";

  switch (animation) {
    case "pulse":
      return {
        animate: {
          scale: [1, 1.02, 1],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    case "glow":
      return {
        animate: {
          boxShadow: [
            `0 0 20px rgba(${baseColor}, 0.3)`,
            `0 0 40px rgba(${baseColor}, 0.6)`,
            `0 0 20px rgba(${baseColor}, 0.3)`,
          ],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    case "shake":
      return {
        whileHover: {
          x: [0, -2, 2, -2, 2, 0],
          transition: { duration: 0.4 },
        },
      };
    case "float":
      return {
        animate: {
          y: [0, -3, 0],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    case "spooky":
      return {
        animate: {
          rotate: [0, 1, -1, 0],
          scale: [1, 1.01, 1],
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    case "haunted":
      return {
        animate: {
          opacity: [1, 0.8, 1],
          scale: [1, 1.02, 1],
        },
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    case "ghostly":
      return {
        animate: {
          y: [0, -2, 0],
          opacity: [1, 0.9, 1],
        },
        transition: {
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };
    case "wicked":
      return {
        whileHover: {
          rotate: [0, -2, 2, 0],
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 },
        },
      };
    case "success":
      return {
        animate: {
          scale: [1, 1.05, 1],
        },
        transition: {
          duration: 0.6,
          ease: "easeOut",
        },
      };
    case "celebration":
      return {
        animate: {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        },
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
      };
    default:
      return {};
  }
};

// Get Lottie animation data based on animation type
const getLottieAnimation = (animation) => {
  switch (animation) {
    case "success":
      return successAnimation;
    case "celebration":
      return confettiAnimation;
    case "fireworks":
      return fireworksAnimation;
    default:
      return null;
  }
};

const Button = React.forwardRef(
  (
    {
      variant,
      size,
      animation,
      className,
      children,
      showLottie = false,
      ...props
    },
    ref,
  ) => {
    const animationProps = animation
      ? getAnimationProps(animation, variant)
      : {};
    const lottieData = showLottie ? getLottieAnimation(animation) : null;

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...animationProps}
        {...props}
      >
        {/* Lottie Animation Overlay */}
        {showLottie && lottieData && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <Lottie
              animationData={lottieData}
              loop={false}
              autoplay={true}
              className="w-full h-full opacity-80"
            />
          </div>
        )}

        {/* Spooky hover effect */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </span>

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export default Button;
export { buttonVariants };

import { motion } from "motion/react";
import pumpkinSvg from "../../assets/pumpkin.svg";
import ghostSvg from "../../assets/ghost.svg";
import batSvg from "../../assets/bat.svg";

const icons = {
  pumpkin: pumpkinSvg,
  ghost: ghostSvg,
  bat: batSvg,
};

const HalloweenIcon = ({
  type = "pumpkin",
  size = "md",
  className = "",
  animate = false
}) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const iconSrc = icons[type] || icons.pumpkin;

  if (animate) {
    return (
      <motion.img
        src={iconSrc}
        alt={type}
        className={`${sizes[size]} ${className}`}
        animate={{
          y: [0, -5, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  return (
    <img
      src={iconSrc}
      alt={type}
      className={`${sizes[size]} ${className}`}
    />
  );
};

export default HalloweenIcon;

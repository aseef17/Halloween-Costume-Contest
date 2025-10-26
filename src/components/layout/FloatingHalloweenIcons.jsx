import { motion } from "motion/react";
import Lottie from "lottie-react";
import halloweenBackgroundAnimation from "../../assets/lottie/halloween-background.json";

const FloatingHalloweenIcons = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Lottie Halloween Background Animation */}
      <div className="absolute inset-0 opacity-30">
        <Lottie
          animationData={halloweenBackgroundAnimation}
          loop={true}
          autoplay={true}
          className="w-full h-full"
          style={{
            filter: "hue-rotate(30deg) saturate(1.2) brightness(0.8)",
            transform: "scale(1.1)",
          }}
        />
      </div>

      {/* Additional floating elements for depth */}
      {[...Array(8)].map((_, i) => {
        const randomDelay = Math.random() * 5;
        const randomDuration = 20 + Math.random() * 15;
        const randomX = Math.random() * 100;
        const randomSize = 20 + Math.random() * 30;
        const emojis = ["🎃", "👻", "🦇", "🕸️", "🧙‍♀️", "🧛‍♂️", "💀", "🔮"];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        return (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-40"
            style={{
              left: `${randomX}%`,
              top: `-${randomSize}px`,
              fontSize: `${randomSize}px`,
            }}
            initial={{ y: -100, opacity: 0, rotate: 0 }}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, (Math.random() - 0.5) * 50],
              rotate: [0, Math.random() * 180],
              opacity: [0, 0.4, 0.2, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {randomEmoji}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingHalloweenIcons;

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

// Halloween themed particles
const HALLOWEEN_EMOJIS = [
  "🎃",
  "👻",
  "🦇",
  "🕸️",
  "🧙‍♀️",
  "🧛",
  "💀",
  "🔮",
  "🌙",
  "⚰️",
];

const HalloweenParticles = () => {
  const [particles, setParticles] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create particles on mount or window resize
  useEffect(() => {
    // Adjust particle count based on screen size
    const particleCount = windowSize.width < 768 ? 10 : 15;

    const newParticles = [...Array(particleCount)].map((_, i) => ({
      id: i,
      emoji:
        HALLOWEEN_EMOJIS[Math.floor(Math.random() * HALLOWEEN_EMOJIS.length)],
      size: Math.random() * 0.5 + 0.8, // Random size between 0.8 and 1.3
      startX: Math.random() * windowSize.width,
      endX: Math.random() * windowSize.width,
      duration: Math.random() * 10 + 10, // Random duration between 10 and 20 seconds
      delay: Math.random() * 5, // Random delay between 0 and 5 seconds
      opacity: Math.random() * 0.5 + 0.2, // Random opacity between 0.2 and 0.7
    }));

    setParticles(newParticles);
  }, [windowSize]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-2xl"
          style={{
            opacity: particle.opacity,
            fontSize: `${Math.max(1.5, 2 * particle.size)}rem`, // Larger on bigger screens
          }}
          initial={{
            x: particle.startX,
            y: -50,
            rotate: 0,
            scale: particle.size,
          }}
          animate={{
            y: windowSize.height + 100,
            x: particle.endX,
            rotate: Math.random() > 0.5 ? 360 : -360,
            scale: [particle.size, particle.size * 1.1, particle.size],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            repeatDelay: Math.random() * 2,
            ease: "linear",
            scale: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Add a few fixed spider webs in the corners */}
      <div className="absolute top-0 left-0 text-5xl opacity-30 transform -translate-x-1/4 -translate-y-1/4">
        🕸️
      </div>
      <div className="absolute top-0 right-0 text-5xl opacity-30 transform translate-x-1/4 -translate-y-1/4">
        🕸️
      </div>
      <div className="absolute bottom-0 left-0 text-5xl opacity-30 transform -translate-x-1/4 translate-y-1/4">
        🕸️
      </div>
      <div className="absolute bottom-0 right-0 text-5xl opacity-30 transform translate-x-1/4 translate-y-1/4">
        🕸️
      </div>
    </div>
  );
};

export default HalloweenParticles;

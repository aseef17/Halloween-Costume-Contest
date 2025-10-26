import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Lottie from "lottie-react";
import { AppProvider } from "./AppContext";
import AuthRouter from "./components/features/AuthRouter";
import FloatingHalloweenIcons from "./components/layout/FloatingHalloweenIcons";
import { Toaster } from "./components/ui/Toaster";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { Loader2 } from "lucide-react";
import halloweenBackgroundAnimation from "./assets/lottie/halloween-background.json";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for better visual effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <Toaster />
        <div className="relative min-h-screen w-full overflow-hidden">
          {/* Lottie Background Animation */}
          <div className="fixed inset-0 bg-black z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/30 to-orange-900/30"></div>
            <div className="absolute inset-0 opacity-40">
              <Lottie
                animationData={halloweenBackgroundAnimation}
                loop={true}
                autoplay={true}
                className="w-full h-full"
                style={{
                  filter: "hue-rotate(20deg) saturate(1.1) brightness(0.7)",
                  transform: "scale(1.05)",
                }}
              />
            </div>
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Floating Halloween icons */}
          <FloatingHalloweenIcons />

          {/* Main content */}
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-6xl mb-6"
                >
                  🎃
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-4 tracking-wide">
                  Spooktacular Costume Contest
                </h1>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                  <span className="text-orange-400">
                    Summoning the spirits...
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen"
              >
                <AuthRouter />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;

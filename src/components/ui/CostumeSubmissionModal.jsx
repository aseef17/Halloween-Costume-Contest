import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Lottie from "lottie-react";
import { X, Sparkles, Star, Zap } from "lucide-react";
import Button from "./Button";
import confettiAnimation from "../../assets/lottie/confetti.json";
import successAnimation from "../../assets/lottie/success.json";

const CostumeSubmissionModal = ({ isOpen, onClose, costumeName }) => {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messages = useMemo(
    () => [
      "Thanks for submitting your ghoulish creation!",
      "Now the game of voting begins...",
      "Mwahahaha! 🎃",
      "May the spookiest costume win! 👻",
    ],
    [],
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentText("");
      setTextIndex(0);
      setIsTyping(false);
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setCurrentText("");
      setTextIndex(0);
      setIsTyping(false);
    }
  }, [isOpen]);

  // Handle typing animation for current message
  useEffect(() => {
    if (!isOpen || textIndex >= messages.length) return;

    setIsTyping(true);
    const currentMessage = messages[textIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= currentMessage.length) {
        setCurrentText(currentMessage.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        // Wait before moving to next message
        setTimeout(() => {
          setTextIndex((prev) => prev + 1);
          setCurrentText("");
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [isOpen, textIndex, messages]);

  // Auto-close modal when all messages are done
  useEffect(() => {
    if (textIndex >= messages.length && !isTyping) {
      const closeTimer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(closeTimer);
    }
  }, [textIndex, isTyping, onClose, messages.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti Background */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <Lottie
              animationData={confettiAnimation}
              loop={false}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Success Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <Lottie
            animationData={successAnimation}
            loop={true}
            autoplay={true}
            className="w-full h-full"
          />
        </div>

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.5, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -100, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-purple-500 to-orange-500 blur-3xl opacity-30 rounded-3xl" />

          {/* Card content */}
          <div className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl border-2 border-orange-500/50 rounded-3xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>

            {/* Header with animated icon */}
            <div className="relative pt-8 pb-6 px-6">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center mb-4"
              >
                <div className="p-6 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 backdrop-blur-sm border-2 border-white/20">
                  <Sparkles className="w-16 h-16 text-orange-400" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-center text-white mb-4 drop-shadow-lg"
              >
                Costume Submitted!
              </motion.h2>

              {/* Typing animation text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center min-h-[4rem] flex items-center justify-center"
              >
                <p className="text-lg text-orange-300 font-medium">
                  {currentText}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ml-1"
                  >
                    |
                  </motion.span>
                </p>
              </motion.div>

              {/* Costume name */}
              {costumeName && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-center mt-4"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30">
                    <p className="text-sm text-gray-400 mb-1">Your Costume</p>
                    <p className="text-xl font-bold text-orange-300">
                      {costumeName}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 my-6"
              >
                <Star className="w-4 h-4 text-orange-400" />
                <Zap className="w-4 h-4 text-purple-400" />
                <Star className="w-4 h-4 text-orange-400" />
              </motion.div>

              {/* Halloween emojis */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="text-4xl text-center"
              >
                🎃👻🦇
              </motion.div>
            </div>

            {/* Footer with action */}
            <div className="px-6 pb-6">
              <Button
                onClick={onClose}
                variant="default"
                animation="celebration"
                showLottie={true}
                className="w-full py-3 text-lg"
              >
                Awesome! Let's Go!
              </Button>
            </div>

            {/* Bottom decoration */}
            <div className="h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CostumeSubmissionModal;

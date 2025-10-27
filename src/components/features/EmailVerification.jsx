import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Button from "../ui/Button";
import { Mail, Clock, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import logger from "../../utils/logger";

const EmailVerification = ({ userEmail }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null);
  const [canResend, setCanResend] = useState(true);
  const [error, setError] = useState("");
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Simple periodic check for verification (every 30 seconds)
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        try {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            logger.log("Periodic check detected email verification");
            window.location.reload();
          }
        } catch (error) {
          logger.error("Periodic verification check failed:", error);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, []);

  // Rate limiting: allow resend every 60 seconds, max 3 attempts
  useEffect(() => {
    if (lastResendTime) {
      const timeSinceLastResend = Date.now() - lastResendTime;
      const timeUntilNextResend = Math.max(0, 60000 - timeSinceLastResend);

      if (timeUntilNextResend > 0) {
        setCanResend(false);
        const timer = setTimeout(() => {
          setCanResend(true);
        }, timeUntilNextResend);
        return () => clearTimeout(timer);
      } else {
        setCanResend(true);
      }
    }
  }, [lastResendTime]);

  const handleResendVerification = async () => {
    if (!canResend || resendCount >= 3) return;

    setIsResending(true);
    setError("");

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendCount((prev) => prev + 1);
        setLastResendTime(Date.now());
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setError("Failed to send verification email. Please try again.");
    }

    setIsResending(false);
  };

  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    setError("");

    try {
      if (auth.currentUser) {
        // Force reload to get latest verification status
        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {
          logger.log("Email verification detected, reloading page");
          // Page reload will trigger onAuthStateChanged with updated status
          window.location.reload();
          return;
        } else {
          setError(
            "Email not yet verified. Please check your email and click the verification link."
          );
        }
      }
    } catch (error) {
      logger.error("Error checking verification:", error);
      setError("Failed to check verification status. Please try again.");
    }

    setIsCheckingVerification(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getTimeUntilNextResend = () => {
    if (!lastResendTime) return 0;
    const timeSinceLastResend = Date.now() - lastResendTime;
    return Math.max(0, 60000 - timeSinceLastResend);
  };

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl bg-black/70 backdrop-blur-lg border border-orange-500/30 mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3,
            }}
            className="inline-block"
          >
            <motion.span
              className="inline-block text-5xl mb-2"
              animate={{
                y: [0, -10, 0],
                rotate: [0, -5, 0, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              📧
            </motion.span>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold mb-2 text-white font-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Verify Your Email
          </motion.h2>
          <motion.p
            className="text-gray-400 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            We've sent a verification link to your email
          </motion.p>
        </div>

        <div className="space-y-6">
          {/* Email Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="text-orange-300 font-semibold">{userEmail}</p>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-300 font-semibold text-sm mb-1">
                  Check Your Email
                </p>
                <p className="text-gray-400 text-sm">
                  Click the verification link in the email we sent to activate
                  your account. We'll automatically check for verification every
                  few seconds, or you can click the button below.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-semibold text-sm mb-1">
                  Check Spam Folder
                </p>
                <p className="text-gray-400 text-sm">
                  If you don't see the email, check your spam or junk folder.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="space-y-3"
          >
            {/* Check Verification Button */}
            <Button
              onClick={handleCheckVerification}
              disabled={isCheckingVerification}
              className="w-full flex items-center justify-center gap-2 text-lg py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isCheckingVerification ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Check Verification Status
                </>
              )}
            </Button>

            {/* Resend Button */}
            <Button
              onClick={handleResendVerification}
              disabled={isResending || !canResend || resendCount >= 3}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-lg py-3 border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
            >
              {isResending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Sending...
                </>
              ) : resendCount >= 3 ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Max Attempts Reached
                </>
              ) : !canResend ? (
                <>
                  <Clock className="w-5 h-5" />
                  Wait {formatTime(getTimeUntilNextResend())}
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </motion.div>

          {/* Resend Status */}
          {resendCount > 0 && resendCount < 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-gray-400 text-sm">
                Resend attempts: {resendCount}/3
              </p>
            </motion.div>
          )}

          {/* Logout Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-gray-400 hover:text-gray-300 transition-colors text-base"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out and try different email
            </Button>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute -left-10 -top-10 text-4xl animate-bounce-slow pointer-events-none">
          📧
        </div>
        <div className="absolute -right-5 -bottom-5 text-4xl animate-bounce-slow pointer-events-none opacity-70">
          ✉️
        </div>
      </motion.div>

      {/* Animation styles */}
      <style>{`
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;

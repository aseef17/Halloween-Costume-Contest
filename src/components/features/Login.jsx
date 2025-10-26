import React, { useState } from "react";
import { motion } from "motion/react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import ErrorMessage from "../ui/ErrorMessage";
import { Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";

// Halloween emoji array for floating animations
const HALLOWEEN_EMOJIS = ["🎃", "👻", "🦇", "🕸️", "🧙‍♀️", "🧛‍♂️", "💀", "🔮"];

const Login = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  handleLogin,
  handleGoogleSignIn,
  switchToRegister,
}) => {
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    handleLogin(e);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Login Form Card */}
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
              🎃
            </motion.span>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold mb-2 text-white font-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Welcome Back!
          </motion.h2>
          <motion.p
            className="text-gray-400 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Sign in to vote for the best costume
          </motion.p>
        </div>

        {error && (
          <ErrorMessage message={error} variant="error" className="mb-4" />
        )}

        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-orange-400">
              <Mail className="w-4 h-4" /> Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="text-base py-3 rounded-xl bg-black/40 border-orange-500/40"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-orange-400">
              <Lock className="w-4 h-4" /> Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 text-base py-3 rounded-xl bg-black/40 border-orange-500/40"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-orange-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              variant="default"
              animation="spooky"
              className="w-full flex items-center justify-center gap-2 text-lg py-3 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span> <Sparkles className="w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="google"
              animation="ghostly"
              className="w-full flex items-center justify-center gap-3 py-3 mt-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-base">
                Sign in with Google
              </span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <Button
              variant="ghost"
              type="button"
              onClick={switchToRegister}
              className="w-full text-orange-400 hover:text-orange-300 transition-colors text-base mt-2"
            >
              Don't have an account? Register
            </Button>
          </motion.div>
        </form>

        {/* Floating spiders - decorative elements */}
        <div className="absolute -left-10 -top-10 text-4xl animate-bounce-slow pointer-events-none">
          🕸️
        </div>
        <div className="absolute -right-5 -bottom-5 text-4xl animate-bounce-slow pointer-events-none opacity-70">
          🕸️
        </div>
      </motion.div>

      {/* Animation styles */}
      <style>{`
        @keyframes float0 { 0%{transform:translateY(0);} 50%{transform:translateY(-20px);} 100%{transform:translateY(0);} }
        @keyframes float1 { 0%{transform:translateY(0);} 50%{transform:translateY(15px);} 100%{transform:translateY(0);} }
        @keyframes float2 { 0%{transform:translateY(0);} 50%{transform:translateY(-10px);} 100%{transform:translateY(0);} }
        @keyframes float3 { 0%{transform:translateY(0);} 50%{transform:translateY(25px);} 100%{transform:translateY(0);} }
        @keyframes float4 { 0%{transform:translateY(0);} 50%{transform:translateY(-15px);} 100%{transform:translateY(0);} }
        .animate-float0 { animation: float0 4s ease-in-out infinite; }
        .animate-float1 { animation: float1 5s ease-in-out infinite; }
        .animate-float2 { animation: float2 3.5s ease-in-out infinite; }
        .animate-float3 { animation: float3 6s ease-in-out infinite; }
        .animate-float4 { animation: float4 4.5s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        
        .font-halloween {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 154, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Login;

import React, { Suspense, lazy } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

/**
 * Higher-order component for lazy loading with fallback
 */
export const withLazyLoading = (Component, fallback = null) => {
  const LazyComponent = lazy(() => Component);

  return (props) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Default loading fallback component
 */
const DefaultFallback = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center min-h-screen bg-black"
  >
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 mx-auto mb-4"
      >
        <Loader2 className="w-12 h-12 text-orange-400" />
      </motion.div>
      <p className="text-gray-300 font-display text-lg">
        Loading Halloween magic...
      </p>
    </div>
  </motion.div>
);

/**
 * Lazy load components with custom fallbacks
 */
export const LazyDashboard = withLazyLoading(
  () => import("../components/features/Dashboard"),
  <DefaultFallback />,
);

export const LazyAdmin = withLazyLoading(
  () => import("../components/features/Admin"),
  <DefaultFallback />,
);

export const LazyLogin = withLazyLoading(
  () => import("../components/features/Login"),
  <DefaultFallback />,
);

export const LazyRegister = withLazyLoading(
  () => import("../components/features/Register"),
  <DefaultFallback />,
);

export const LazyCostumeForm = withLazyLoading(
  () => import("../components/features/CostumeForm"),
  <DefaultFallback />,
);

export const LazyResultsSection = withLazyLoading(
  () => import("../components/features/ResultsSection"),
  <DefaultFallback />,
);

export const LazyVotingSection = withLazyLoading(
  () => import("../components/features/VotingSection"),
  <DefaultFallback />,
);

/**
 * Lazy load Lottie animations
 */
export const LazyLottie = ({ animationData, ...props }) => {
  const LottieComponent = lazy(() => import("lottie-react"));

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-800 rounded" />}>
      <LottieComponent animationData={animationData} {...props} />
    </Suspense>
  );
};

export default {
  withLazyLoading,
  LazyDashboard,
  LazyAdmin,
  LazyLogin,
  LazyRegister,
  LazyCostumeForm,
  LazyResultsSection,
  LazyVotingSection,
  LazyLottie,
};

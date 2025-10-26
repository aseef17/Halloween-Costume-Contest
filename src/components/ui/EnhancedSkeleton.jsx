import React from "react";
import { motion } from "motion/react";
import { cn } from "../../utils";
import { animationVariants } from "../../utils/animations";

// Enhanced skeleton with shimmer effect
const SkeletonBase = ({ className, ...props }) => (
  <motion.div
    className={cn(
      "bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50",
      "animate-pulse rounded-lg relative overflow-hidden",
      className,
    )}
    {...animationVariants.fadeIn}
    {...props}
  >
    {/* Shimmer effect */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{
        x: ["-100%", "100%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

// Costume card skeleton
export const CostumeCardSkeleton = () => (
  <motion.div
    className="relative overflow-hidden rounded-3xl shadow-2xl border border-orange-500/20 backdrop-blur-xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40"
    {...animationVariants.fadeInUp}
    transition={{ duration: 0.5 }}
  >
    {/* Glass morphism overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

    <div className="p-6 space-y-4">
      {/* Image skeleton */}
      <SkeletonBase className="w-full h-48 sm:h-56 lg:h-64 rounded-lg" />

      {/* Title skeleton */}
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-3/4" />
        <SkeletonBase className="h-4 w-1/2" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>

      {/* Vote count skeleton */}
      <SkeletonBase className="h-12 w-full rounded-xl" />

      {/* Button skeleton */}
      <SkeletonBase className="h-12 w-full rounded-xl" />
    </div>
  </motion.div>
);

// Voting section skeleton
export const VotingSectionSkeleton = () => (
  <motion.div
    className="space-y-6"
    {...animationVariants.fadeInUp}
    transition={{ duration: 0.5 }}
  >
    {/* Header skeleton */}
    <div className="space-y-3">
      <SkeletonBase className="h-8 w-1/3" />
      <SkeletonBase className="h-4 w-2/3" />
    </div>

    {/* Costume cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <CostumeCardSkeleton key={index} />
      ))}
    </div>
  </motion.div>
);

// Form skeleton
export const FormSkeleton = () => (
  <motion.div
    className="space-y-6"
    {...animationVariants.fadeInUp}
    transition={{ duration: 0.5 }}
  >
    {/* Form fields skeleton */}
    <div className="space-y-4">
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-1/4" />
        <SkeletonBase className="h-12 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <SkeletonBase className="h-4 w-1/3" />
        <SkeletonBase className="h-32 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <SkeletonBase className="h-4 w-1/5" />
        <SkeletonBase className="h-12 w-full rounded-lg" />
      </div>
    </div>

    {/* Button skeleton */}
    <div className="flex gap-3">
      <SkeletonBase className="h-12 w-24 rounded-lg" />
      <SkeletonBase className="h-12 w-24 rounded-lg" />
    </div>
  </motion.div>
);

// Admin stats skeleton
export const AdminStatsSkeleton = () => (
  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    {...animationVariants.staggerContainer}
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <motion.div
        key={index}
        className="p-6 rounded-2xl bg-gradient-to-br from-black/60 via-gray-900/60 to-orange-900/40 border border-orange-500/20 backdrop-blur-xl"
        {...animationVariants.staggerItem}
      >
        <div className="space-y-3">
          <SkeletonBase className="h-6 w-1/2" />
          <SkeletonBase className="h-8 w-3/4" />
          <SkeletonBase className="h-4 w-full" />
        </div>
      </motion.div>
    ))}
  </motion.div>
);

// List skeleton
export const ListSkeleton = ({ items = 5 }) => (
  <motion.div
    className="space-y-3"
    {...animationVariants.fadeInUp}
    transition={{ duration: 0.5 }}
  >
    {Array.from({ length: items }).map((_, index) => (
      <motion.div
        key={index}
        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30"
        {...animationVariants.fadeInUp}
        transition={{ delay: index * 0.1 }}
      >
        <SkeletonBase className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </motion.div>
    ))}
  </motion.div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <motion.div
    className="space-y-3"
    {...animationVariants.fadeInUp}
    transition={{ duration: 0.5 }}
  >
    {/* Header skeleton */}
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonBase key={index} className="h-6 w-full" />
      ))}
    </div>

    {/* Rows skeleton */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonBase key={colIndex} className="h-8 w-full" />
        ))}
      </div>
    ))}
  </motion.div>
);

export default {
  CostumeCardSkeleton,
  VotingSectionSkeleton,
  FormSkeleton,
  AdminStatsSkeleton,
  ListSkeleton,
  TableSkeleton,
};

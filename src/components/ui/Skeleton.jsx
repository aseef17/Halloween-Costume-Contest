import React from "react";
import { motion } from "motion/react";

/**
 * Skeleton loader for costume cards
 */
export const CostumeCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
  >
    {/* Image skeleton */}
    <div className="animate-pulse mb-4">
      <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
    </div>
    
    {/* Title skeleton */}
    <div className="animate-pulse mb-3">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
    
    {/* Description skeleton */}
    <div className="animate-pulse mb-4">
      <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
    </div>
    
    {/* Button skeleton */}
    <div className="animate-pulse">
      <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
    </div>
  </motion.div>
);

/**
 * Skeleton loader for admin stats
 */
export const AdminStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
        className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-700 rounded w-3/4"></div>
        </div>
      </motion.div>
    ))}
  </div>
);

/**
 * Skeleton loader for voting section
 */
export const VotingSectionSkeleton = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CostumeCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * Skeleton loader for results section
 */
export const ResultsSectionSkeleton = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
    </div>
    
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

/**
 * Generic skeleton loader
 */
export const Skeleton = ({ 
  className = "", 
  width = "w-full", 
  height = "h-4",
  rounded = "rounded" 
}) => (
  <div 
    className={`animate-pulse bg-gray-700 ${width} ${height} ${rounded} ${className}`}
  />
);

export default {
  CostumeCardSkeleton,
  AdminStatsSkeleton,
  VotingSectionSkeleton,
  ResultsSectionSkeleton,
  Skeleton,
};

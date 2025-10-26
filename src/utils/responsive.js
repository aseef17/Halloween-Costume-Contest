/**
 * Responsive design utilities and breakpoints
 */

// Breakpoint values (matching Tailwind CSS)
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Responsive grid classes
export const gridClasses = {
  // Costume cards grid
  costumeGrid:
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",

  // Admin stats grid
  adminStatsGrid:
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",

  // Button groups
  buttonGroup: "flex flex-col sm:flex-row gap-2 sm:gap-3",

  // Form layouts
  formGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",

  // Header layouts
  headerLayout:
    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
};

// Responsive spacing
export const spacing = {
  // Container padding
  containerPadding: "px-4 sm:px-6 lg:px-8",

  // Section spacing
  sectionSpacing: "mb-6 sm:mb-8 lg:mb-12",

  // Card padding
  cardPadding: "p-4 sm:p-6 lg:p-8",

  // Button padding
  buttonPadding: "px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3",
};

// Responsive typography
export const typography = {
  // Headings
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading",
  h2: "text-xl sm:text-2xl md:text-3xl font-heading",
  h3: "text-lg sm:text-xl md:text-2xl font-heading",

  // Body text
  body: "text-sm sm:text-base",
  bodyLarge: "text-base sm:text-lg",

  // Labels
  label: "text-xs sm:text-sm font-medium",
};

// Responsive visibility utilities
export const visibility = {
  // Show only on mobile
  mobileOnly: "block sm:hidden",

  // Show only on desktop
  desktopOnly: "hidden sm:block",

  // Show only on tablet and up
  tabletUp: "hidden md:block",

  // Show only on large screens
  largeUp: "hidden lg:block",
};

// Responsive image handling
export const imageClasses = {
  // Costume card images
  costumeImage: "w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg",

  // Avatar images
  avatar: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full",

  // Hero images
  hero: "w-full h-64 sm:h-80 lg:h-96 object-cover",
};

// Responsive animation delays
export const animationDelays = {
  stagger: (index) => `delay-${Math.min(index * 100, 500)}`,
  fast: "delay-100",
  medium: "delay-200",
  slow: "delay-300",
};

export default {
  breakpoints,
  gridClasses,
  spacing,
  typography,
  visibility,
  imageClasses,
  animationDelays,
};

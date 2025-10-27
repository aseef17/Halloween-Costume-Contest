// src/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getArrayEnvVar } from "./utils/env.js";
import logger from "./utils/logger";

/**
 * Combines multiple className strings with tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Get user's initials from display name
 */
export function getInitials(name) {
  if (!name) return "??";

  const parts = name.split(" ");
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Check if user is an admin
 */
export function isAdmin(user) {
  if (!user) return false;
  return user.role === "admin" || ADMIN_EMAILS.includes(user.email);
}

// Get admin emails from environment variables
const getAdminEmails = () => {
  const emails = getArrayEnvVar("VITE_ADMIN_EMAILS", []);

  if (emails.length === 0) {
    logger.warn(
      "VITE_ADMIN_EMAILS environment variable is not set or contains no valid email addresses. No admin users will be available."
    );
    return [];
  }

  logger.log(
    `Loaded ${emails.length} admin email(s) from environment variables:`,
    emails
  );
  return emails;
};

export const ADMIN_EMAILS = getAdminEmails();

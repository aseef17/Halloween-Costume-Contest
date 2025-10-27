/**
 * Environment variable utilities
 * Provides validation and type conversion for environment variables
 */

import logger from "./logger";

/**
 * Get a required environment variable
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value
 */
export function getEnvVar(key, defaultValue = null) {
  const value = import.meta.env[key];

  if (!value && defaultValue === null) {
    logger.error(`Required environment variable ${key} is not set`);
    return null;
  }

  return value || defaultValue;
}

/**
 * Get a boolean environment variable
 * @param {string} key - Environment variable key
 * @param {boolean} defaultValue - Default value if not set
 * @returns {boolean} Boolean value
 */
export function getBooleanEnvVar(key, defaultValue = false) {
  const value = import.meta.env[key];

  if (!value) return defaultValue;

  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Get an array from a comma-separated environment variable
 * @param {string} key - Environment variable key
 * @param {string[]} defaultValue - Default value if not set
 * @returns {string[]} Array of values
 */
export function getArrayEnvVar(key, defaultValue = []) {
  const value = import.meta.env[key];

  if (!value) return defaultValue;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Validate Firebase configuration
 * @returns {boolean} True if all required Firebase vars are set
 */
export function validateFirebaseConfig() {
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName],
  );

  if (missingVars.length > 0) {
    logger.error(
      "Missing required Firebase environment variables:",
      missingVars,
    );
    return false;
  }

  return true;
}

/**
 * Get app configuration from environment variables
 * @returns {object} App configuration object
 */
export function getAppConfig() {
  return {
    env: getEnvVar("VITE_APP_ENV", "development"),
    name: getEnvVar("VITE_APP_NAME", "Halloween Costume Contest"),
    debugMode: getBooleanEnvVar("VITE_DEBUG_MODE", false),
    adminEmails: getArrayEnvVar("VITE_ADMIN_EMAILS", []),
    firebase: {
      apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
      authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
      databaseURL: getEnvVar("VITE_FIREBASE_DATABASE_URL"),
      projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
      storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
      appId: getEnvVar("VITE_FIREBASE_APP_ID"),
      measurementId: getEnvVar("VITE_FIREBASE_MEASUREMENT_ID"),
    },
  };
}

/**
 * Log environment configuration (for debugging)
 */
export function logEnvironmentConfig() {
  const config = getAppConfig();

  logger.log("🔧 Environment Configuration");
  logger.log("Environment:", config.env);
  logger.log("App Name:", config.name);
  logger.log("Debug Mode:", config.debugMode);
  logger.log("Admin Emails:", config.adminEmails);
  logger.log("Firebase Project ID:", config.firebase.projectId);
}

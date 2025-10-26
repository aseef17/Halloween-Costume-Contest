import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAppConfig,
  validateFirebaseConfig,
  logEnvironmentConfig,
} from "./utils/env.js";

// Validate Firebase configuration
if (!validateFirebaseConfig()) {
  throw new Error(
    "Firebase configuration is incomplete. Please check your environment variables."
  );
}

// Get app configuration
const appConfig = getAppConfig();

// Log environment config in development
if (appConfig.debugMode) {
  logEnvironmentConfig();
}

const firebaseConfig = {
  apiKey: appConfig.firebase.apiKey,
  authDomain: appConfig.firebase.authDomain,
  databaseURL: appConfig.firebase.databaseURL,
  projectId: appConfig.firebase.projectId,
  storageBucket: appConfig.firebase.storageBucket,
  messagingSenderId: appConfig.firebase.messagingSenderId,
  appId: appConfig.firebase.appId,
  measurementId: appConfig.firebase.measurementId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

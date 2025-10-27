import React, { createContext, useState, useEffect, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { ADMIN_EMAILS } from "../utils";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Context Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    console.log("🔐 AuthContext: Setting up onAuthStateChanged listener");
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("🔐 AuthContext: onAuthStateChanged triggered");
      console.log("🔐 AuthContext: fbUser exists:", !!fbUser);

      if (fbUser) {
        console.log(
          "🔐 AuthContext: fbUser.emailVerified BEFORE reload:",
          fbUser.emailVerified,
        );

        // CRITICAL: Reload user to get latest verification status
        // Firebase doesn't automatically update emailVerified in onAuthStateChanged
        try {
          await fbUser.reload();
          console.log(
            "🔐 AuthContext: fbUser.emailVerified AFTER reload:",
            fbUser.emailVerified,
          );
        } catch (error) {
          console.error("🔐 AuthContext: Error reloading user:", error);
        }

        // Check if user exists in Firestore, if not create profile
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userObj = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || userData.displayName || "",
            role: userData.role || "user",
            emailVerified: fbUser.emailVerified,
            lastLogin: new Date(),
          };
          console.log("🔐 AuthContext: Setting user (existing):", userObj);
          setUser(userObj);
          console.log(
            "🔐 AuthContext: User set, emailVerified:",
            userObj.emailVerified,
          );
          setIsAdmin(
            userData.role === "admin" || ADMIN_EMAILS.includes(fbUser.email),
          );
        } else {
          // Create new user profile
          const newUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "",
            role: "user",
            emailVerified: fbUser.emailVerified,
            createdAt: new Date(),
            lastLogin: new Date(),
          };

          await setDoc(userRef, newUser);
          console.log("🔐 AuthContext: Setting user (new):", newUser);
          setUser(newUser);
          console.log(
            "🔐 AuthContext: New user set, emailVerified:",
            newUser.emailVerified,
          );
          setIsAdmin(ADMIN_EMAILS.includes(fbUser.email));
        }
      } else {
        console.log("🔐 AuthContext: No user, setting user to null");
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      user,
      authLoading,
      isAdmin,
    }),
    [user, authLoading, isAdmin],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

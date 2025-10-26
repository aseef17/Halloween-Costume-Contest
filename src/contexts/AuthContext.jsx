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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Check if user exists in Firestore, if not create profile
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || userData.displayName || "",
            role: userData.role || "user",
            lastLogin: new Date(),
          });
          setIsAdmin(
            userData.role === "admin" || ADMIN_EMAILS.includes(fbUser.email)
          );
        } else {
          // Create new user profile
          const newUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "",
            role: "user",
            createdAt: new Date(),
            lastLogin: new Date(),
          };

          await setDoc(userRef, newUser);
          setUser(newUser);
          setIsAdmin(ADMIN_EMAILS.includes(fbUser.email));
        }
      } else {
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
    [user, authLoading, isAdmin]
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

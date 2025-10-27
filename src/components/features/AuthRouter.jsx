import { useEffect, useState } from "react";
import {
  updateProfile,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  getRedirectResult,
  applyActionCode,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import EmailVerification from "./EmailVerification";
import { useApp } from "../../hooks/useApp";
import { authToasts, halloweenToast } from "../../utils/toastUtils";

const AuthRouter = () => {
  const { user, authLoading, isAdmin } = useApp();
  const [currentView, setCurrentView] = useState("login");
  const [adminView, setAdminView] = useState("admin"); // Toggle between admin panel and dashboard for admin users

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle redirect result and email verification links on component mount
  useEffect(() => {
    const handleAuthActions = async () => {
      console.log("🚀 AuthRouter: handleAuthActions called");
      console.log("🚀 AuthRouter: Current URL:", window.location.href);

      try {
        // Handle Google sign-in redirect
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("🚀 AuthRouter: Google redirect result:", result);
          authToasts.loginSuccess();
        }

        // Handle email verification link
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode");
        const actionCode = urlParams.get("oobCode");

        console.log(
          "🚀 AuthRouter: URL params - mode:",
          mode,
          "oobCode:",
          actionCode,
        );

        if (mode === "verifyEmail" && actionCode) {
          console.log("🚀 AuthRouter: Processing email verification...");
          try {
            await applyActionCode(auth, actionCode);
            console.log("🚀 AuthRouter: Email verification successful");

            // Force reload the current user to get updated verification status
            if (auth.currentUser) {
              console.log(
                "🚀 AuthRouter: Reloading user after verification...",
              );
              await auth.currentUser.reload();
              console.log(
                "🚀 AuthRouter: User reloaded, emailVerified:",
                auth.currentUser.emailVerified,
              );

              // Force a page reload to trigger fresh auth state
              console.log(
                "🚀 AuthRouter: Forcing page reload to update auth state...",
              );
              window.location.reload();
            }
          } catch (error) {
            console.error("🚀 AuthRouter: Email verification failed:", error);
            authToasts.loginError(error);
          }
        }
      } catch (error) {
        console.error("🚀 AuthRouter: Error handling auth actions:", error);
        authToasts.loginError(error);
      }
    };

    handleAuthActions();
  }, []);

  // Update current view based on auth state
  useEffect(() => {
    console.log("🚀 AuthRouter: View update triggered");
    console.log("🚀 AuthRouter: user:", user);
    console.log("🚀 AuthRouter: isAdmin:", isAdmin);

    if (user) {
      console.log("🚀 AuthRouter: user.emailVerified:", user.emailVerified);
      if (!user.emailVerified) {
        console.log("🚀 AuthRouter: Redirecting to email-verification");
        setCurrentView("email-verification");
      } else {
        console.log(
          "🚀 AuthRouter: Redirecting to",
          isAdmin ? "admin" : "dashboard",
        );
        setCurrentView(isAdmin ? "admin" : "dashboard");
      }
    } else {
      console.log("🚀 AuthRouter: No user, redirecting to login");
      setCurrentView("login");
    }
  }, [user, isAdmin]);

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      authToasts.loginSuccess();
    } catch (error) {
      console.error(error);
      authToasts.loginError(error);
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile with displayName
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      authToasts.registerError(error);
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { GoogleAuthProvider, signInWithRedirect } = await import(
        "firebase/auth"
      );
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error(error);
      halloweenToast.error(
        "Sign-in Failed - Google sign-in failed. Please try again.",
      );
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-orange-300 text-xl">Haunting the login...</p>
      </div>
    );
  }

  // Email verification view
  if (user && !user.emailVerified) {
    return <EmailVerification userEmail={user.email} />;
  }

  // Not authenticated views
  if (!user) {
    return currentView === "login" ? (
      <Login
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isLoading={isLoading}
        handleLogin={handleLogin}
        handleGoogleSignIn={handleGoogleSignIn}
        switchToRegister={() => setCurrentView("register")}
        error={error}
      />
    ) : (
      <Register
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isLoading={isLoading}
        handleRegister={handleRegister}
        handleGoogleSignIn={handleGoogleSignIn}
        switchToLogin={() => setCurrentView("login")}
        error={error}
      />
    );
  }

  // Authenticated routes
  if (isAdmin) {
    return adminView === "admin" ? (
      <Admin onSwitchToDashboard={() => setAdminView("dashboard")} />
    ) : (
      <Dashboard onSwitchToAdmin={() => setAdminView("admin")} isAdmin={true} />
    );
  }

  return <Dashboard />;
};

export default AuthRouter;

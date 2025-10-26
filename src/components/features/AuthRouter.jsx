import { useEffect, useState } from "react";
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
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

  // Update current view based on auth state
  useEffect(() => {
    if (user) {
      setCurrentView(isAdmin ? "admin" : "dashboard");
    } else {
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
      const { GoogleAuthProvider, signInWithPopup } = await import(
        "firebase/auth"
      );
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);

      // Handle specific error cases with toast notifications
      if (error.code === "auth/popup-closed-by-user") {
        halloweenToast.error(
          "Login Cancelled - You closed the Google sign-in popup. Please try again.",
        );
      } else if (error.code === "auth/cancelled-popup-request") {
        halloweenToast.info("Login Cancelled - Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        halloweenToast.error(
          "Popup Blocked - Please allow popups for this site and try again.",
        );
      } else {
        halloweenToast.error(
          "Sign-in Failed - Google sign-in failed. Please try again.",
        );
        setError("Google sign-in failed. Please try again.");
      }
    }
    setIsLoading(false);
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

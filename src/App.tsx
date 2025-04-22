import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { Features } from "./pages/Features";
import { About } from "./pages/About";
import { UserProfile } from "./pages/UserProfile";
import { Dashboard } from "./pages/Dashboard";
import { AuthService, User } from "./services/auth";
import Navbar from "./components/Navbar";
import { GmailAuth } from "./pages/GmailAuth";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    AuthService.getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));

    // Listen for auth state changes
    const { data: authListener } = AuthService.onAuthStateChange(setUser);
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await AuthService.signOut();
    if (!error) {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#1a1a1a]">
        <Navbar user={user} onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route
            path="/user"
            element={
              user ? (
                <UserProfile user={user} />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route
            path="/signin"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <SignIn onSuccess={setUser} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <SignUp onSuccess={setUser} />
              )
            }
          />
          <Route path="/dashboard/auth" element={<GmailAuth />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

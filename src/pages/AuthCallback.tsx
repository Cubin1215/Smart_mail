import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the authorization code from URL
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");

        if (!code) {
          setError("No authorization code was received");
          setIsProcessing(false);
          return;
        }

        // Process the authorization code
        const success = await handleAuthCallback(code);

        if (success) {
          // Redirect to dashboard on success
          navigate("/dashboard");
        } else {
          setError("Failed to authenticate with Google");
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError("An unexpected error occurred during authentication");
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [location, handleAuthCallback, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Processing Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we complete your sign-in...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">
            We were unable to complete the authentication process.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const GmailAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGmailAuth = () => {
    setIsAuthenticating(true);
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/gmail`;
  };

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
        <div className="text-center bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm bg-opacity-80 max-w-lg w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Connecting to Gmail...
          </h2>
          <p className="text-gray-300 text-sm">
            You will be redirected to Google's authentication page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
      <div className="text-center bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm bg-opacity-80 max-w-lg w-full mx-4">
        <h2 className="text-3xl font-bold text-white mb-4">
          Gmail Authentication Required
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          To access your emails and use the smart reply feature, please
          authenticate with your Gmail account.
        </p>
        <button
          onClick={handleGmailAuth}
          className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg w-full sm:w-auto">
          Connect Gmail Account
        </button>
      </div>
    </div>
  );
};

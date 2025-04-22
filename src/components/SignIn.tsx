import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthService, User } from "../services/auth";

interface SignInProps {
  onSuccess: (user: User) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, error } = await AuthService.signIn(formData);

      if (error) {
        setError(error.message);
        return;
      }

      if (user) {
        onSuccess(user);
      } else {
        setError("Sign in failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#2a2a2a]/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <div>
          <div className="flex justify-center">
            <img
              className="h-12 w-auto"
              src="/src/assets/logo.png"
              alt="ReplyFlow Logo"
            />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
            Welcome back
          </h2>
          <p className="mt-4 text-center text-lg text-gray-300">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

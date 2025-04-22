import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthService } from "../services/auth";

interface SignUpProps {
  onSuccess: (user: any) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    profession: "",
    jobDescription: "",
    emailSignature: "Best regards",
    customSignature: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useCustomSignature, setUseCustomSignature] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
      const finalSignature = useCustomSignature
        ? formData.customSignature
        : formData.emailSignature;
      const { user, error } = await AuthService.signUp({
        ...formData,
        emailSignature: finalSignature,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (user) {
        onSuccess(user);
      } else {
        setError(
          "Sign up successful but no user data received. Please check your email for verification."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-[#2a2a2a]/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
            Create your account
          </h2>
          <p className="mt-4 text-center text-lg text-gray-300">
            Or{" "}
            <Link
              to="/signin"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-gray-300 mb-2">
                Profession
              </label>
              <input
                id="profession"
                name="profession"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                placeholder="Your Profession (e.g., Software Engineer, Marketing Manager)"
                value={formData.profession}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium text-gray-300 mb-2">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                required
                rows={4}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                placeholder="Tell us about your job and responsibilities"
                value={formData.jobDescription}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Signature
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="preset"
                    name="signatureType"
                    checked={!useCustomSignature}
                    onChange={() => setUseCustomSignature(false)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700"
                  />
                  <label htmlFor="preset" className="text-gray-300">
                    Choose from presets
                  </label>
                </div>
                {!useCustomSignature && (
                  <select
                    id="emailSignature"
                    name="emailSignature"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                    value={formData.emailSignature}
                    onChange={handleChange}>
                    <option value="Best regards">Best regards</option>
                    <option value="Sincerely">Sincerely</option>
                    <option value="Best">Best</option>
                    <option value="Kind regards">Kind regards</option>
                    <option value="Regards">Regards</option>
                    <option value="Thanks">Thanks</option>
                    <option value="Cheers">Cheers</option>
                    <option value="Best wishes">Best wishes</option>
                    <option value="Warm regards">Warm regards</option>
                    <option value="Yours sincerely">Yours sincerely</option>
                    <option value="Yours truly">Yours truly</option>
                    <option value="Cordially">Cordially</option>
                    <option value="Respectfully">Respectfully</option>
                    <option value="Faithfully">Faithfully</option>
                  </select>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="custom"
                    name="signatureType"
                    checked={useCustomSignature}
                    onChange={() => setUseCustomSignature(true)}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700"
                  />
                  <label htmlFor="custom" className="text-gray-300">
                    Use custom signature
                  </label>
                </div>
                {useCustomSignature && (
                  <input
                    type="text"
                    id="customSignature"
                    name="customSignature"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base bg-[#2a2a2a]"
                    placeholder="Enter your custom email signature"
                    value={formData.customSignature}
                    onChange={handleChange}
                  />
                )}
              </div>
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

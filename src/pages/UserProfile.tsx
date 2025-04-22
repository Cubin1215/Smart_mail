import React, { useState } from "react";
import { User, AuthService } from "../services/auth";

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.user_metadata?.name || "");
  const [profession, setProfession] = useState(
    user.user_metadata?.profession || ""
  );
  const [emailSignature, setEmailSignature] = useState(
    user.user_metadata?.emailSignature || ""
  );
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await AuthService.updateProfile({
        name,
        profession,
        jobDescription: user.user_metadata?.jobDescription || "",
        emailSignature,
      });

      if (error) throw error;
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    try {
      const { error } = await AuthService.updatePassword(newPassword);
      if (error) throw error;
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              User Profile
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-pink-500 rounded-md text-white hover:opacity-90 transition-opacity">
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className="mb-4 p-4 rounded-md bg-white/5 border border-white/10 text-white">
              {message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8">
            <div>
              <label className="block text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] text-white/80 border border-white/10"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] text-white border border-white/10 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Profession</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] text-white border border-white/10 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">
                Email Signature
              </label>
              <textarea
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] text-white border border-white/10 focus:border-blue-500 transition-colors"
              />
            </div>

            {isEditing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-pink-500 rounded-md text-white hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-md text-white/80 hover:border-white/40 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </form>

          <div className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-white/80 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] text-white border border-white/10 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#1a1a1a] text-white border border-white/10 focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-pink-500 rounded-md text-white hover:opacity-90 transition-opacity">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

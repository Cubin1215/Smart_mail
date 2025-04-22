import React from "react";
import { User } from "../services/auth";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Mail,
  Bell,
  Shield,
  Clock,
  Zap,
  BarChart,
} from "lucide-react";

interface UserProfileProps {
  user: User | null;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    navigate("/signin");
    return null;
  }

  const stats = [
    { label: "Emails Sent", value: "147", change: "+12.5%" },
    { label: "Response Rate", value: "94%", change: "+3.2%" },
    { label: "Time Saved", value: "23hrs", change: "+5.4%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header with Stats */}
        <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-pink-500 rounded-full p-1">
                <div className="bg-[#1a1a1a] rounded-full p-4">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                    {user.user_metadata?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white mb-2">
                  {user.user_metadata?.name || "User"}
                </h1>
                <p className="text-white/60">{user.email}</p>
                <p className="text-white/40 text-sm mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                  <p className="text-xs text-green-400">{stat.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Professional Profile */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <Settings className="w-5 h-5 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Professional Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm">Profession</label>
                <p className="text-white mt-1">
                  {user.user_metadata?.profession || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Job Description</label>
                <p className="text-white mt-1">
                  {user.user_metadata?.jobDescription || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Industry</label>
                <p className="text-white mt-1">
                  {user.user_metadata?.industry || "Technology"}
                </p>
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <Mail className="w-5 h-5 text-pink-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Email Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm">Email Signature</label>
                <p className="text-white mt-1">
                  {user.user_metadata?.emailSignature || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-white/60 text-sm">Reply Templates</label>
                <p className="text-white mt-1">3 Custom Templates</p>
              </div>
              <div>
                <label className="text-white/60 text-sm">
                  AI Assistant Level
                </label>
                <p className="text-white mt-1">Professional</p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <Bell className="w-5 h-5 text-purple-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Email Alerts</span>
                <div className="w-12 h-6 bg-green-500/20 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Weekly Reports</span>
                <div className="w-12 h-6 bg-green-500/20 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Activity Overview */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <BarChart className="w-5 h-5 text-yellow-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Activity Overview
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Emails Processed</span>
                <span className="text-white">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">AI Suggestions Used</span>
                <span className="text-white">789</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Templates Created</span>
                <span className="text-white">12</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <Zap className="w-5 h-5 text-orange-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-500/10 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors duration-200">
                Create Template
              </button>
              <button className="p-4 bg-pink-500/10 rounded-xl text-pink-400 hover:bg-pink-500/20 transition-colors duration-200">
                View Analytics
              </button>
              <button className="p-4 bg-purple-500/10 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors duration-200">
                Manage Settings
              </button>
              <button className="p-4 bg-orange-500/10 rounded-xl text-orange-400 hover:bg-orange-500/20 transition-colors duration-200">
                Get Help
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-end">
          <button className="px-6 py-3 rounded-lg text-white/80 border border-white/20 hover:border-white/40 transition-colors duration-200">
            Export Data
          </button>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 text-white hover:opacity-90 transition-opacity duration-200">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "AI-Powered Responses",
    description:
      "Our advanced AI analyzes your emails and generates contextually appropriate responses that match your professional tone and style.",
    icon: "🤖",
  },
  {
    title: "Smart Email Templates",
    description:
      "Create and customize email templates that automatically adapt to different contexts and recipients.",
    icon: "📝",
  },
  {
    title: "Professional Tone Matching",
    description:
      "Automatically detect and maintain your preferred communication style across all email responses.",
    icon: "🎯",
  },
  {
    title: "Multi-language Support",
    description:
      "Seamlessly communicate in multiple languages with automatic translation and cultural context awareness.",
    icon: "🌍",
  },
  {
    title: "Time-saving Automation",
    description:
      "Reduce email response time by up to 80% with smart suggestions and one-click responses.",
    icon: "⚡",
  },
  {
    title: "Personalized Learning",
    description:
      "The AI learns from your communication style and preferences to provide increasingly accurate suggestions.",
    icon: "📚",
  },
];

export const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 sm:text-5xl">
            Powerful Features
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Everything you need to streamline your email communication
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group bg-[#2a2a2a]/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

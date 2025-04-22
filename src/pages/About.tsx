import React from "react";
import { Link } from "react-router-dom";

const team = [
  {
    name: "AI Assistant",
    role: "Your Personal Email Companion",
    description:
      "Powered by advanced language models to understand and respond to your emails naturally.",
    icon: "🤖",
  },
  {
    name: "Smart Templates",
    role: "Professional Email Templates",
    description:
      "Pre-designed templates that adapt to different situations and maintain your professional tone.",
    icon: "📝",
  },
  {
    name: "Language Support",
    role: "Multi-language Capabilities",
    description:
      "Communicate seamlessly in multiple languages with automatic translation and cultural awareness.",
    icon: "🌍",
  },
];

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 sm:text-5xl">
            About ReplyFlow
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            We're revolutionizing email communication by combining artificial
            intelligence with human expertise to create a smarter, more
            efficient way to manage your inbox.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            At ReplyFlow, we believe that email communication should be
            efficient, professional, and stress-free. Our mission is to empower
            professionals to focus on what matters most by automating the
            routine aspects of email management while maintaining the personal
            touch that makes communication meaningful.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300">
                <div className="text-4xl mb-4">{member.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-400 mb-2">{member.role}</p>
                <p className="text-gray-300">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Innovation
              </h3>
              <p className="text-gray-300">
                We constantly push the boundaries of what's possible with AI to
                create better solutions for our users.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Privacy</h3>
              <p className="text-gray-300">
                Your data security is our top priority. We use industry-standard
                encryption and never share your information.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Efficiency
              </h3>
              <p className="text-gray-300">
                We help you save time and energy by automating routine tasks
                while maintaining quality.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Personalization
              </h3>
              <p className="text-gray-300">
                Our AI learns from your communication style to provide
                increasingly personalized assistance.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Email Experience?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already using ReplyFlow to
            manage their email communication more efficiently.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

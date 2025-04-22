import * as React from "react";
import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";

const LandingPage = () => {
  // Handle button click
  const handleStartClick = () => {
    console.log("Start button clicked");
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            Email Automatic Responders{" "}
            <span className="bg-gradient-to-r from-blue-500 to-pink-500 text-transparent bg-clip-text">
              for everyone
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
            Handle your emails automatically with our advanced AI assistant! Get
            started today and save precious time!
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={handleStartClick}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Start for as low as $200
            </button>
            <button className="px-8 py-3 border border-gray-600 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Documentation
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Responses",
              description:
                "Smart email replies crafted by advanced AI technology",
            },
            {
              title: "Time Saving",
              description: "Reduce email response time by up to 80%",
            },
            {
              title: "Customizable Templates",
              description: "Create and save your own response templates",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-[#2a2a2a] rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Video Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-video bg-[#2a2a2a] rounded-lg border border-blue-500 shadow-lg shadow-blue-500/20 overflow-hidden">
            <video
              className="w-full h-full object-cover"
              controls
              src={video1}
            />
          </div>
          <div className="aspect-video bg-[#2a2a2a] rounded-lg border border-pink-500 shadow-lg shadow-pink-500/20 overflow-hidden">
            <video
              className="w-full h-full object-cover"
              controls
              src={video2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

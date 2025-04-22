import React from "react";

interface GradientMailIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const GradientMailIcon: React.FC<GradientMailIconProps> = ({
  className = "",
  width = 24,
  height = 24,
}) => {
  // Unique ID for the gradient
  const gradientId = "mailIconGradient";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#${gradientId})"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      {/* Define the gradient */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* purple-500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
        </linearGradient>
      </defs>

      {/* Envelope shape */}
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
};

// Logo variant with both icon and text
export const GradientMailLogo: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <GradientMailIcon width={32} height={32} />
      <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        Replied.com
      </span>
    </div>
  );
};

export default GradientMailIcon;

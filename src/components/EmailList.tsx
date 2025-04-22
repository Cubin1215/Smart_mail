import React from "react";
import { Email } from "../types/email";

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  loading: boolean;
  error: string | null;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmail,
  onSelectEmail,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 p-4">
        No unread emails
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-700">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`p-4 cursor-pointer transition-colors duration-150 ${
            selectedEmail?.id === email.id
              ? "bg-gradient-to-r from-blue-600/20 to-pink-600/20"
              : "hover:bg-gray-800"
          }`}
          onClick={() => onSelectEmail(email)}>
          <div className="flex items-start space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {email.from}
              </p>
              <p className="text-sm text-gray-400 truncate">{email.subject}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {email.snippet}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {email.date
                ? new Date(Number(email.date)).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No date"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

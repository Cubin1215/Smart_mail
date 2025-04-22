import React from "react";
import { Email } from "../types/email";

interface EmailDetailProps {
  email: Email;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
  return (
    <div className="p-6 border-b border-gray-700 overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{email.subject}</h2>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-gray-300">
                From: <span className="text-white">{email.from}</span>
              </p>
              <p className="text-gray-300">
                To: <span className="text-white">{email.to}</span>
              </p>
            </div>
            <div className="text-gray-400">
              {email.date
                ? new Date(Number(email.date)).toLocaleString(undefined, {
                    weekday: "short",
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

        <div className="border-t border-gray-700 pt-4">
          <div
            className="prose prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: email.body || email.snippet }}
          />
        </div>
      </div>
    </div>
  );
};

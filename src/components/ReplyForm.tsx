import React, { useState } from "react";
import { Email } from "../types/email";

interface ReplyFormProps {
  email: Email;
  onGenerateReply: () => void;
  onSendReply: (reply: string) => void;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  email,
  onGenerateReply,
  onSendReply,
}) => {
  const [replyText, setReplyText] = useState(email.generated_reply || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGenerateReply = async () => {
    setIsGenerating(true);
    await onGenerateReply();
    setIsGenerating(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    await onSendReply(replyText);
    setIsSending(false);
    setReplyText("");
  };

  return (
    <div className="p-6 bg-gray-900 bg-opacity-80">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Reply to {email.from}
          </h3>
          <button
            onClick={handleGenerateReply}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Smart Reply"
            )}
          </button>
        </div>

        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply here..."
          className="w-full h-40 px-4 py-3 text-gray-300 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSendReply}
            disabled={isSending || !replyText.trim()}
            className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </div>
            ) : (
              "Send Reply"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

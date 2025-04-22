import React, { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { EmailList } from "../components/EmailList";
import { EmailDetail } from "../components/EmailDetail";
import { ReplyForm } from "../components/ReplyForm";
import { Email } from "../types/email";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkGmailAuth();
  }, []);

  const checkGmailAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email/check-auth`
      );
      const data = await response.json();

      if (!data.success || !data.authenticated) {
        console.log(
          "Gmail authentication required, redirecting to auth page..."
        );
        navigate("/dashboard/auth");
        return;
      }

      // Only fetch emails if we're authenticated
      await fetchUnreadEmails();
    } catch (err) {
      console.error("Auth check error:", err);
      setError("Unable to check Gmail authentication status");
      navigate("/dashboard/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadEmails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email/unread`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }
      const data = await response.json();
      if (data.success) {
        setEmails(data.messages || []);
      } else {
        setError(data.error || "Failed to fetch emails");
      }
    } catch (err) {
      setError("Failed to fetch emails");
      console.error("Fetch error:", err);
    }
  };

  const generateReply = async (email: Email) => {
    try {
      setLoading(true);  // Add loading state while generating reply
  
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email/generate-reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailId: email.id,
            userContext: user.user_metadata?.profession || "",
            userName: user.user_metadata?.name || "User",
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to generate reply");
      }
  
      const data = await response.json();
      if (data.success) {
        console.log("Generated reply:", data.reply);
  
        // Create a new array with the updated email
        const updatedEmails = emails.map((e) =>
          e.id === email.id ? { ...e, generated_reply: data.reply } : e
        );
  
        // Set the state with the new array
        setEmails(updatedEmails);
  
        // Update selectedEmail with a new object reference
        if (selectedEmail?.id === email.id) {
          setSelectedEmail({ ...email, generated_reply: data.reply });
        }
      } else {
        setError(data.error || "Failed to generate reply");
      }
    } catch (err) {
      setError("Failed to generate reply");
      console.error("Generate reply error:", err);
    } finally {
      setLoading(false);  // Reset loading state
    }
  }
  

  const sendReply = async (email: Email, reply: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/email/send-reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailId: email.id,
            replyText: reply,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      const data = await response.json();
      if (data.success) {
        await fetchUnreadEmails(); // Refresh the email list
      } else {
        setError(data.error || "Failed to send reply");
      }
    } catch (err) {
      setError("Failed to send reply");
      console.error("Send reply error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="text-center bg-gray-900/90 p-8 rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">
            Loading your emails...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="text-center bg-gray-900/90 p-8 rounded-lg shadow-xl border border-gray-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={checkGmailAuth}
            className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-pink-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#121212]">
      {/* Sidebar with dark background */}
      <div className="w-1/3 border-r border-gray-700/50 overflow-y-auto bg-gray-900/50">
        <div className="p-4 bg-gradient-to-r from-blue-600/10 to-pink-600/10 border-b border-gray-700/50">
          <h1 className="text-xl font-bold text-white">Inbox</h1>
        </div>
        <EmailList
          emails={emails}
          selectedEmail={selectedEmail}
          onSelectEmail={setSelectedEmail}
          loading={loading}
          error={error}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-900/50">
        {selectedEmail ? (
          <>
            <div className="border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-pink-600/10">
              <EmailDetail email={selectedEmail} />
            </div>
            <div className="bg-gray-900/75">
              <ReplyForm
                email={selectedEmail}
                onGenerateReply={() => generateReply(selectedEmail)}
                onSendReply={(reply: string) => sendReply(selectedEmail, reply)}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <div className="text-center">
              <p className="text-xl">Select an email to view details</p>
              <p className="text-sm text-gray-400 mt-2">
                Your unread emails will appear in the sidebar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

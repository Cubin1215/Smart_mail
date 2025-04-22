import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import axios from "axios";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { type: "user" | "bot"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Using what's available in your AuthProvider
  const { isAuthenticated, token } = useAuth();

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", content: input }]);

    // Clear input field immediately for better UX
    const userQuery = input;
    setInput("");

    // Set loading state
    setIsLoading(true);

    try {
      // Make actual API call to your backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/generate-reply`,
        {
          user_context: userQuery,
          email_id: "context", // You might need to adjust this depending on your use case
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // Add bot response from API
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: response.data.suggestion,
        },
      ]);
    } catch (error) {
      console.error("Error getting reply:", error);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            "Sorry, I'm having trouble connecting to the server. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#2a2a2a] rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-pink-500 rounded-t-lg">
            <h3 className="font-semibold">Replied Assistant</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                How can I help with your emails today?
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-blue-500 to-pink-500"
                      : "bg-[#3a3a3a]"
                  }`}>
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-[#3a3a3a]">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-[#3a3a3a] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className={`p-2 rounded-lg ${
                  isLoading
                    ? "bg-gray-600"
                    : "bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-90"
                }`}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

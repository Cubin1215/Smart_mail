import React, { useState } from "react";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
}

const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"faq" | "guide" | "contact">(
    "faq"
  );
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does Replied.com work?",
      answer:
        "Replied.com connects to your Gmail account and uses advanced AI to analyze your incoming emails. When you select emails for response, our AI generates personalized replies based on the content of the original email and your profile information. You can review and edit these suggestions before sending.",
    },
    {
      question: "Is my email data secure?",
      answer:
        "Yes, your data security is our top priority. We use OAuth 2.0 for authentication, which means we never see or store your Gmail password. All email content is processed securely, and we do not store the content of your emails beyond what's needed to generate responses.",
    },
    {
      question: "Can I customize the AI-generated responses?",
      answer:
        "Absolutely! After the AI generates a response, you can review and edit it before sending. You can also set up your profile with specific information about your role and communication style to help the AI better match your voice.",
    },
    {
      question: "What email providers do you support?",
      answer:
        "Currently, Replied.com supports Gmail and Google Workspace accounts. We're working on adding support for other email providers in the future.",
    },
    {
      question: "How do I revoke access to my Gmail account?",
      answer:
        'You can revoke Replied.com\'s access at any time by visiting your Google Account settings, going to Security, and then "Third-party apps with account access." You can also log out directly from our application in the Settings page.',
    },
    {
      question: "Is there a limit to how many emails I can process?",
      answer:
        "The free tier allows you to generate responses for up to 20 emails per month. For unlimited email responses, check out our premium plans.",
    },
  ];

  const toggleFAQ = (index: number) => {
    if (expandedFAQ === index) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(index);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Help Center</h1>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "faq"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("faq")}>
            Frequently Asked Questions
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "guide"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("guide")}>
            User Guide
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              activeTab === "contact"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("contact")}>
            Contact Support
          </button>
        </div>

        {/* FAQ Content */}
        {activeTab === "faq" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="flex justify-between items-center w-full px-4 py-3 bg-white text-left"
                    onClick={() => toggleFAQ(index)}>
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transform ${
                        expandedFAQ === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Guide Content */}
        {activeTab === "guide" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">User Guide</h2>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Getting Started
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>
                    Sign in with your Google account on the{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                      login page
                    </Link>
                    .
                  </li>
                  <li>
                    Grant Replied.com permission to access your Gmail account.
                  </li>
                  <li>
                    Complete your profile information in the{" "}
                    <Link
                      to="/settings"
                      className="text-blue-600 hover:underline">
                      settings page
                    </Link>
                    .
                  </li>
                  <li>
                    Navigate to the{" "}
                    <Link
                      to="/dashboard"
                      className="text-blue-600 hover:underline">
                      dashboard
                    </Link>{" "}
                    to start managing your emails.
                  </li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Managing Emails
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>On the dashboard, you'll see your unread emails.</li>
                  <li>Select one or more emails that need responses.</li>
                  <li>
                    Click "Generate Replies" to have the AI create response
                    drafts.
                  </li>
                  <li>Review and edit the suggested responses as needed.</li>
                  <li>Click "Send" when you're satisfied with a response.</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Using the Chat Assistant
                </h3>
                <p className="text-gray-700 mb-2">
                  The chat assistant can help you with general questions about
                  using Replied.com. Here's how to use it:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Find the chat window on the dashboard.</li>
                  <li>Type your question or command.</li>
                  <li>
                    The assistant will provide guidance or perform actions based
                    on your input.
                  </li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Customizing Your Experience
                </h3>
                <p className="text-gray-700 mb-2">
                  To make the AI-generated responses sound more like you:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>
                    Visit the{" "}
                    <Link
                      to="/settings"
                      className="text-blue-600 hover:underline">
                      settings page
                    </Link>
                    .
                  </li>
                  <li>
                    Fill out your profile details, including your professional
                    role and communication style.
                  </li>
                  <li>Customize your email signature.</li>
                  <li>
                    Adjust your auto-respond preferences and notification
                    settings.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Contact Support Content */}
        {activeTab === "contact" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 mb-6">
                Need more help? Our support team is here for you. Fill out the
                form below and we'll get back to you as soon as possible.
              </p>

              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Submit
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Other ways to reach us
                </h3>
                <div className="flex flex-col space-y-2">
                  <a
                    href="mailto:support@replied.com"
                    className="text-blue-600 hover:underline">
                    support@replied.com
                  </a>
                  <p className="text-gray-700">Phone: (555) 123-4567</p>
                  <p className="text-gray-700">
                    Hours: Monday - Friday, 9am - 5pm EST
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;

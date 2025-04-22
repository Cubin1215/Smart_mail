import React, { useState, useEffect } from "react";
import axios from "axios";

interface UserProfile {
  name: string;
  salutation: string;
  profession: string;
  about: string;
  emailSignature: string;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    salutation: "",
    profession: "",
    about: "",
    emailSignature: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/profile");
        setProfile({
          ...response.data,
          emailSignature:
            response.data.emailSignature ||
            `Best regards,\n${response.data.name}`,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setErrorMessage("Failed to load your profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setSaveStatus("idle");

      await axios.post("/api/profile/update", profile);

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("error");
      setErrorMessage("Failed to save your profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        {saveStatus === "success" && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            Your settings have been saved successfully.
          </div>
        )}

        {saveStatus === "error" && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errorMessage || "An error occurred while saving your settings."}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="salutation"
                className="block text-sm font-medium text-gray-700 mb-1">
                Salutation (e.g., Mr., Ms., Dr.)
              </label>
              <input
                type="text"
                id="salutation"
                name="salutation"
                value={profile.salutation}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-gray-700 mb-1">
                Profession
              </label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={profile.profession}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-1">
                About You
              </label>
              <textarea
                id="about"
                name="about"
                value={profile.about}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brief description of your role or what you're currently working on"
              />
            </div>

            <div>
              <label
                htmlFor="emailSignature"
                className="block text-sm font-medium text-gray-700 mb-1">
                Email Signature
              </label>
              <textarea
                id="emailSignature"
                name="emailSignature"
                value={profile.emailSignature}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your email signature"
              />
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">
                Email Response Preferences
              </h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="autoRespond"
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="autoRespond"
                    className="ml-2 text-sm text-gray-700">
                    Auto-respond to urgent emails
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifyResponses"
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="notifyResponses"
                    className="ml-2 text-sm text-gray-700">
                    Notify me when AI sends responses
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSaving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

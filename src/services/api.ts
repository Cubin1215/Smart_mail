import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: () => api.post("/api/auth/login"),
  signIn: (email: string, password: string) =>
    api.post("/api/auth/signin", { email, password }),
  checkStatus: () => api.get("/api/auth/status"),
  handleCallback: (code: string) => api.post("/api/auth/callback", { code }),
};

export const emailAPI = {
  fetchUnread: () => api.get("/api/email/unread"),
  generateReply: (emailId: string, userContext: string) =>
    api.post("/generate-reply", {
      email_id: emailId,
      user_context: userContext,
    }),
  sendReply: (emailId: string, replyText: string, to: string, cc?: string) =>
    api.post("/send-reply", {
      email_id: emailId,
      reply_text: replyText,
      to_field: to,
      cc_field: cc,
    }),
};

export default api;

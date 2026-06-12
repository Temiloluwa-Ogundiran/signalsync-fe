import axios from "axios";

const API_BASE_URL = typeof window !== "undefined"
  ? "/api/proxy"
  : (
      process.env.AUTH_BACKEND_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")
    ).replace(/\/$/, "");

if (!API_BASE_URL) {
  throw new Error(
    "Backend URL is not configured. Set BACKEND_URL or AUTH_BACKEND_URL."
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  // TODO: Read JWT from NextAuth session or cookie
  // const token = getToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 / refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle token refresh or redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

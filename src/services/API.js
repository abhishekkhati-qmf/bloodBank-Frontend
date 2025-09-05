import axios from "axios";
import { toast } from "react-hot-toast";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor to handle blocked users
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.accountBlocked) {
      // User is blocked, show toast and logout immediately
      toast.error("Your account has been blocked by the administrator. You are being logged out.");
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000); // Give time for toast to be seen
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default API;

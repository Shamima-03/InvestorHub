import axios from "axios";
import { io } from "socket.io-client";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io("/", { auth: { token }, transports: ["websocket", "polling"] });
  return socket;
};

export const getSocket = () => socket;

export default API;

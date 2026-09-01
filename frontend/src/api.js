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
let socketToken = null;

export const connectSocket = (token) => {
  // Reuse only a socket opened with the SAME token. The server stamps the
  // user's identity once at handshake, so a stale socket from a previous
  // login would send every message as the old user (and misalign the chat).
  if (socket && socketToken === token && socket.connected) return socket;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  socketToken = token;
  socket = io("/", { auth: { token }, transports: ["websocket", "polling"] });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
};

export const getSocket = () => socket;

export default API;

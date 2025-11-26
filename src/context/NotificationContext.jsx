// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) return;

    // Connect to Socket.IO using environment-driven base
    const SOCKET_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/,'');
    const sock = io(SOCKET_BASE, { transports: ["websocket", "polling"] });

    sock.on("connect", () => {
      sock.emit("join", user.id);
    });

    // Increment unread count on new notification
    sock.on("notification", () => setUnreadCount((prev) => prev + 1));

    // Fetch initial unread count
    (async () => {
      try {
        const res = await api.get(`/notifications/${user.id}`);
        const data = res.data || [];
        const count = data.filter(n => !n.is_read && !n.is_archived && !n.is_deleted).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    })();

    return () => sock.disconnect();
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

// InboxPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const API_BASE = "http://localhost:3000";

export default function InboxPage() {
  const userId = localStorage.getItem("userId"); // logged-in user
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // 1. Fetch all groups for this user
    const fetchUserGroups = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/groups/user/${userId}`);
        if (res.data.success) {
          setGroups(res.data.groups || []);
          return res.data.groups || [];
        }
        return [];
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        return [];
      }
    };

    // 2. Fetch messages for each group
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const userGroups = await fetchUserGroups();
        let allMessages = [];

        for (const g of userGroups) {
          const res = await axios.get(`${API_BASE}/api/groups/${g.id}/messages`);
          if (res.data.success && res.data.messages) {
            const groupMessages = res.data.messages.map((m) => ({
              ...m,
              groupName: g.group_name,
            }));
            allMessages = [...allMessages, ...groupMessages];
          }
        }

        // sort messages by time descending
        allMessages.sort((a, b) => new Date(b.time) - new Date(a.time));
        setMessages(allMessages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Optional: refresh every 15 seconds
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-maroon mb-4">Inbox</h1>
      {loading ? (
        <p className="text-gray-600">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:bg-gray-50"
            >
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{msg.sender}</span> sent a message to{" "}
                <span className="font-semibold">{msg.groupName}</span>:
              </p>
              {msg.text && <p className="mt-1 text-gray-800">{msg.text}</p>}
              {msg.file_link && (
                <a
                  href={msg.file_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm mt-1 block"
                >
                  View attachment
                </a>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {moment(msg.time).format("ddd, MMM D, YYYY h:mm A")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

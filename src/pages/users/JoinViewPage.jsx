import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  UsersIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  DocumentTextIcon as DocIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

const socket = io("http://localhost:5000", { transports: ["websocket", "polling"] });

export default function JoinViewPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = currentUser?.id ? parseInt(currentUser.id) : null;
  const userName = currentUser?.username || "You";

  const [group, setGroup] = useState(null);
  const [userStatus, setUserStatus] = useState("loading"); // loading | none | pending | approved
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef(null);

  // Load group + membership status
  useEffect(() => {
    const loadGroupAndStatus = async () => {
      if (!userId || !groupId) return;

      try {
        // 1. Load group
        const allRes = await axios.get("http://localhost:5000/api/group/all");
        const foundGroup = allRes.data.data.find(g => g.id === parseInt(groupId));
        if (!foundGroup) {
          alert("Group not found");
          navigate("/dashboard");
          return;
        }
        setGroup(foundGroup);

        // 2. Check membership status from group_members table
        const memberRes = await axios.get(`http://localhost:5000/api/group/member-status/${groupId}/${userId}`);
        const status = memberRes.data.status || "none";
        setUserStatus(status);

        // 3. Load chat & events only if approved or creator
        if (status === "approved" || foundGroup.created_by === userId) {
          const [msgRes, eventRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/messages/${groupId}/messages`).catch(() => ({ data: { messages: [] } })),
            axios.get(`http://localhost:5000/api/calendar/group/${groupId}`).catch(() => ({ data: { schedules: [] } }))
          ]);

          setMessages(msgRes.data.messages || []);
          setEvents((eventRes.data.schedules || []).map(s => ({
            ...s,
            start: new Date(s.start),
            end: new Date(s.end)
          })));
        }
      } catch (err) {
        console.error("Load error:", err);
        alert("Failed to load group");
      }
    };

    loadGroupAndStatus();

    // Socket
    socket.emit("join_group", groupId);
    socket.on("receive_message", (data) => {
      if (data.groupId === parseInt(groupId)) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      socket.emit("leave_group", groupId);
      socket.off("receive_message");
    };
  }, [groupId, userId, navigate]);

  const handleJoinGroup = async () => {
    try {
      await axios.post("http://localhost:5000/api/group/join", {
        groupId: parseInt(groupId),
        userId
      });
      setUserStatus("pending");
      alert("Join request sent! Waiting for approval.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg = {
      sender: userName,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    socket.emit("send_message", { groupId, message: msg });
    setMessages(prev => [...prev, msg]);
    setInputText("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    axios.post("http://localhost:5000/api/upload", formData)
      .then(res => {
        const msg = {
          sender: userName,
          text: file.name,
          fileLink: res.data.fileUrl,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        socket.emit("send_message", { groupId, message: msg });
        setMessages(prev => [...prev, msg]);
      })
      .catch(() => alert("Upload failed"));
  };

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-8 border-[#800000] border-t-transparent"></div>
      </div>
    );
  }

  const isCreator = group.created_by === userId;
  const canAccess = userStatus === "approved" || isCreator;

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#800000] to-[#a00000] text-white p-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-bold mb-4">{group.group_name}</h1>
                <div className="flex gap-8 text-lg">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-7 h-7" />
                    <span>{group.current_members} / {group.size} members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-7 h-7" />
                    <span>{group.course} • {group.topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-7 h-7" />
                    <span>{group.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Created by</p>
                <p className="text-2xl font-bold">{group.creator_name}</p>
              </div>
            </div>
          </div>

          <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Info + Status */}
            <div className="lg:col-span-2 space-y-8">

              {/* Membership Status */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-300">
                {userStatus === "loading" && (
                  <div className="py-20">
                    <div className="animate-spin inline-block w-16 h-16 border-8 border-[#800000] rounded-full border-t-transparent"></div>
                  </div>
                )}

                {userStatus === "approved" && (
                  <div>
                    <CheckBadgeIcon className="w-32 h-32 text-green-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold text-green-600">You're a Member!</h2>
                    <p className="text-xl text-gray-600 mt-4">Welcome! You can now chat and view events.</p>
                  </div>
                )}

                {userStatus === "pending" && (
                  <div>
                    <ClockIcon className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold text-yellow-600">Request Pending</h2>
                    <p className="text-xl text-gray-600 mt-4">Your request is waiting for approval.</p>
                  </div>
                )}

                {userStatus === "none" && !isCreator && (
                  <div>
                    <UserPlusIcon className="w-32 h-32 text-blue-600 mx-auto mb-8" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Want to join this group?</h2>
                    <button
                      onClick={handleJoinGroup}
                      className="bg-[#800000] hover:bg-[#600000] text-white text-2xl font-bold px-16 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
                    >
                      Join Group
                    </button>
                  </div>
                )}

                {isCreator && (
                  <div>
                    <CheckCircleIcon className="w-32 h-32 text-purple-600 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold text-purple-700">You are the Creator</h2>
                    <p className="text-xl text-gray-600 mt-4">You have full access to this group.</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200">
                <h3 className="text-2xl font-bold text-[#800000] mb-6">About This Group</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{group.description || "No description provided."}</p>
              </div>

              {/* Events */}
              {canAccess && events.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-300">
                  <h3 className="text-3xl font-bold text-[#800000] mb-8 flex items-center gap-4">
                    <CalendarIcon className="w-10 h-10" /> Upcoming Sessions
                  </h3>
                  <div className="space-y-6">
                    {events.map((e, i) => (
                      <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                        <h4 className="text-2xl font-bold text-[#800000]">{e.title}</h4>
                        <p className="mt-3 text-gray-700 flex items-center gap-3">
                          <ClockIcon className="w-6 h-6 text-blue-600" />
                          {e.start.toLocaleDateString()} • {e.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {e.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {e.location && (
                          <p className="mt-2 text-gray-600 flex items-center gap-3">
                            <MapPinIcon className="w-5 h-5 text-red-600" />
                            {e.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat */}
            {canAccess && (
              <div className="bg-gray-50 rounded-2xl shadow-xl border border-gray-300 flex flex-col h-[700px]">
                <div className="bg-gradient-to-r from-[#800000] to-[#a00000] text-white p-6">
                  <h3 className="text-2xl font-bold flex items-center gap-4">
                    <ChatBubbleLeftEllipsisIcon className="w-9 h-9" />
                    Group Chat
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <ChatBubbleLeftEllipsisIcon className="w-20 h-20 mx-auto mb-4 opacity-30" />
                      <p className="text-xl">No messages yet. Say hi!</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === userName ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                        <div className={`max-w-xs px-6 py-4 rounded-3xl shadow-md ${msg.sender === userName ? "bg-[#800000] text-white" : "bg-white border"}`}>
                          {msg.fileLink ? (
                            <a href={msg.fileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 underline">
                              {msg.text.match(/\.(png|jpg|jpeg)$/i) ? <PhotoIcon className="w-6 h-6" /> : <DocIcon className="w-6 h-6" />}
                              {msg.text}
                            </a>
                          ) : (
                            <p className="text-lg">{msg.text}</p>
                          )}
                          <p className="text-xs opacity-70 mt-2 text-right">{msg.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 border-t bg-white">
                  <div className="flex gap-4 items-center">
                    <button onClick={() => fileInputRef.current.click()} className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl">
                      <ArrowUpTrayIcon className="w-7 h-7 text-gray-600" />
                    </button>
                    <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-[#800000] outline-none text-lg"
                    />
                    <button onClick={sendMessage} className="bg-[#800000] hover:bg-[#600000] text-white px-8 py-4 rounded-xl font-bold text-lg">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
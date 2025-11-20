import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function GroupCreator({ currentUserId }) {
  const navigate = useNavigate();
  const [availableGroups, setAvailableGroups] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [declinedGroups, setDeclinedGroups] = useState([]);
  const [refreshSignal, setRefreshSignal] = useState(false);

  // Fetch groups and user status
  const fetchGroups = async () => {
    try {
      const [allRes, userRes] = await Promise.all([
        axios.get("http://localhost:3000/api/group/list"),
        axios.get(`http://localhost:3000/api/group/user-status/${currentUserId}`)
      ]);

      if (!allRes.data.success) return;

      const allGroups = allRes.data.data;
      const userStatus = userRes.data.data || {};

      const available = [];
      const pending = [];
      const declined = [];

      allGroups.forEach(group => {
        const status = userStatus[group.id];
        const isCreator = group.created_by === currentUserId;

        // Skip if user is creator or already a member
        if (isCreator || status === "member") return;

        if (status === "pending") pending.push(group);
        else if (status === "declined") declined.push({ ...group, remarks: userStatus[group.id + "_remarks"] || "" });
        else available.push(group);
      });

      setAvailableGroups(available);
      setPendingGroups(pending);
      setDeclinedGroups(declined);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [currentUserId, refreshSignal]);

  const handleJoinGroup = async (groupId) => {
    try {
      const res = await axios.post("http://localhost:3000/api/group/join", {
        groupId,
        userId: currentUserId,
      });
      if (res.data.success) {
        setRefreshSignal(prev => !prev);
        alert("Join request sent!");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send join request");
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] max-w-7xl mx-auto bg-white shadow-xl rounded-xl border border-gray-300 overflow-hidden">
      <div className="flex flex-1 flex-col lg:flex-row gap-0">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-maroon">Available Groups</h1>
            <button
              onClick={() => navigate("/create-group")}
              className="bg-maroon text-white px-4 py-2 rounded-lg hover:brightness-110"
            >
              + Create Group
            </button>
          </div>

          <div className="space-y-6">
            {availableGroups.length === 0 ? (
              <p className="text-gray-500">No groups available to join.</p>
            ) : (
              availableGroups.map(group => (
                <div
                  key={group.id}
                  className="flex items-center justify-between bg-gray-100 p-4 rounded-lg border border-gray-300"
                >
                  <div>
                    <p className="font-semibold text-maroon">{group.group_name}</p>
                    <p className="text-gray-700">{group.course} • {group.location}</p>
                  </div>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="bg-gold text-maroon px-4 py-2 rounded hover:brightness-110"
                  >
                    Join
                  </button>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 p-6 bg-gray-50 overflow-y-auto space-y-6">
          {/* Pending Groups */}
          <div>
            <h3 className="font-semibold text-maroon text-lg mb-3">Pending Groups ({pendingGroups.length})</h3>
            <ul className="space-y-3">
              {pendingGroups.length === 0 ? (
                <li className="text-gray-500">No pending requests.</li>
              ) : pendingGroups.map(group => (
                <li
                  key={group.id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg border border-gray-300"
                >
                  <span>{group.group_name}</span>
                  <span className="bg-yellow-400 text-maroon px-2 py-1 rounded-full text-sm font-medium">Pending</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Declined Groups */}
          <div>
            <h3 className="font-semibold text-maroon text-lg mb-3">Declined Groups ({declinedGroups.length})</h3>
            <ul className="space-y-3">
              {declinedGroups.length === 0 ? (
                <li className="text-gray-500">No declined requests.</li>
              ) : declinedGroups.map(group => (
                <li
                  key={group.id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg border border-gray-300"
                >
                  <span className="flex flex-col">
                    <span>{group.group_name}</span>
                    {group.remarks && <small className="text-red-600">Reason: {group.remarks}</small>}
                  </span>
                  <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm font-medium">Declined</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

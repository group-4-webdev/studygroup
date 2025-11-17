import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreateGroupPage from "./CreateGroupPage.jsx";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userGroups, setUserGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  // Fetch user's created groups
  const fetchUserGroups = async () => {
    try {
      const res = await axios.get(
        "http://localhost/your-backend-folder/get_group.php",
        { withCredentials: true }
      );
      setUserGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all available groups
  const fetchAllGroups = async () => {
    try {
      const res = await axios.get(
        "http://localhost/your-backend-folder/get_all_groups.php",
        { withCredentials: true }
      );
      setAllGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserGroups();
    fetchAllGroups();
  }, []);

  // Join group handler
  const handleJoinGroup = async (groupId) => {
    try {
      const res = await axios.post(
        "http://localhost/your-backend-folder/join_group.php",
        { groupId },
        { withCredentials: true }
      );

      if (res.data.status === "success") {
        // Refresh the groups
        fetchAllGroups();
        fetchUserGroups(); // optional
      } else {
        alert(res.data.message || "Failed to join group");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] max-w-7xl mx-auto bg-white shadow-xl rounded-xl border border-gray-300 overflow-hidden">
      <div className="flex h-[calc(100vh-200px)] w-full max-w-[90rem] mx-auto">
        <div className="flex-1 flex flex-col lg:flex-row gap-0">

          {/* Main content: All Groups */}
          <main className="flex-1 bg-white shadow-xl rounded-l-xl border border-gray-300 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-maroon">Groups Available</h1>
                <button
                  onClick={() => navigate("/create-group")}
                  className="bg-maroon text-white px-4 py-2 rounded-lg hover:brightness-110"
                >
                  + Create Group
                </button>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <input
                  type="text"
                  placeholder="Search by subject, course, or place"
                  className="flex-1 p-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-gold"
                />
                <select className="p-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-gold">
                  <option>Locations</option>
                  <option>Campus A</option>
                  <option>Campus B</option>
                  <option>Library</option>
                  <option>Engineering Building</option>
                  <option>CLA Building</option>
                </select>
              </div>

              <div className="space-y-6 pr-2">
                {allGroups.length === 0
                  ? <p className="text-gray-500">No groups available.</p>
                  : allGroups.map((g) => {
                      const [current, max] = g.space?.split("/").map(Number) || [0, g.size];
                      const isFull = current >= max;

                      return (
                        <div key={g.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg border border-gray-300 mb-2">
                          <div>
                            <p className="font-semibold text-maroon">{g.name} ({g.topic})</p>
                            <p className="text-gray-700">{g.description}</p>
                            <p className="text-gray-500">{g.course} • {g.location}</p>
                            <p className="text-gray-500">Size: {g.size} • Space: {g.space}</p>
                          </div>
                          <button
                            disabled={isFull}
                            onClick={() => handleJoinGroup(g.id)}
                            className={`px-4 py-2 rounded hover:brightness-110 ${isFull ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-gold text-maroon"}`}
                          >
                            {isFull ? "Full" : "Join Group"}
                          </button>
                        </div>
                      );
                  })}
              </div>
            </div>
          </main>

          {/* Sidebar: User's groups */}
          <aside className="w-full lg:w-80 bg-white rounded-r-xl shadow-xl border border-l-0 border-gray-300 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="bg-gray-100 p-5 rounded-lg border border-gray-300 shadow-sm">
              <h3 className="font-semibold text-maroon text-lg mb-3">Your Courses</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Biol 41</li>
                <li>Math 143</li>
                <li>Math 146</li>
                <li>Math 158</li>
              </ul>
            </div>

            <div className="bg-gray-100 p-5 rounded-lg border border-gray-300 shadow-sm">
              <h3 className="font-semibold text-maroon text-lg mb-3">Your Created Groups</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {userGroups.length === 0
                  ? <li className="text-gray-500">You haven't created any groups yet.</li>
                  : userGroups.map((g) => (
                      <li key={g.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{g.name}</span>
                          <span className="ml-2 text-gray-500">({g.space || "N/A"})</span>
                        </div>
                        <div className="flex gap-1">
                          {/* Optional Edit/Delete buttons */}
                        </div>
                      </li>
                    ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

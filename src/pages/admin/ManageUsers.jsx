// src/pages/admin/ManageUsers.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,        // ← Correct name (was MailIcon)
  UserPlusIcon
} from "@heroicons/react/24/solid";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/user/admin-list");
      const userList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.users || [];
      setUsers(userList);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdmin = async (userId, currentRole) => {
    if (!confirm(`Make this user ${currentRole === "admin" ? "regular user" : "admin"}?`)) return;

    try {
      await axios.patch(`http://localhost:3000/api/user/toggle-admin/${userId}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading users...</p>
      </div>
    );
  }

  const admins = users.filter(u => u.role === "admin" || u.isAdmin);
  const students = users.filter(u => u.role !== "admin" && !u.isAdmin);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-maroon mb-8 flex items-center gap-3">
          <ShieldCheckIcon className="w-10 h-10" />
          Manage Users
        </h1>

        {/* Admins Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-600 mb-5 flex items-center gap-2">
            <ShieldCheckIcon className="w-7 h-7" /> Admins ({admins.length})
          </h2>
          <div className="grid gap-5">
            {admins.length === 0 ? (
              <p className="text-gray-500 bg-white p-8 rounded-xl text-center shadow">
                No admins found
              </p>
            ) : (
              admins.map(user => (
                <div
                  key={user._id}
                  className="bg-purple-50 border-2 border-purple-300 p-6 rounded-xl shadow flex justify-between items-center hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user.username?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{user.username || user.name}</h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5" /> {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAdmin(user._id, "admin")}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <UserPlusIcon className="w-5 h-5" /> Remove Admin
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Students Section */}
        <section>
          <h2 className="text-2xl font-bold text-blue-600 mb-5 flex items-center gap-2">
            <UserIcon className="w-7 h-7" /> Students ({students.length})
          </h2>
          <div className="grid gap-5">
            {students.length === 0 ? (
              <p className="text-gray-500 bg-white p-8 rounded-xl text-center shadow">
                No students found
              </p>
            ) : (
              students.map(user => (
                <div
                  key={user._id}
                  className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{user.username || user.name}</h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5" /> {user.email}
                      </p>
                      {user.studentId && (
                        <p className="text-sm text-gray-500 mt-1">Student ID: {user.studentId}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAdmin(user._id, "user")}
                    className="bg-maroon text-white px-6 py-3 rounded-lg hover:bg-red-800 font-medium flex items-center gap-2"
                  >
                    <ShieldCheckIcon className="w-5 h-5" /> Make Admin
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
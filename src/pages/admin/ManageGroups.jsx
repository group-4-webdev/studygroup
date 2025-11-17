import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import AdminLayout from "../../layouts/AdminLayout";
import axios from "axios";

export default function ManageGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("/api/admin/groups");
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await axios.delete(`/api/admin/groups/${id}`);
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (group) => {
    const newStatus = group.status === "active" ? "full" : "active"; // example toggle
    try {
      await axios.put(`/api/admin/groups/${group.id}`, {
        name: group.name,
        course: group.course,
        status: newStatus,
      });
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-maroon">Study Groups</h2>
              <p className="text-sm text-gray-600 mt-1">View, edit, or remove existing study groups.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-maroon transition"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-maroon text-white text-left">
                  <th className="px-5 py-4 font-semibold rounded-tl-lg">Group Name</th>
                  <th className="px-5 py-4 font-semibold">Course</th>
                  <th className="px-5 py-4 font-semibold text-center">Members</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">ID: {group.id}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{group.course}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          group.status === "full" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {group.members}/10
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{group.created}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          onClick={() => handleUpdate(group)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                          onClick={() => handleDelete(group.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGroups.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No groups found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

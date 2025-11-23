import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MyStudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/group/my-joined/${user.id}`);
        setGroups(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (user.id) fetchGroups();
  }, [user.id]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#800000] mb-8">My Study Groups</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <p>No joined groups yet.</p>
        ) : (
          groups.map(g => (
            <div key={g.id} className="bg-white p-6 rounded-xl shadow-lg border">
              <h2 className="text-xl font-bold text-[#800000]">{g.group_name}</h2>
              <p className="text-gray-600">{g.course} • {g.topic}</p>
              <button
                onClick={() => navigate(`/group/${g.id}`)}
                className="mt-4 bg-[#800000] text-white px-6 py-2 rounded-lg"
              >
                Enter Group
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
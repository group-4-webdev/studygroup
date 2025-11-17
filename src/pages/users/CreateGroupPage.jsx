import { useState } from "react";
import axios from "axios";

export default function CreateGroupPage({ onGroupCreated }) {
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    course: "",
    topic: "",
    location: "",
    size: "",
    space: "",
  });

  const handleChange = (e) => {
    setGroupData({ ...groupData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost/your-backend-folder/create_group.php",
        groupData,
        { withCredentials: true }
      );
      alert("Group created successfully!");
      setGroupData({
        name: "",
        description: "",
        course: "",
        topic: "",
        location: "",
        size: "",
        space: "",
      });
      onGroupCreated();
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input name="name" value={groupData.name} onChange={handleChange} placeholder="Group Name" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold" />
      <textarea name="description" value={groupData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold h-24 resize-none"></textarea>
      <input name="course" value={groupData.course} onChange={handleChange} placeholder="Course" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold" />
      <input name="topic" value={groupData.topic} onChange={handleChange} placeholder="Topic" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold" />
      <input name="location" value={groupData.location} onChange={handleChange} placeholder="Location" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="size" value={groupData.size} onChange={handleChange} placeholder="Group Size" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold" />
        <input name="space" value={groupData.space} onChange={handleChange} placeholder="Space Available" className="w-full p-3 rounded bg-gray-200 focus:ring-2 focus:ring-gold" />
      </div>
      <button type="submit" className="w-full bg-maroon text-white py-3 rounded-lg hover:brightness-110 font-semibold">Create Group</button>
    </form>
  );
}

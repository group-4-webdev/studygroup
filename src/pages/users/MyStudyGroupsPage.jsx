import { 
  UserGroupIcon, 
  VideoCameraIcon, 
  ChatBubbleLeftEllipsisIcon, 
  UserPlusIcon } 
from "@heroicons/react/24/outline";

export default function MyStudyGroupsPage() {
  const studyGroups = [
    { name: "Math 146 Group", course: "Math 146", members: ["/avatars/avatar1.png", "/avatars/avatar2.png", "/avatars/avatar3.png"], color: "bg-yellow-100" },
    { name: "Math 143", course: "Math 143", members: ["/avatars/avatar4.png", "/avatars/avatar5.png", "/avatars/avatar6.png"], color: "bg-blue-100" },
    { name: "Best Team", course: "Math 158", members: ["/avatars/avatar7.png", "/avatars/avatar8.png", "/avatars/avatar9.png", "/avatars/avatar10.png"], color: "bg-purple-100" },
    { name: "Smarties", course: "Biol 41", members: ["/avatars/avatar11.png", "/avatars/avatar12.png", "/avatars/avatar13.png", "/avatars/avatar14.png"], color: "bg-green-100" },
  ];

  return (
      <div className="flex h-[calc(100vh-200px)] max-w-7xl mx-auto bg-white border border-gray-300 shadow-xl rounded-xl overflow-hidden">
        <div className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-hide">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-maroon flex items-center gap-2">
              <UserGroupIcon className="w-7 h-7 text-gold" />
              My Study Groups
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyGroups.map((group, index) => (
              <div
                key={index}
                className={`${group.color} rounded-xl p-6 shadow-md border border-gray-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-maroon">{group.name}</h2>
                    <button className="text-gray-500 hover:text-maroon text-2xl leading-none">⋮</button>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Course:</strong> {group.course}
                  </p>

                  <p className="text-sm font-medium text-maroon mb-2">Members:</p>
                  <div className="flex -space-x-2">
                    {group.members.map((member, i) => (
                      <img
                        key={i}
                        src={member}
                        alt="Member"
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex items-center gap-2 bg-white border border-gray-300 text-maroon px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                    Message Group
                  </button>
                  <button className="flex items-center gap-2 bg-white border border-gray-300 text-maroon px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    <VideoCameraIcon className="w-4 h-4" />
                    Video Call
                  </button>
                  <button className="flex items-center gap-2 bg-white border border-gray-300 text-maroon px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    <UserPlusIcon className="w-4 h-4" />
                    Invite Member
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

import { useState } from "react";
import {
  StarIcon,
  FunnelIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function InboxPage() {
  const [messages] = useState([
    { id: 1, name: "Alannah Dillon", message: "Join my group: Biol 41", starred: true },
    { id: 2, name: "Joyce Nelson", message: "Mathematicians", starred: false },
    { id: 3, name: "Louie Ventura", message: "Please change time for next meeting", starred: false },
    { id: 4, name: "Olive Maynard", message: "Joined Mathematicians", starred: true },
    { id: 5, name: "Subhan Frederick", message: "Looking for group member for Math 143 Group", starred: false },
    { id: 6, name: "Maha Decker", message: "Creating study date for Quiz 4", starred: false },
    { id: 7, name: "Kelsey Zavala", message: "Date/Time for next meeting?", starred: false },
    { id: 8, name: "Clarice Preston", message: "When is next the homework meeting?", starred: false },
    { id: 9, name: "Taliah Peters", message: "Pop Quiz today?", starred: false },
    { id: 10, name: "Cristiano Nicholls", message: "Who is creating the study date?", starred: true },
    { id: 11, name: "Annalise Phan", message: "Working on study guide!", starred: false },
  ]);

  return (
      <div className="flex h-[calc(100vh-200px)] max-w-7xl mx-auto bg-white shadow-xl rounded-xl border border-gray-300 overflow-hidden">
        <aside className="w-64 bg-maroon text-white p-4 flex flex-col">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            Study Squad Inbox
          </h2>

          <nav className="flex flex-col space-y-2 text-sm">
            <button className="text-left p-2 rounded hover:bg-white hover:text-maroon">All Messages</button>
            <button className="text-left p-2 rounded hover:bg-white hover:text-maroon">Starred</button>
            <button className="text-left p-2 rounded hover:bg-white hover:text-maroon">Archived</button>
            <button className="text-left p-2 rounded hover:bg-white hover:text-maroon">Deleted</button>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col bg-white border border-gray-300">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                placeholder="Search Inbox"
                className="flex-1 p-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-gold"
              />
              <button className="p-2 rounded hover:bg-gray-200">
                <FunnelIcon className="w-5 h-5 text-maroon" />
              </button>
              <button className="p-2 rounded hover:bg-gray-200">
                <Squares2X2Icon className="w-5 h-5 text-maroon" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <table className="w-full text-sm">
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className="hover:bg-gray-100 cursor-pointer border-b"
                  >
                    <td className="p-3 w-10 text-center">
                      {msg.starred ? (
                        <StarIcon className="w-5 h-5 text-gold fill-gold" />
                      ) : (
                        <StarIcon className="w-5 h-5 text-gray-400 hover:text-gold" />
                      )}
                    </td>
                    <td className="p-3 font-medium text-maroon w-1/4">
                      {msg.name}
                    </td>
                    <td className="p-3 text-gray-700">{msg.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
  );
}

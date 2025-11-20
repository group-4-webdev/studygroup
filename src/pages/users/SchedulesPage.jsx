import { useState } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

export default function SchedulesPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const events = [
    {
      title: "Math 143",
      date: new Date(2024, 8, 11),
      time: "1:00 PM – 3:00 PM",
      location: "Online",
      description: "Study chapters 1–5 • Go over class notes and homework problems",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Best Team",
      date: new Date(2024, 8, 14),
      time: "12:00 PM – 1:30 PM",
      location: "School Library",
      description: "Do practice problems from chapters 1–3 • Review textbook problems",
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Smarties",
      date: new Date(2024, 8, 16),
      time: "2:30 PM – 5:30 PM",
      location: "Online",
      description: "Homework session on chapter 3",
      color: "bg-green-100 text-green-800",
    },
  ];

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  return (
      <div className="flex h-[calc(100vh-200px)] max-w-7xl mx-auto bg-white border border-gray-300 shadow-xl rounded-xl overflow-hidden relative">
        <div className="flex-1 border-r border-gray-300 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold text-maroon">
                {monthName} {year}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
              </button>
              <CalendarDaysIcon className="w-6 h-6 text-gold ml-2" />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-maroon text-white px-4 py-2 rounded-lg hover:brightness-110 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" /> Study Date
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-4 grid grid-cols-7 gap-2 text-center text-sm">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
                <div key={day} className="font-semibold text-maroon">{day}</div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const thisDate = new Date(year, currentDate.getMonth(), dayNum);
                const eventForDay = events.find(
                  (ev) =>
                    ev.date.getDate() === thisDate.getDate() &&
                    ev.date.getMonth() === thisDate.getMonth() &&
                    ev.date.getFullYear() === thisDate.getFullYear()
                );

                return (
                  <div
                    key={i}
                    className="h-24 border border-gray-200 rounded-lg p-1 text-left relative overflow-hidden hover:bg-gray-100"
                  >
                    <span className="text-xs text-gray-500">{dayNum}</span>
                    {eventForDay && (
                      <div
                        className={`mt-1 text-xs px-1 py-0.5 rounded truncate ${eventForDay.color}`}
                      >
                        {eventForDay.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="w-80 bg-gray-100 p-6 overflow-y-auto scrollbar-hide">
          <h2 className="text-lg font-bold text-maroon mb-4">
            Upcoming Study Dates
          </h2>
          <p className="text-gray-700 text-sm mb-4">
            Study dates for this month
          </p>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${event.color} border border-gray-200`}
              >
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-xs text-gray-700">
                  {event.date.toDateString()} • {event.time}
                </p>
                <p className="text-xs text-gray-600 mb-2">{event.location}</p>
                <p className="text-xs text-gray-700">
                  <strong>Description:</strong> {event.description}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {showModal && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-maroon"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-maroon mb-4">
                Create Study Date
              </h2>

              <form className="space-y-3">
                <input
                  type="text"
                  placeholder="Study for Quiz 5"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gold"
                />
                <input
                  type="date"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gold"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gold"
                />

                <div className="flex items-center gap-2">
                  <input type="time" className="w-full p-2 border rounded focus:ring-2 focus:ring-gold" />
                  <span className="text-sm text-gray-500">to</span>
                  <input type="time" className="w-full p-2 border rounded focus:ring-2 focus:ring-gold" />
                </div>

                <select className="w-full p-2 border rounded focus:ring-2 focus:ring-gold text-gray-700">
                  <option>Select Study Buddies</option>
                  <option>Math 143</option>
                  <option>Smarties</option>
                  <option>Best Team</option>
                </select>

                <textarea
                  placeholder="Description (Optional)"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-gold h-20 resize-none"
                ></textarea>

                <button
                  type="submit"
                  className="w-full border border-maroon text-maroon py-2 rounded-lg hover:bg-maroon hover:text-white transition font-semibold"
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}

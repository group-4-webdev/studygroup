// SchedulesPage.jsx
import { useEffect, useState, useMemo } from "react";
import { gapi } from "gapi-script";
import axios from "axios";
import { CalendarDaysIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import Modal from "react-modal";
import "react-big-calendar/lib/css/react-big-calendar.css";

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_GOOGLE_API_KEY";
const SCOPES =
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const API_BASE = "http://localhost:3000";

const TZ = "Asia/Manila";
moment.tz.setDefault(TZ);
const localizer = momentLocalizer(moment);

const TYPE_COLORS = {
  group: "#7a1422",
  personal: "#f6c555",
  exam: "#e53e3e",
  task: "#16a34a",
  google: "#f6c555",
  default: "#7a1422",
};

export default function SchedulesPage() {
  const userId = localStorage.getItem("userId") || null;

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loadingGapi, setLoadingGapi] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");

  const [attendeeEmailInput, setAttendeeEmailInput] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [backendSchedules, setBackendSchedules] = useState([]);
  const [mergedSchedules, setMergedSchedules] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMerge, setLoadingMerge] = useState(false);
  const [error, setError] = useState(null);

  // Edit modal states
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAttendees, setEditAttendees] = useState([]);
  const [editAttendeeInput, setEditAttendeeInput] = useState("");

  // --- Initialization & fetching ---
  useEffect(() => {
    const init = async () => {
      try {
        await gapi.load("client:auth2");
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
        const auth = gapi.auth2.getAuthInstance();
        setIsSignedIn(auth.isSignedIn.get());
        auth.isSignedIn.listen((val) => setIsSignedIn(val));
      } catch (e) {
        console.error("gapi init error", e);
      } finally {
        setLoadingGapi(false);
      }
    };
    init();
    fetchUserGroups();
    fetchBackendSchedules();
  }, []);

  const fetchUserGroups = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE}/api/schedules/group/user/${userId}`);
      setGroups(res.data.groups || []);
    } catch (e) {
      console.warn("Failed to fetch groups", e);
    }
  };

  const fetchBackendSchedules = async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/api/schedules/user/${userId}`);
      const backend = (res.data.schedules || []).map((s) => ({
        ...s,
        attendees: s.attendees || [],
      }));
      setBackendSchedules(backend);

      if (isSignedIn) {
        setLoadingMerge(true);
        const merged = await mergeWithGoogleEvents(backend);
        setMergedSchedules(merged);
        setLoadingMerge(false);
      } else setMergedSchedules(backend);
    } catch (e) {
      console.error("Failed to fetch schedules", e);
      setError("Failed to load schedules");
    } finally {
      setRefreshing(false);
    }
  };

  const mergeWithGoogleEvents = async (backendList) => {
    try {
      const now = new Date();
      const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const resp = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin,
        timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      const googleEvents = (resp.result.items || []).map((ev) => ({
        source: "google",
        googleEventId: ev.id,
        title: ev.summary || "(No title)",
        description: ev.description || "",
        start: ev.start?.dateTime || ev.start?.date,
        end: ev.end?.dateTime || ev.end?.date,
        location: ev.location || "",
        attendees: (ev.attendees || []).map((a) => ({ email: a.email })),
        type: "personal",
      }));

      const byGoogleId = {};
      backendList.forEach((b) => {
        if (b.googleEventId) byGoogleId[b.googleEventId] = b;
      });

      const merged = [...backendList];
      googleEvents.forEach((g) => {
        if (!byGoogleId[g.googleEventId]) merged.push(g);
      });

      merged.sort((a, b) => new Date(a.start) - new Date(b.start));
      return merged;
    } catch (e) {
      console.error("Failed to merge with Google events", e);
      return backendList;
    }
  };

  const addAttendeeFromInput = () => {
    const email = attendeeEmailInput.trim();
    if (!email) return;
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) return alert("Enter valid email");
    if (!attendees.find((a) => a.email === email)) setAttendees([...attendees, { email }]);
    setAttendeeEmailInput("");
  };

  const removeAttendee = (email) => setAttendees(attendees.filter((a) => a.email !== email));

  const fetchGroupMembers = async (groupId) => {
    if (!groupId) return;
    try {
      const res = await axios.get(`${API_BASE}/api/schedules/group/${groupId}/members`);
      const members = res.data.members || [];
      const mapped = members.map((m) => ({ email: m.email })).filter(Boolean);
      setAttendees((prev) => {
        const merged = [...prev];
        mapped.forEach((a) => {
          if (!merged.find((p) => p.email === a.email)) merged.push(a);
        });
        return merged;
      });
    } catch (e) {
      console.warn(e);
      alert("Unable to load group members. Add manually if needed.");
    }
  };

  const createGoogleEvent = async ({ title, description, startISO, endISO, location, attendees: attendeesArr }) => {
    try {
      const auth = gapi.auth2.getAuthInstance();
      if (!auth?.isSignedIn.get()) return null;
      const resp = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: {
          summary: title,
          description: description || "",
          start: { dateTime: startISO, timeZone: TZ },
          end: { dateTime: endISO, timeZone: TZ },
          location: location || "",
          attendees: attendeesArr.length ? attendeesArr : undefined,
        },
      });
      return resp.result?.id || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const saveScheduleToBackend = async (payload) => {
    try {
      await axios.post(`${API_BASE}/api/schedules`, payload);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`${API_BASE}/api/schedules/${scheduleId}`);
      fetchBackendSchedules();
      alert("Schedule deleted");
    } catch (e) {
      console.error(e);
      alert("Failed to delete schedule");
    }
  };

  const handleCreate = async () => {
    if (!userId) return alert("Login required");
    if (!title || !start || !end) return alert("Provide title/start/end");

    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();
    const attendeesPayload = attendees.map((a) => ({ email: a.email }));

    setSaving(true);
    let googleEventId = null;
    if (isSignedIn)
      googleEventId = await createGoogleEvent({
        title,
        description,
        startISO,
        endISO,
        location,
        attendees: attendeesPayload,
      });

    try {
      await saveScheduleToBackend({
        userId,
        title,
        description,
        start: startISO,
        end: endISO,
        location,
        attendees: attendeesPayload,
        googleEventId,
        type: "group",
      });
      setTitle("");
      setDescription("");
      setStart("");
      setEnd("");
      setLocation("");
      setAttendees([]);
      setAttendeeEmailInput("");
      setSelectedGroupId("");
      fetchBackendSchedules();
      alert(
        "Schedule created" + (googleEventId ? " and added to Google Calendar." : ".")
      );
    } catch {
      alert("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const signIn = async () => {
    const auth = gapi.auth2.getAuthInstance();
    await auth.signIn();
    setIsSignedIn(auth.isSignedIn.get());
    fetchBackendSchedules();
  };

  const signOut = async () => {
    const auth = gapi.auth2.getAuthInstance();
    await auth.signOut();
    setIsSignedIn(auth.isSignedIn.get());
    fetchBackendSchedules();
  };

  // --- Edit / Modal Functions ---
  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setEditTitle(schedule.title);
    setEditDescription(schedule.description || "");
    setEditStart(moment(schedule.start).format("YYYY-MM-DDTHH:mm"));
    setEditEnd(moment(schedule.end).format("YYYY-MM-DDTHH:mm"));
    setEditLocation(schedule.location || "");
    setEditAttendees(schedule.attendees || []);
  };

  const addEditAttendee = () => {
    const email = editAttendeeInput.trim();
    if (!email) return;
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) return alert("Enter valid email");
    if (!editAttendees.find((a) => a.email === email))
      setEditAttendees([...editAttendees, { email }]);
    setEditAttendeeInput("");
  };

  const removeEditAttendee = (email) =>
    setEditAttendees(editAttendees.filter((a) => a.email !== email));

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    const payload = {
      title: editTitle,
      description: editDescription,
      start: new Date(editStart).toISOString(),
      end: new Date(editEnd).toISOString(),
      location: editLocation,
      attendees: editAttendees,
    };

    try {
      await axios.put(`${API_BASE}/api/schedules/${editingSchedule.id}`, payload);

      if (isSignedIn && editingSchedule.googleEventId) {
        await gapi.client.calendar.events.update({
          calendarId: "primary",
          eventId: editingSchedule.googleEventId,
          resource: {
            summary: payload.title,
            description: payload.description || "",
            start: { dateTime: payload.start, timeZone: TZ },
            end: { dateTime: payload.end, timeZone: TZ },
            location: payload.location || "",
            attendees: payload.attendees.length ? payload.attendees : undefined,
          },
        });
      }

      fetchBackendSchedules();
      setEditingSchedule(null);
      alert("Schedule updated successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to update schedule");
    }
  };

  const handleDeleteEdit = async () => {
    if (!editingSchedule) return;
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`${API_BASE}/api/schedules/${editingSchedule.id}`);
      setEditingSchedule(null);
      fetchBackendSchedules();
      alert("Schedule deleted");
    } catch (e) {
      console.error(e);
      alert("Failed to delete schedule");
    }
  };

  const onSelectEvent = (ev) => openEditModal(ev);

  const calendarView = useMemo(() => ["month", "week", "day"], []);
  useEffect(() => {
    const mapped = (mergedSchedules || []).map((s) => ({
      ...s,
      start: new Date(s.start),
      end: new Date(s.end),
    }));
    setCalendarEvents(mapped);
  }, [mergedSchedules]);

  // --- RETURN UI ---
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon">Schedules</h1>
          <p className="text-sm text-gray-600">
            Create study sessions, invite attendees and view merged calendar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loadingGapi ? (
            <button
              className="px-3 py-1 bg-gray-200 rounded flex items-center gap-2 text-sm"
              disabled
            >
              <ArrowPathIcon className="w-4 h-4 animate-spin text-gray-600" />
              Loading Google...
            </button>
          ) : isSignedIn ? (
            <button
              onClick={signOut}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:brightness-90"
            >
              Sign out (Calendar)
            </button>
          ) : (
            <button
              onClick={signIn}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:brightness-90"
            >
              Sign in with Google (Calendar)
            </button>
          )}
        </div>
      </div>

      {/* Left Form & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Form */}
        <div className="lg:col-span-1 bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-maroon mb-3">Create Session</h2>

          <label className="block text-sm text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border mt-1 mb-3"
            placeholder="e.g. IT312 Group Study"
          />

          <label className="block text-sm text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border mt-1 mb-3"
            placeholder="Optional details"
            rows={3}
          />

          <div className="mb-3">
            <label className="block text-sm text-gray-700">Start (local)</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full p-2 rounded border mt-1"
            />
            <small className="text-xs text-gray-500">Timezone: {TZ}</small>
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-700">End (local)</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full p-2 rounded border mt-1"
            />
          </div>

          <label className="block text-sm text-gray-700">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 rounded border mt-1 mb-3"
            placeholder="e.g. Library / Google Meet link"
          />

          <label className="block text-sm text-gray-700 mt-2">Attendees (emails)</label>
          <div className="flex gap-2 mb-2">
            <input
              value={attendeeEmailInput}
              onChange={(e) => setAttendeeEmailInput(e.target.value)}
              className="flex-1 p-2 rounded border"
              placeholder="name@example.com"
            />
            <button
              onClick={addAttendeeFromInput}
              type="button"
              className="px-3 py-2 bg-maroon text-white rounded"
            >
              Add
            </button>
          </div>

          {attendees.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {attendees.map((a) => (
                  <div
                    key={a.email}
                    className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2 text-xs"
                  >
                    <span>{a.email}</span>
                    <button
                      onClick={() => removeAttendee(a.email)}
                      className="text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="block text-sm text-gray-700">Add members from group</label>
          <div className="flex gap-2 mb-4">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="flex-1 p-2 rounded border"
            >
              <option value="">Select a group (optional)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.group_name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!selectedGroupId) return alert("Choose a group first.");
                fetchGroupMembers(selectedGroupId);
              }}
              className="px-3 py-2 bg-gold text-maroon rounded border"
            >
              Add Members
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 bg-maroon text-white px-3 py-2 rounded hover:brightness-90"
            >
              {saving ? "Saving…" : "Create & Save"}
            </button>
            <button
              onClick={() => {
                setTitle("");
                setDescription("");
                setStart("");
                setEnd("");
                setLocation("");
                setAttendees([]);
                setAttendeeEmailInput("");
                setSelectedGroupId("");
              }}
              className="px-3 py-2 border rounded"
            >
              Clear
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Events saved to backend and (if signed-in) to Google Calendar.
          </p>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-semibold text-maroon">Upcoming Sessions</h2>
            </div>
            <button
              onClick={fetchBackendSchedules}
              className="text-sm px-2 py-1 border rounded flex items-center gap-2"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          {loadingMerge && <p className="text-sm text-gray-600 mb-2">Merging Google Calendar events...</p>}

          <div style={{ height: 550 }}>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              defaultView="month"
              views={calendarView}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              eventPropGetter={(e) => ({
                style: {
                  backgroundColor: TYPE_COLORS[e.type || "group"],
                  color: "white",
                  borderRadius: 6,
                  padding: "2px 4px",
                  fontSize: "0.85rem",
                },
              })}
              onSelectEvent={onSelectEvent}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSchedule}
        onRequestClose={() => setEditingSchedule(null)}
        contentLabel="Edit Schedule"
        className="bg-white max-w-lg mx-auto mt-20 p-6 rounded shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50"
      >
        <h2 className="text-xl font-bold text-maroon mb-3">Edit Schedule</h2>

        <label className="block text-sm text-gray-700">Title</label>
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-2 rounded border mt-1 mb-3"
        />

        <label className="block text-sm text-gray-700">Description</label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full p-2 rounded border mt-1 mb-3"
          rows={3}
        />

        <label className="block text-sm text-gray-700">Start</label>
        <input
          type="datetime-local"
          value={editStart}
          onChange={(e) => setEditStart(e.target.value)}
          className="w-full p-2 rounded border mt-1 mb-3"
        />

        <label className="block text-sm text-gray-700">End</label>
        <input
          type="datetime-local"
          value={editEnd}
          onChange={(e) => setEditEnd(e.target.value)}
          className="w-full p-2 rounded border mt-1 mb-3"
        />

        <label className="block text-sm text-gray-700">Location</label>
        <input
          value={editLocation}
          onChange={(e) => setEditLocation(e.target.value)}
          className="w-full p-2 rounded border mt-1 mb-3"
        />

        <label className="block text-sm text-gray-700">Attendees</label>
        <div className="flex gap-2 mb-2">
          <input
            value={editAttendeeInput}
            onChange={(e) => setEditAttendeeInput(e.target.value)}
            className="flex-1 p-2 rounded border"
            placeholder="name@example.com"
          />
          <button
            onClick={addEditAttendee}
            className="px-3 py-2 bg-maroon text-white rounded"
          >
            Add
          </button>
        </div>

        {editAttendees.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {editAttendees.map((a) => (
              <div
                key={a.email}
                className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2 text-xs"
              >
                <span>{a.email}</span>
                <button
                  onClick={() => removeEditAttendee(a.email)}
                  className="text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={handleDeleteEdit}
            className="px-3 py-2 bg-red-600 text-white rounded hover:brightness-90"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingSchedule(null)}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-2 bg-maroon text-white rounded hover:brightness-90"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

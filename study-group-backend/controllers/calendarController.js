import { pool } from "../config/db.js";
import { createEvent } from "../utils/googleCalendar.js";

export const getGroupSchedules = async (req, res) => {
  const { groupId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM schedules WHERE groupId = ? ORDER BY start ASC",
      [groupId]
    );

    const schedules = rows.map(s => ({
      ...s,
      attendees: JSON.parse(s.attendees || "[]")
    }));

    res.json({ schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB Error" });
  }
};

export const createGroupSchedule = async (req, res) => {
  const { groupId } = req.params;
  const { title, start, end, location = "Online", description = "" } = req.body;

  if (!title || !start || !end) {
    return res.status(400).json({ success: false, message: "Title, start, and end are required" });
  }

  try {
    // Convert to ISO string (frontend already does this, but double-safe)
    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();

    // This matches exactly what googleCalendar.js expects
    const googleEvent = await createEvent({
      title,
      description,
      location,
      start: startISO,
      end: endISO,
    });

    // Save to DB
    const [result] = await pool.execute(
      `INSERT INTO schedules 
       (groupId, title, description, start, end, location, attendees, googleEventId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [groupId, title, description, startISO, endISO, location, "[]", googleEvent.id]
    );

    res.status(201).json({
      success: true,
      schedule: {
        id: result.insertId,
        groupId: parseInt(groupId),
        title,
        description,
        start: startISO,
        end: endISO,
        location,
        attendees: [],
        googleEventId: googleEvent.id,
      },
    });
  } catch (err) {
    console.error("FATAL ERROR:", err.message);
    if (err.response?.data) console.error("Google Error:", err.response.data);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: err.message,
    });
  }
};

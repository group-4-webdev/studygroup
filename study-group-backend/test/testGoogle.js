import { createEvent } from "../utils/googleCalendar.js";

(async () => {
  try {
    const now = new Date();
    const event = {
      summary: "Test Event",
      description: "Testing Google Calendar API",
      start: { dateTime: now.toISOString() },
      end: { dateTime: new Date(now.getTime() + 60*60*1000).toISOString() }, // 1 hour later
      attendees: [],
    };

    const result = await createEvent(event);
    console.log("✅ Event created:", result);
  } catch (err) {
    console.error("❌ Google Calendar error:", err);
  }
})();

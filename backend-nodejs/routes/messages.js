// routes/messages.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Send a message to a group
router.post("/send", async (req, res) => {
  const { groupId, sender, text, file_link } = req.body;
  if (!groupId || !sender || (!text && !file_link)) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO messages (group_id, sender, text, file_link, time)
       VALUES (?, ?, ?, ?, NOW())`,
      [groupId, sender, text, file_link || null]
    );

    // Optionally: Fetch the newly inserted message with group info
    const [newMsg] = await db.execute(
      `SELECT m.*, g.group_name 
       FROM messages m
       JOIN groups g ON m.group_id = g.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.json({ message: "Message sent", newMessage: newMsg[0] });
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

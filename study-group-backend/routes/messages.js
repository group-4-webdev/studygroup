import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET all messages for a group
router.get("/:groupId/messages", async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  try {
    const [messages] = await pool.execute(
      `SELECT id, sender_id AS sender, text, file_link AS fileLink,
              DATE_FORMAT(time, '%h:%i %p') AS time
       FROM group_messages
       WHERE group_id = ?
       ORDER BY time ASC`,
      [groupId]
    );
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;

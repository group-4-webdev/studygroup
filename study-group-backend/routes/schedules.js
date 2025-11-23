import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET schedules for a user
router.get("/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  try {
    const [rows] = await pool.query(
      `SELECT s.*, g.group_name AS group_name
       FROM schedules s
       JOIN groups g ON g.id = s.groupId
       JOIN group_members gm ON gm.group_id = s.groupId
       WHERE gm.user_id = ?
       ORDER BY s.start ASC`,
      [userId]
    );
    rows.forEach(r => r.attendees = JSON.parse(r.attendees || "[]"));
    res.json({ schedules: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

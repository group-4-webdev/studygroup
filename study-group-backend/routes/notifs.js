// routes/notifs.js — FINAL WORKING VERSION
import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET ALL NOTIFICATIONS
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
// In notifs.js — make sure requester_id is selected
const [rows] = await pool.query(
  `SELECT 
     id, user_id, title, message, type, related_id, requester_id,
     is_read, is_starred, is_archived, is_deleted, created_at
   FROM notifications 
   WHERE user_id = ? AND is_deleted = 0
   ORDER BY created_at DESC`,
  [userId]
);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK AS READ
router.patch("/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// TOGGLE STAR
router.patch("/:id/star", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE notifications SET is_starred = NOT is_starred WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// TOGGLE ARCHIVE
router.patch("/:id/archive", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE notifications SET is_archived = NOT is_archived WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// DELETE (soft delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE notifications SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
import express from "express";
import db from "../db.js"; // your DB connection (MySQL/Postgres)

const router = express.Router();

// GET schedules for a user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM schedules WHERE userId = ?", [userId]);
    rows.forEach(r => r.attendees = JSON.parse(r.attendees || "[]"));
    res.json({ schedules: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create schedule
router.post("/", async (req, res) => {
  const { userId, title, description, start, end, location, attendees, googleEventId, type } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO schedules (userId, title, description, start, end, location, attendees, googleEventId, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description, start, end, location, JSON.stringify(attendees), googleEventId, type]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update schedule
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, start, end, location, attendees } = req.body;
  try {
    await db.query(
      `UPDATE schedules SET title=?, description=?, start=?, end=?, location=?, attendees=? WHERE id=?`,
      [title, description, start, end, location, JSON.stringify(attendees), id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE schedule
router.delete("/:id", async (req, res) => {
  try {
    await db.query(`DELETE FROM schedules WHERE id=?`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all groups for a user
router.get("/group/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [groups] = await db.query("SELECT * FROM groups WHERE userId = ?", [userId]);
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET members of a group
router.get("/group/:groupId/members", async (req, res) => {
  const { groupId } = req.params;
  try {
    const [members] = await db.query("SELECT email FROM group_members WHERE groupId = ?", [groupId]);
    res.json({ members });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

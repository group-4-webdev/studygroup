import express from "express";
import { pool } from "../../config/db.js";
import { sendNotification } from "../../controllers/admin/notificationsController.js";

const router = express.Router();

// APPROVE ROUTE
router.patch("/approve/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE groups SET status='approved', updated_at=NOW() WHERE id=?",
      [id]
    );

    const [rows] = await pool.query(
      `SELECT u.email, g.group_name, g.created_by 
       FROM groups g 
       JOIN users u ON g.created_by = u.id 
       WHERE g.id=?`,
      [id]
    );

    if (rows.length > 0) {
      const { group_name, created_by } = rows[0];

      await sendNotification(
        created_by,
        "Your Study Group was APPROVED!",
        `Great news! Your group "${group_name}" has been approved and is now visible to all students. Start inviting members!`
      );
    }

    // Optional: tell all admins to refresh
    const io = req.app.get("io");
    io.emit("groupStatusChanged");
    io.emit("groupUpdated");

    res.json({ success: true, message: "Group approved and notification sent" });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DECLINE ROUTE
router.patch("/decline/:id", async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  try {
    await pool.query(
      "UPDATE groups SET status='declined', remarks=?, updated_at=NOW() WHERE id=?",
      [remarks || "No remarks", id]
    );

    const [rows] = await pool.query(
      `SELECT u.email, g.group_name, g.created_by 
       FROM groups g 
       JOIN users u ON g.created_by = u.id 
       WHERE g.id=?`,
      [id]
    );

    if (rows.length > 0) {
      const { group_name, created_by } = rows[0];

      await sendNotification(
        created_by,
        "Your Study Group was Declined",
        `We're sorry, but your group "${group_name}" was declined.\n\nReason: ${remarks || "No remarks provided"}\n\nYou can edit and resubmit!`
      );
    }

    const io = req.app.get("io");
    io.emit("groupStatusChanged");

    res.json({ success: true, message: "Group declined and notification sent" });
  } catch (err) {
    console.error("Decline error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------
// GET all groups
router.get("/list", async (req, res) => {
  try {
    const [groups] = await pool.query("SELECT * FROM groups ORDER BY created_at DESC");
    res.json({ data: groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

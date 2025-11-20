import express from "express";
import { pool } from "../../config/db.js";
import { sendEmail } from "../../utils/admin/email.js";

const router = express.Router();

// PATCH approve group
router.patch("/approve/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE groups SET status='approved', updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [id]
    );

    const [rows] = await pool.query(
      `SELECT u.email, g.group_name FROM groups g 
       JOIN users u ON g.created_by = u.id WHERE g.id=?`,
      [id]
    );

    if (rows.length > 0) {
      const { email, group_name } = rows[0];
      await sendEmail({
        to: email,
        subject: "Your study group was approved!",
        text: `Your group "${group_name}" has been approved. You can now see it in your dashboard.`,
      });
    }

    res.json({ success: true, message: "Group approved and notification sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH decline group
router.patch("/decline/:id", async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body; // optional remarks
  try {
    await pool.query(
      "UPDATE groups SET status='declined', remarks=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [remarks || "No remarks", id]
    );

    const [rows] = await pool.query(
      `SELECT u.email, g.group_name FROM groups g 
       JOIN users u ON g.created_by = u.id WHERE g.id=?`,
      [id]
    );

    if (rows.length > 0) {
      const { email, group_name } = rows[0];
      await sendEmail({
        to: email,
        subject: "Your study group was declined",
        text: `Your group "${group_name}" was declined. Reason: ${remarks || "No remarks"}`,
      });
    }

    res.json({ success: true, message: "Group declined and notification sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all groups (for admin dashboard)
router.get("/admin-list", async (req, res) => {
  try {
    const [groups] = await pool.query(
      "SELECT g.*, u.first_name, u.last_name FROM groups g JOIN users u ON g.created_by = u.id ORDER BY g.created_at DESC"
    );
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

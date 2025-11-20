import { pool } from "../../config/db.js";
import { sendEmail } from "../../utils/admin/email.js";

// GET all groups
export const getGroups = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM groups ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE a group (status + remarks)
export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  try {
    // Update group in DB
    await pool.query(
      "UPDATE groups SET status = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, remarks, id]
    );

    // Fetch creator email and group name
    const [rows] = await pool.query(
      `SELECT u.email, g.group_name 
       FROM groups g 
       JOIN users u ON g.created_by = u.id 
       WHERE g.id = ?`,
      [id]
    );

    if (rows.length > 0) {
      const { email, group_name } = rows[0];

      // Send notification email
      if (status === "approved") {
        await sendEmail({
          to: email,
          subject: "Your study group was approved!",
          text: `Your group "${group_name}" has been approved. You can now see it in your dashboard.`,
        });
      } else if (status === "declined") {
        await sendEmail({
          to: email,
          subject: "Your study group was declined",
          text: `Your group "${group_name}" was declined. Reason: ${remarks}`,
        });
      }
    }

    res.json({ message: "Group updated and notification sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a group
export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM groups WHERE id = ?", [id]);
    res.json({ message: "Group deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

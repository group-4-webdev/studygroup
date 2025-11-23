// study-group-backend/controllers/admin/notificationsController.js
import { pool } from "../../config/db.js";
import { getIO } from "../../utils/admin/socket.js";

/**
 * GET /api/notifications/:user_id
 * returns non-deleted notifications for a user (ordered newest first)
 */
export const getNotifications = async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, title, message, is_read, is_starred, is_archived, is_deleted, created_at
       FROM notifications
       WHERE user_id = ? AND is_deleted = 0
       ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("getNotifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SEND NOTIFICATION TO USER (used by admin routes)
export const sendNotification = async (userId, title, message) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, title, message, created_at)
       VALUES (?, ?, ?, NOW())`,
      [userId, title, message]
    );

    const [newNotif] = await pool.query(
      `SELECT id, user_id, title, message, is_read, is_starred, is_archived, is_deleted, created_at
       FROM notifications WHERE id = ?`,
      [result.insertId]
    );

    // SEND VIA SOCKET.IO SO INBOX UPDATES LIVE
    const io = getIO();
    io.to(`user_${userId}`).emit("notification", newNotif[0]);

    return newNotif[0];
  } catch (err) {
    console.error("sendNotification error:", err);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * body: { is_read: 1 } or { is_read: 0 }
 */
export const setRead = async (req, res) => {
  const { id } = req.params;
  const { is_read } = req.body;
  try {
    await pool.query("UPDATE notifications SET is_read = ? WHERE id = ?", [is_read ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("setRead:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/notifications/:id/star
 * body: { is_starred: 1 } or { is_starred: 0 }
 */
export const toggleStar = async (req, res) => {
  const { id } = req.params;
  const { is_starred } = req.body;
  try {
    await pool.query("UPDATE notifications SET is_starred = ? WHERE id = ?", [is_starred ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("toggleStar:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/notifications/:id/archive
 * body: { is_archived: 1 } or { is_archived: 0 }
 */
export const toggleArchive = async (req, res) => {
  const { id } = req.params;
  const { is_archived } = req.body;
  try {
    await pool.query("UPDATE notifications SET is_archived = ? WHERE id = ?", [is_archived ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("toggleArchive:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE (soft) /api/notifications/:id
 * sets is_deleted = 1
 */
export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE notifications SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteNotification:", err);
    res.status(500).json({ message: "Server error" });
  }
};

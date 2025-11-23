const express = require("express");
const router = express.Router();
const db = require("../db");

// ----------------------------
// Create Group
router.post("/create", (req, res) => {
  const {
    group_name,
    description,
    created_by,
    size,
    course,
    topic,
    location,
  } = req.body;

  if (!group_name || !description || !created_by || !size || !course || !topic || !location) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

const sqlInsertGroup = `
  INSERT INTO groups 
    (group_name, description, created_by, size, current_members, course, topic, location, status)
  VALUES (?, ?, ?, ?, 1, ?, ?, ?, 'pending')
`;

  db.query(
    sqlInsertGroup,
    [group_name, description, created_by, size, course, topic, location],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      const groupId = result.insertId;

      // Add the creator to group_members
      const sqlInsertMember = `INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`;
      db.query(sqlInsertMember, [groupId, created_by], (err2) => {
        if (err2) {
          console.log(err2);
          return res.status(500).json({ success: false, message: "Database error" });
        }

        return res.json({
          success: true,
          message: "Group created successfully, waiting for admin approval",
          group: {
            id: groupId,
            group_name,
            description,
            created_by,
            size,
            course,
            topic,
            location,
            current_members: 1,
            status: "pending",
          },
        });
      });
    }
  );
});

// ----------------------------
// List all groups
router.get("/list", (req, res) => {
  db.query("SELECT * FROM groups ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json({ success: true, data: results });
  });
});

// ----------------------------
// Get groups for a specific user
// GET user-specific group status
router.get("/user-status/:userId", async (req, res) => {
  const { userId } = req.params;
  
  const sql = `
    SELECT g.id, g.group_name, g.status, g.remarks
    FROM groups g
    WHERE g.created_by = ?
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    const data = {};
    results.forEach(g => {
      data[g.id] = g.status;
      data[g.id + "_remarks"] = g.remarks || "";
    });
    res.json({ success: true, data });
  });
});

// ----------------------------
// Get messages for a group
router.get("/:groupId/messages", (req, res) => {
  const { groupId } = req.params;
  const sql = "SELECT * FROM messages WHERE group_id = ? ORDER BY time ASC";
  db.query(sql, [groupId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", err });
    res.json({ success: true, messages: results });
  });
});

// ----------------------------
// Post a message to a group
router.post("/:groupId/message", (req, res) => {
  const { groupId } = req.params;
  const { sender, text, fileLink } = req.body;

  if (!sender || (!text && !fileLink)) {
    return res.status(400).json({ success: false, message: "Message text or file required" });
  }

  const sql = `
    INSERT INTO messages (group_id, sender, text, file_link, time)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [groupId, sender, text || "", fileLink || null, new Date()];

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", err });

    db.query(
      "SELECT * FROM messages WHERE group_id = ? ORDER BY time ASC",
      [groupId],
      (err2, results) => {
        if (err2) return res.status(500).json({ success: false, message: "Database error", err2 });

        const io = req.app.get("io"); // get the Socket.IO instance
        io.to(`group_${groupId}`).emit("newNotification", {
          type: "message",
          groupId,
          sender,
          text,
          time: new Date(),
        });

        res.json({ success: true, messages: results });
      }
    );
  });
});

module.exports = router;

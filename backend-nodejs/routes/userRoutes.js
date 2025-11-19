const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile_photos"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Middleware to simulate authentication
// Replace this with real auth middleware
const fakeAuth = (req, res, next) => {
  req.user = { id: 1 }; // Assuming user with id=1 is logged in
  next();
};

// GET current user
router.get("/me", fakeAuth, (req, res) => {
  const db = req.db;
  const sql = "SELECT id, first_name, middle_name, last_name, username, email, bio, profile_photo FROM users WHERE id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    // Add full URL to profile photo
    const user = results[0];
    if (user.profile_photo) {
      user.profile_photo = `http://localhost:3000/uploads/profile_photos/${user.profile_photo}`;
    }
    res.json(user);
  });
});

// PUT update user
router.put("/me", fakeAuth, upload.single("profile_photo"), (req, res) => {
  const db = req.db;
  const userId = req.user.id;

  const { first_name, middle_name, last_name, username, bio } = req.body;
  let profile_photo = req.file ? req.file.filename : null;

  let sql = "UPDATE users SET first_name = ?, middle_name = ?, last_name = ?, username = ?, bio = ?";
  let values = [first_name, middle_name, last_name, username, bio];

  if (profile_photo) {
    sql += ", profile_photo = ?";
    values.push(profile_photo);
  }

  sql += " WHERE id = ?";
  values.push(userId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Return the updated user
    const selectSql = "SELECT id, first_name, middle_name, last_name, username, email, bio, profile_photo FROM users WHERE id = ?";
    db.query(selectSql, [userId], (err2, results) => {
      if (err2) {
        console.error("Error fetching updated user:", err2);
        return res.status(500).json({ message: "Database error" });
      }
      const user = results[0];
      if (user.profile_photo) {
        user.profile_photo = `http://localhost:3000/uploads/profile_photos/${user.profile_photo}`;
      }
      res.json(user);
    });
  });
});

module.exports = router;

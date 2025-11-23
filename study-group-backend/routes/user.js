const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// -------------------- Multer config --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// -------------------- GET /api/users/me --------------------
router.get("/me", (req, res) => {
  const userId = 1; // TODO: Replace with authenticated user ID

  const sql = `
    SELECT id, first_name, middle_name, last_name, username, email, bio, profile_photo
    FROM users
    WHERE id = ?
  `;
  req.db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const user = results[0];
    if (user.profile_photo) {
      user.profile_photo = `${req.protocol}://${req.get("host")}/uploads/${user.profile_photo}`;
    }
    res.json(user);
  });
});



// -------------------- PUT /api/users/me --------------------
router.put("/me", upload.single("profile_photo"), (req, res) => {
  const userId = 1; // TODO: Replace with authenticated user ID
  const { first_name, middle_name, last_name, username, bio } = req.body;

  // Get current photo if not uploading new one
  req.db.query("SELECT profile_photo FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    let profile_photo = req.file ? req.file.filename : results[0].profile_photo;

    const sql = `
      UPDATE users
      SET first_name = ?, middle_name = ?, last_name = ?, username = ?, bio = ?, profile_photo = ?
      WHERE id = ?
    `;

    req.db.query(sql, [first_name, middle_name, last_name, username, bio, profile_photo, userId], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const updatedUser = { id: userId, first_name, middle_name, last_name, username, bio, profile_photo };
      if (updatedUser.profile_photo) {
        updatedUser.profile_photo = `${req.protocol}://${req.get("host")}/uploads/${updatedUser.profile_photo}`;
      }
      res.json(updatedUser);
    });
  });
});

module.exports = router;

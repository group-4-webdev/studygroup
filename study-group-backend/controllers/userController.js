const path = require("path");

exports.getMe = (req, res) => {
  const db = req.db;

  const userId = 1; // Replace with authenticated user id when ready
  db.query(
    "SELECT id, first_name, middle_name, last_name, username, email, bio, profile_photo FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!results[0]) return res.status(404).json({ error: "User not found" });

      const user = results[0];

      // Add full URL for profile photo
      if (user.profile_photo) {
        user.profile_photo = `${req.protocol}://${req.get("host")}/${user.profile_photo}`;
      }

      res.json(user);
    }
  );
};

exports.updateMe = (req, res) => {
  const db = req.db;
  const userId = 1; // Replace with authenticated user id when ready

  const { first_name, middle_name, last_name, username, bio } = req.body;

  let profile_photo = null;
  if (req.file) {
    profile_photo = path.join(req.file.destination, req.file.filename).replace(/\\/g, "/");
  }

  const query = `
    UPDATE users 
    SET first_name = ?, middle_name = ?, last_name = ?, username = ?, bio = ?
    ${profile_photo ? ", profile_photo = ?" : ""}
    WHERE id = ?
  `;

  const params = profile_photo
    ? [first_name, middle_name, last_name, username, bio, profile_photo, userId]
    : [first_name, middle_name, last_name, username, bio, userId];

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Return updated user
    db.query(
      "SELECT id, first_name, middle_name, last_name, username, email, bio, profile_photo FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const user = results[0];

        // Add full URL for profile photo
        if (user.profile_photo) {
          user.profile_photo = `${req.protocol}://${req.get("host")}/${user.profile_photo}`;
        }

        res.json(user);
      }
    );
  });
};

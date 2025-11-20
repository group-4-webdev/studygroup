import { pool } from "../config/db.js";

export const checkAccountType = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT password, google_id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ type: "none", message: "User not found" });
    }

    const user = users[0];

    if (user.google_id && !user.password) {
      return res.json({ type: "google", message: "Google Sign-In user" });
    }

    if (user.password && !user.google_id) {
      return res.json({ type: "manual", message: "Manual registration user" });
    }

    return res.json({ type: "hybrid", message: "User has both Google & manual credentials" });

  } catch (err) {
    console.error("Check Account Type Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

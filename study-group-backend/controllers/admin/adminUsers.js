import { pool } from "../../config/db.js";

// GET all users
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, first_name, middle_name, last_name, username, email, status, created_at FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE a user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, middle_name, last_name, username, email, status } = req.body;

  try {
    await pool.query(
      `UPDATE users 
       SET first_name=?, middle_name=?, last_name=?, username=?, email=?, status=? 
       WHERE id=?`,
      [first_name, middle_name, last_name, username, email, status, id]
    );
    res.json({ message: "User updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

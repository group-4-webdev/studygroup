import { pool } from "../../config/db.js";

// GET all groups
export const getGroups = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM groups");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE a group
export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, course, status, members } = req.body;

  try {
    await pool.query(
      `UPDATE groups 
       SET name=?, course=?, status=?, members=? 
       WHERE id=?`,
      [name, course, status, members, id]
    );
    res.json({ message: "Group updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a group
export const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM groups WHERE id=?", [id]);
    res.json({ message: "Group deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

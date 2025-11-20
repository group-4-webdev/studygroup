import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js"; 
import { isAllowedWMSUEmail } from "../utils/validateWMSUEmail.js";

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const createAccount = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const { first_name, middle_name, last_name, username, email, password } = req.body;

    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "INSERT INTO users (first_name, middle_name, last_name, username, email, password, is_verified, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [first_name, middle_name, last_name, username, email, hashedPassword, false, verificationCode]
    );

    console.log("✅ User inserted. Sending verification email to:", email);

    const verificationLink = `http://localhost:5173/verify?email=${encodeURIComponent(email)}`;

    await sendEmail(
      email,
      "Verify your Crimsons Study Squad Account",
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #800000;">Crimsons Study Squad</h2>
        <p>Hi ${first_name},</p>
        <p>Thank you for registering! To verify your account, copy the code below and paste it in the verification page:</p>
        
        <p style="font-style: italic; color: #555;">
          Copy this code and paste it in the verification page. You can also click the link below to open the page with your email pre-filled in the same tab.
        </p>

        <h3 style="background: #f4f4f4; padding: 10px; display: inline-block;">${verificationCode}</h3>
        <p>Alternatively, you can click the link below to open the verification page with your email pre-filled:</p>
        <a href="${verificationLink}" style="color: #800000; text-decoration: underline; font-weight: bold;">
          Open Verification Page
        </a>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br/>
        <p>– Crimsons Study Squad Team</p>
      </div>
      `
    );

    return res.status(201).json({
      message: "Account created successfully! Please check your WMSU email for the verification code.",
    });
  } catch (error) {
    console.error("Error during createAccount:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];
    if (!user.password) return res.status(400).json({ message: "Use Google Sign-In" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.is_verified) return res.status(400).json({ message: "Account not verified" });

    const token = generateToken(user.id);
    res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { email, code } = req.body;
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND verification_code = ?",
      [email, code]
    );
    if (users.length === 0) return res.status(400).json({ message: "Invalid verification code" });

    if (!isAllowedWMSUEmail(email)) {
      return res.status(400).json({ message: "WMSU email not allowed (outside 5-year limit)" });
    }

    await pool.query(
      "UPDATE users SET is_verified = true, verification_code = NULL WHERE id = ?",
      [users[0].id]
    );

    res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const checkGoogleAccount = async (req, res) => {
  const { email } = req.query;
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.json({ isGoogleOnly: false });

    const user = users[0];
    res.json({ isGoogleOnly: !user.password && user.google_id ? true : false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ isGoogleOnly: false });
  }
};


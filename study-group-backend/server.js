// study-group-backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Import Database Pool
import { pool } from "./config/db.js"; 

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import schedulesRoutes from "./routes/schedules.js";
import adminRoutes from "./routes/admin/adminRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import groupAdminRoutes from "./routes/admin/groupAdminRoutes.js";
import notificationRoutes from "./routes/admin/notificationRoutes.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/userRoutes.js";
import notifRoutes from "./routes/notifs.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Multer Setup (Local Uploads) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Local Upload Endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  // Construct public URL
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ fileUrl, filename: req.file.originalname });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use('/api/password', passwordRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/group", groupRoutes);          // group info & join
app.use("/api/calendar", calendarRoutes);     // schedules / calendar
app.use("/api/schedules", schedulesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", groupAdminRoutes);
app.use("/api/notifications", notificationRoutes);


app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifs", notifRoutes);

// === Socket.io Setup ===
const io = new IOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on("join_group", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User ${socket.id} joined group_${groupId}`);
  });

  socket.on("send_message", async ({ groupId, message }) => {
    try {
      // 1. Save to DB using 'pool'
      const [result] = await pool.execute(
        `INSERT INTO messages (group_id, sender, text, file_link, time)
         VALUES (?, ?, ?, ?, NOW())`,
        [groupId, message.sender, message.text || null, message.fileLink || null]
      );

      // 2. Fetch formatted message
      const [newMsg] = await pool.execute(
        `SELECT 
           id, 
           sender, 
           text, 
           file_link AS fileLink,
           DATE_FORMAT(time, '%l:%i %p') AS time
         FROM messages 
         WHERE id = ?`,
        [result.insertId]
      );

      // 3. Broadcast
      io.to(`group_${groupId}`).emit("receive_message", {
        groupId: parseInt(groupId),
        message: newMsg[0],
      });

    } catch (err) {
      console.error("Socket send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
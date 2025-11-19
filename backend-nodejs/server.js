require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = express.json();
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser);

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make db accessible in req for routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Serve profile photos statically
app.use("/uploads/profile_photos", express.static("uploads/profile_photos")); // multer saves photos here

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Node.js backend running' });
});

// Import group routes
const groupRoutes = require('./routes/group');
app.use('/api/group', groupRoutes);

// Import user routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

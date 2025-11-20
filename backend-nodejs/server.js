require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = express.json();

const app = express();
app.use(cors());
app.use(bodyParser);

// Health check
app.get('/', (req, res) => res.json({ message: 'Node.js backend running' }));

// Use the pool from db.js everywhere
const groupRoutes = require('./routes/group');
app.use('/api/group', groupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

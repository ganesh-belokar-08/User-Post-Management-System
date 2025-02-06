require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

connectDB();
const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

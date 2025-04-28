// backend/server.js

require('dotenv').config(); // Load biến môi trường từ file .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const port = process.env.PORT || 5000; // Dùng cổng từ .env hoặc mặc định 5000

// Middleware cơ bản
app.use(cors());
app.use(express.json()); // Cho phép server đọc dữ liệu JSON từ request body
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); // Đường dẫn cho các route liên quan đến jobs

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Route kiểm tra đơn giản
app.get('/api', (req, res) => {
  res.json({ message: 'Chào mừng đến với TalentHub Backend API!' });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Backend server đang chạy trên cổng ${port}`);
});
// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Import Routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes'); // Giữ lại cho public jobs
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // <<< THÊM IMPORT
const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
// --- THÊM MIDDLEWARE LOG REQUEST TOÀN CỤC NGAY ĐÂY ---
app.use((req, res, next) => {
  // Log mọi request đến server
  console.log(`>>> [${new Date().toISOString()}] SERVER NHẬN REQUEST: ${req.method} ${req.originalUrl}`);
  // Bạn có thể log thêm headers nếu muốn debug sâu hơn (sẽ rất nhiều log)
  // console.log('>>> Request Headers:', req.headers);
  next(); // Quan trọng: Chuyển quyền điều khiển cho middleware tiếp theo
});
// --- KẾT THÚC MIDDLEWARE LOG TOÀN CỤC ---
// --- THÊM MIDDLEWARE STATIC FILES ---
// Khi frontend yêu cầu /uploads/cvs/ten_file.pdf, express sẽ tìm file trong thư mục backend/uploads/cvs
app.use('/uploads/cvs', express.static(path.join(__dirname, 'uploads', 'cvs')));
console.log(`Serving static files from: ${path.join(__dirname, 'uploads', 'cvs')}`);
const companyRoutes = require('./routes/companyRoutes');
const testRoutes = require('./routes/testRoutes');
// --- THÊM MIDDLEWARE XỬ LÝ LỖI TOÀN CỤC ---
app.use((err, req, res, next) => {
  console.error("--- MIDDLEWARE XỬ LÝ LỖI BẮT ĐƯỢC ---");
  console.error("Tên lỗi:", err.name);
  console.error("Thông báo lỗi:", err.message);
  console.error("Stack:", err.stack); // Log stack trace để debug sâu hơn

  // Xử lý lỗi cụ thể từ Multer
  if (err instanceof multer.MulterError) {
      console.error("Lỗi Multer cụ thể:", err.code);
      return res.status(400).json({ message: `Lỗi tải file: ${err.message}`, code: err.code });
  }

  // Xử lý lỗi loại file từ fileFilter của chúng ta
  if (err.message.startsWith('Loại file không hợp lệ')) {
      return res.status(400).json({ message: err.message });
  }

  // Trả về lỗi mặc định
  res.status(err.status || 500).json({
      message: err.message || 'Lỗi máy chủ không xác định.',
      // Có thể thêm stack trong môi trường dev
      // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
// --- KẾT THÚC MIDDLEWARE XỬ LÝ LỖI ---
// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); // Public job routes
app.use('/api/applications', applicationRoutes); // Application routes
app.use('/api/users', userRoutes); // <<< THÊM DÒNG NÀY (User profile routes)
app.use('/api/companies', companyRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notifications', notificationRoutes);
// Kết nối MongoDB
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
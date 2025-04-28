// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router(); // Tạo một router object
const authController = require('../controllers/authController'); // Import controller

// Định nghĩa route cho Đăng ký
// POST /api/auth/register
router.post('/register', authController.registerUser);

// Định nghĩa route cho Đăng nhập
// POST /api/auth/login
router.post('/login', authController.loginUser);

// (Tùy chọn) Thêm route để lấy thông tin user hiện tại nếu cần
// GET /api/auth/me (Sẽ cần middleware xác thực JWT sau)
// router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router; // Export router để sử dụng trong server.js
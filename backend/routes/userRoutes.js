// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Chỉ cần protect
const upload = require('../middleware/uploadMiddleware'); 

// Route để LẤY thông tin profile của user đang đăng nhập
// GET /api/users/profile
router.get('/profile', protect, userController.getUserProfile);

// Route để CẬP NHẬT profile của user đang đăng nhập
// PUT /api/users/profile
router.put('/profile', protect, userController.updateUserProfile);
// Có thể thêm các route khác liên quan đến user ở đây sau
router.post(
    '/profile/cv',            // <<< Đường dẫn chính xác
    protect,                  // <<< Cần đăng nhập
    upload.single('cvFile'),  // <<< Middleware xử lý file upload tên 'cvFile'
    userController.uploadCv   // <<< Gọi controller uploadCv
);

module.exports = router;
// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); // Chỉ cần protect, không cần authorize cụ thể

// Lấy tất cả thông báo cho người dùng đang đăng nhập
router.get('/', protect, notificationController.getNotificationsForUser);

// Đánh dấu một thông báo là đã đọc
router.put('/:notificationId/read', protect, notificationController.markNotificationAsRead);

// Đánh dấu tất cả thông báo là đã đọc
router.put('/read-all', protect, notificationController.markAllNotificationsAsRead);

// (Tùy chọn) Xóa một thông báo
// router.delete('/:notificationId', protect, notificationController.deleteNotification);

module.exports = router;

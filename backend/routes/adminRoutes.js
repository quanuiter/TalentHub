// code/backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Sẽ tạo controller này
const { protect, authorize } = require('../middleware/authMiddleware');

// Middleware bảo vệ tất cả các route trong file này chỉ cho admin
router.use(protect);
router.use(authorize('admin'));

// Lấy danh sách tất cả người dùng (có thể lọc theo role: employer, candidate)
router.get('/users', adminController.getAllUsers); 
// Lấy danh sách công việc cần phê duyệt (hoặc tất cả công việc với trạng thái phê duyệt)
router.get('/jobs/pending-approval', adminController.getPendingJobs);
router.get('/jobs/all', adminController.getAllJobsForAdmin); // Để admin xem tất cả jobs với các trạng thái

// Phê duyệt một hoặc nhiều công việc
router.put('/jobs/approve', adminController.approveJobs); // Nhận một mảng Job IDs trong body

// Từ chối một hoặc nhiều công việc
router.put('/jobs/reject', adminController.rejectJobs); // Nhận một mảng Job IDs và lý do từ chối trong body

module.exports = router;
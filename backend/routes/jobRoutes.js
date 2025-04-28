// backend/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController'); // Import job controller
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middlewares

// --- Định nghĩa các Routes cho Jobs ---

// GET /api/jobs - Lấy danh sách tất cả Jobs (công khai)
router.get('/', jobController.getAllJobs);

// GET /api/jobs/:id - Lấy chi tiết một Job (công khai)
router.get('/:id', jobController.getJobById);

// POST /api/jobs - Tạo một Job mới (yêu cầu đăng nhập, vai trò 'employer')
router.post(
    '/', // Đường dẫn gốc cho jobs
    protect, // 1. Middleware kiểm tra token JWT hợp lệ
    authorize('employer'), // 2. Middleware kiểm tra vai trò phải là 'employer'
    jobController.createJob // 3. Hàm controller xử lý tạo job
);

// PUT /api/jobs/:id - Cập nhật một Job (yêu cầu đăng nhập, vai trò 'employer', chủ sở hữu)
router.put(
    '/:id', // Đường dẫn chứa ID của job cần cập nhật
    protect,
    authorize('employer'),
    jobController.updateJob // Controller sẽ kiểm tra quyền sở hữu bên trong
);

// DELETE /api/jobs/:id - Xóa một Job (yêu cầu đăng nhập, vai trò 'employer', chủ sở hữu)
router.delete(
    '/:id', // Đường dẫn chứa ID của job cần xóa
    protect,
    authorize('employer'),
    jobController.deleteJob // Controller sẽ kiểm tra quyền sở hữu bên trong
);


module.exports = router; // Export router để server.js sử dụng
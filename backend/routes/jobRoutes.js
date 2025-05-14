// backend/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Định nghĩa các Routes cho Jobs ---

// GET /api/jobs - Lấy danh sách tất cả Jobs (công khai)
router.get('/', jobController.getAllJobs);

// <<< ĐẶT ROUTE /my-jobs LÊN TRƯỚC /:id >>>
// GET /api/jobs/my-jobs - Lấy jobs của employer đang đăng nhập
router.get(
    '/my-jobs',        // Đường dẫn cụ thể
    protect,           // Cần đăng nhập
    authorize('employer'), // Cần là employer
    jobController.getEmployerJobs // Hàm controller đúng
);
router.get('/company/:companyId', jobController.getJobsByCompany);
// GET /api/jobs/:id - Lấy chi tiết một Job (công khai)
// Route này phải đặt sau /my-jobs để tránh xung đột
router.get('/:id', jobController.getJobById);

// POST /api/jobs - Tạo một Job mới
router.post(
    '/',
    protect,
    authorize('employer'),
    jobController.createJob
);

// PUT /api/jobs/:id - Cập nhật một Job
router.put(
    '/:id',
    protect,
    authorize('employer'),
    jobController.updateJob
);

// DELETE /api/jobs/:id - Xóa một Job
router.delete(
    '/:id',
    protect,
    authorize('employer'),
    jobController.deleteJob
);
// GET /api/jobs/:jobId/applicants - Employer lấy danh sách ứng viên cho 1 job
router.get(
    '/:jobId/applicants', 
    protect, 
    authorize('employer'), 
    applicationController.getApplicantsForJob
);

module.exports = router;
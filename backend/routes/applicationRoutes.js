// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/applications - Ứng viên tạo đơn ứng tuyển mới
router.post('/', protect, authorize('candidate'), applicationController.createApplication);

// GET /api/applications/candidate - Ứng viên xem các đơn đã nộp
router.get('/candidate', protect, authorize('candidate'), applicationController.getCandidateApplications);

// PUT /api/applications/:appId/status - Employer cập nhật trạng thái
router.put('/:appId/status', protect, authorize('employer'), applicationController.updateApplicationStatus);

// Có thể thêm các route khác sau: GET /api/applications/:appId (lấy chi tiết), DELETE ...

module.exports = router;
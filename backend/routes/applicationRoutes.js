// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/applications - Ứng viên tạo đơn ứng tuyển mới
router.post('/', protect, authorize('candidate'), applicationController.createApplication);

// GET /api/applications/employer/all - Employer lấy tất cả ứng viên của mình
router.get(
    '/employer/all',
    protect,
    authorize('employer'),
    applicationController.getAllApplicantsForEmployer
);

// GET /api/applications/candidate - Ứng viên xem các đơn đã nộp
router.get(
    '/candidate',
    protect,
    authorize('candidate'),
    applicationController.getCandidateApplications
);

// GET /api/applications/candidate/scheduled-interviews - Ứng viên lấy lịch hẹn (phỏng vấn & test)
router.get(
    '/candidate/scheduled-interviews',
    protect,
    authorize('candidate'),
    applicationController.getCandidateScheduledInterviews
);

// PUT /api/applications/:appId/status - Employer cập nhật trạng thái
router.put(
    '/:appId/status',
    protect,
    authorize('employer'),
    applicationController.updateApplicationStatus
);

// PUT /api/applications/:appId/evaluate - Employer đánh giá ứng viên
router.put(
    '/:appId/evaluate',
    protect,
    authorize('employer'),
    applicationController.evaluateApplication
);

// PUT /api/applications/:appId/schedule-interview - Employer lên lịch phỏng vấn
router.put( // Hoặc POST, đảm bảo frontend gọi đúng phương thức
    '/:appId/schedule-interview',
    protect,
    authorize('employer'),
    applicationController.scheduleInterview
);

// POST /api/applications/:appId/assign-test - Employer giao bài test
router.post(
    '/:appId/assign-test',
    protect,
    authorize('employer'),
    applicationController.assignTestToApplicant
);

module.exports = router;

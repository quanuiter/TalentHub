// backend/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/applications - Ứng viên tạo đơn ứng tuyển mới
router.post('/', protect, authorize('candidate'), applicationController.createApplication);

router.get(
    '/employer/all',
    protect,
    authorize('employer'),
    applicationController.getAllApplicantsForEmployer
);
// GET /api/applications/candidate - Ứng viên xem các đơn đã nộp
router.get('/candidate', protect, authorize('candidate'), applicationController.getCandidateApplications);

// PUT /api/applications/:appId/status - Employer cập nhật trạng thái
router.put('/:appId/status', protect, authorize('employer'), applicationController.updateApplicationStatus);

// PUT /api/applications/:appId/evaluate - Employer đánh giá ứng viên
router.put('/:appId/evaluate', protect, authorize('employer'), applicationController.evaluateApplication);
router.put(
    '/:appId/schedule-interview',
    protect,
    authorize('employer'),
    applicationController.scheduleInterview
);
module.exports = router;

router.get(
    '/candidate/scheduled-interviews',
    protect,
    authorize('candidate'),
    applicationController.getCandidateScheduledInterviews
);
// code/backend/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Middleware để bảo vệ tất cả các route test và yêu cầu vai trò employer
router.use(protect);
router.use(authorize('employer'));

// GET /api/tests/my-tests - Lấy danh sách bài test của employer đang đăng nhập
router.get('/my-tests', testController.getMyTests);

// POST /api/tests - Tạo bài test mới
router.post('/', testController.createTest);

// GET /api/tests/:id - Lấy chi tiết một bài test (nếu cần)
router.get('/:id', testController.getTestById);

// PUT /api/tests/:id - Cập nhật bài test
router.put('/:id', testController.updateTest);

// DELETE /api/tests/:id - Xóa bài test
router.delete('/:id', testController.deleteTest);

module.exports = router;
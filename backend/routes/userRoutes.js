// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Sửa authorize
const upload = require('../middleware/uploadMiddleware'); 

// Route để LẤY thông tin profile của user đang đăng nhập
router.get('/profile', protect, userController.getUserProfile);

// Route để CẬP NHẬT profile của user đang đăng nhập
router.put('/profile', protect, userController.updateUserProfile);

// Route để UPLOAD CV cho candidate
router.post(
    '/profile/cv',
    protect,
    authorize('candidate'), // Chỉ candidate mới được upload CV qua route này
    upload.single('cvFile'),
    userController.uploadCv
);

// >>> THÊM ROUTE MỚI CHO EMPLOYER DASHBOARD STATS <<<
router.get(
    '/employer/dashboard-stats', // Đường dẫn mới
    protect,                     // Yêu cầu đăng nhập
    authorize('employer'),       // Chỉ employer mới được truy cập
    userController.getEmployerDashboardStats // Gọi hàm controller mới
);
// >>> ROUTES MỚI CHO SAVED JOBS (CANDIDATE) <<<
router.post( // Dùng POST để toggle (lưu/bỏ lưu) có thể đơn giản hơn là PUT và DELETE riêng
    '/saved-jobs/:jobId',
    protect,
    authorize('candidate'),
    userController.toggleSaveJob
);

router.get(
    '/saved-jobs',
    protect,
    authorize('candidate'),
    userController.getSavedJobs
);

router.delete(
    '/profile/cv/:cvId', 
    protect, 
    authorize('candidate'), 
    userController.deleteUserCv
);
// >>> KẾT THÚC ROUTES MỚI <<<
module.exports = router;

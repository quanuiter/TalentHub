// code/backend/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware.js');
// GET /api/companies - Lấy danh sách tất cả Companies (công khai)
router.get(
    '/my-profile',
    protect, // Yêu cầu đăng nhập
    authorize('employer'), // Chỉ cho phép employer
    companyController.getMyCompanyProfile
);

// PUT /api/companies/my-profile - NTD cập nhật hồ sơ công ty của mình
router.put(
    '/my-profile',
    protect,
    authorize('employer'),
    companyController.updateMyCompanyProfile
);
router.get('/', companyController.getAllCompanies);

// GET /api/companies/:id - Lấy chi tiết một Company (công khai)
router.get('/:id', companyController.getCompanyById);
module.exports = router;
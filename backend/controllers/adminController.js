// backend/controllers/adminController.js
const User = require('../models/User');
const Job = require('../models/Job');
const mongoose = require('mongoose');

/**
 * @desc   Lấy danh sách tất cả người dùng (có thể lọc và tìm kiếm)
 * @route  GET /api/admin/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        const queryOptions = {};

        if (role && ['candidate', 'employer'].includes(role)) {
            queryOptions.role = role;
        }

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            queryOptions.$or = [
                { fullName: searchRegex },
                { email: searchRegex },
                { companyName: searchRegex } // Nếu muốn tìm cả trong companyName của employer
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalUsers = await User.countDocuments(queryOptions);
        const users = await User.find(queryOptions)
            .select('-password -resetPasswordToken -resetPasswordExpire') // Loại bỏ các trường nhạy cảm
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalUsers / limitNum);

        res.status(200).json({
            success: true,
            totalUsers,
            totalPages,
            currentPage: pageNum,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error('Error in getAllUsers (admin):', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách người dùng.' });
    }
};

/**
 * @desc   Lấy danh sách công việc đang chờ phê duyệt
 * @route  GET /api/admin/jobs/pending-approval
 * @access Private/Admin
 */
exports.getPendingJobs = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const queryOptions = { approvalStatus: 'Pending' };

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            queryOptions.$or = [
                { title: searchRegex },
                { companyName: searchRegex }, // Giả sử Job model có companyName
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalJobs = await Job.countDocuments(queryOptions);
        const jobs = await Job.find(queryOptions)
            .populate('companyId', 'name logo') // Populate thông tin công ty nếu cần
            .populate('postedBy', 'fullName email') // Populate thông tin người đăng (employer)
            .sort(sort.split(',').join(' '))
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalJobs / limitNum);

        res.status(200).json({
            success: true,
            totalJobs,
            totalPages,
            currentPage: pageNum,
            count: jobs.length,
            data: jobs,
        });
    } catch (error) {
        console.error('Error in getPendingJobs (admin):', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách công việc chờ duyệt.' });
    }
};


/**
 * @desc   Admin lấy tất cả công việc (có thể lọc theo trạng thái, trạng thái phê duyệt)
 * @route  GET /api/admin/jobs/all
 * @access Private/Admin
 */
exports.getAllJobsForAdmin = async (req, res) => {
    try {
        const { 
            search, 
            page = 1, 
            limit = 10, 
            sort = '-createdAt', 
            approvalStatus, // Thêm filter theo approvalStatus
            status // Thêm filter theo status của job (Active, Inactive, etc.)
        } = req.query;

        const queryOptions = {};

        if (approvalStatus && ['Pending', 'Approved', 'Rejected'].includes(approvalStatus)) {
            queryOptions.approvalStatus = approvalStatus;
        }
        if (status) { // Giả sử status của job là 'Active', 'Inactive', 'Expired'
            queryOptions.status = status;
        }


        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            queryOptions.$or = [
                { title: searchRegex },
                { companyName: searchRegex },
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalJobs = await Job.countDocuments(queryOptions);
        const jobs = await Job.find(queryOptions)
            .populate('companyId', 'name logo')
            .populate('postedBy', 'fullName email')
            .sort(sort.split(',').join(' '))
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalJobs / limitNum);

        res.status(200).json({
            success: true,
            totalJobs,
            totalPages,
            currentPage: pageNum,
            count: jobs.length,
            data: jobs,
        });
    } catch (error) {
        console.error('Error in getAllJobsForAdmin (admin):', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy tất cả công việc cho admin.' });
    }
};


/**
 * @desc   Phê duyệt một hoặc nhiều công việc
 * @route  PUT /api/admin/jobs/approve
 * @access Private/Admin
 */
exports.approveJobs = async (req, res) => {
    try {
        const { jobIds } = req.body;
        const adminId = req.user.userId; // Đã sửa ở các bước trước, đảm bảo là req.user.userId

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID công việc để phê duyệt.' });
        }
        if (!adminId) {
             return res.status(401).json({ success: false, message: 'Không thể xác định quản trị viên.' });
        }

        const updateResult = await Job.updateMany(
            { _id: { $in: jobIds.map(id => new mongoose.Types.ObjectId(id)) }, approvalStatus: 'Pending' },
            {
                $set: {
                    approvalStatus: 'Approved',
                    status: 'Active', // << THÊM DÒNG NÀY: Chuyển status thành Active khi duyệt
                    approvedBy: adminId,
                    approvedAt: Date.now()
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'Không có công việc nào được phê duyệt. Có thể chúng đã được xử lý hoặc ID không đúng.' });
        }

        res.status(200).json({ success: true, message: `${updateResult.modifiedCount} công việc đã được phê duyệt và kích hoạt thành công.` });

    } catch (error) {
        // ... (xử lý lỗi như cũ)
        console.error('Error in approveJobs (admin):', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Một hoặc nhiều ID công việc không hợp lệ.' });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi phê duyệt công việc.' });
    }
};


/**
 * @desc   Từ chối một hoặc nhiều công việc
 * @route  PUT /api/admin/jobs/reject
 * @access Private/Admin
 */
exports.rejectJobs = async (req, res) => {
    try {
        const { jobIds, rejectionReason } = req.body;
        const adminId = req.user.userId; // Đảm bảo là req.user.userId

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp danh sách ID công việc để từ chối.' });
        }
        if (!adminId) {
             return res.status(401).json({ success: false, message: 'Không thể xác định quản trị viên.' });
        }

        const updateData = {
            approvalStatus: 'Rejected',
            status: 'Inactive', // << CÂN NHẮC: Đặt status là Inactive khi bị từ chối
            // rejectedBy: adminId, // (Tùy chọn, nếu bạn thêm trường này vào model)
            rejectionReason: rejectionReason || undefined, // Lưu lý do từ chối
            // rejectedAt: Date.now() // (Tùy chọn)
        };

        const updateResult = await Job.updateMany(
            { _id: { $in: jobIds.map(id => new mongoose.Types.ObjectId(id)) }, approvalStatus: 'Pending' },
            { $set: updateData }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'Không có công việc nào được từ chối. Có thể chúng đã được xử lý hoặc ID không đúng.' });
        }

        res.status(200).json({ success: true, message: `${updateResult.modifiedCount} công việc đã được từ chối.` });

    } catch (error) {
        // ... (xử lý lỗi như cũ)
        console.error('Error in rejectJobs (admin):', error);
         if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Một hoặc nhiều ID công việc không hợp lệ.' });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi từ chối công việc.' });
    }
};

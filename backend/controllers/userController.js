// backend/controllers/userController.js
const User = require('../models/User');
const Job = require('../models/Job'); // <<< THÊM IMPORT JOB MODEL
const Application = require('../models/Application'); // <<< THÊM IMPORT APPLICATION MODEL
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// --- Helper xử lý lỗi chung ---
const handleServerError = (res, error, contextMessage) => {
    console.error(`${contextMessage} Error:`, error); // Log lỗi đầy đủ
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: `Lỗi validation: ${messages.join('. ')}` });
    }
    if (error.code === 11000) {
         return res.status(400).json({ message: 'Thông tin bị trùng lặp (ví dụ: email đã tồn tại).' });
    }
    res.status(500).json({ message: `Lỗi máy chủ khi ${contextMessage.toLowerCase()}.` });
};

// --- Lấy hồ sơ của người dùng đang đăng nhập ---
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.status(200).json(user);
    } catch (error) {
        handleServerError(res, error, "lấy hồ sơ người dùng");
    }
};

// --- Cập nhật hồ sơ của người dùng đang đăng nhập ---
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;
        delete updates.role;
        delete updates.password;
        delete updates.isAdmin;
        delete updates.companyId;

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }
        res.status(200).json({
            message: 'Cập nhật hồ sơ thành công!',
            user: updatedUser
        });
    } catch (error) {
        handleServerError(res, error, "cập nhật hồ sơ người dùng");
    }
};

// --- Upload CV ---
exports.uploadCv = async (req, res) => {
    try {
        const candidateId = req.user.userId;
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file CV nào được tải lên.' });
        }
        const savedFileName = req.file.filename;
        const fileUrl = `/uploads/cvs/${savedFileName}`;
        
        const candidate = await User.findById(candidateId);
        if (!candidate || candidate.role !== 'candidate') {
            return res.status(404).json({ message: 'Không tìm thấy ứng viên.' });
        }
        const newCv = {
            _id: new mongoose.Types.ObjectId(),
            fileName: req.file.originalname,
            url: fileUrl,
            uploadDate: new Date()
        };
        const updatedCandidate = await User.findByIdAndUpdate(
            candidateId,
            { $push: { uploadedCVs: { $each: [newCv], $sort: { uploadDate: -1 } } } },
            { new: true }
        ).select('-password');

        if (!updatedCandidate) {
             throw new Error('Cập nhật thông tin CV thất bại.');
        }
        res.status(201).json({
            message: 'Tải lên CV thành công!',
            newCv: newCv,
        });
    } catch (error) {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Dung lượng file CV không được vượt quá 5MB.' });
            }
             console.error("Multer Error:", error);
             return res.status(400).json({ message: `Lỗi tải file: ${error.message}` });
        }
        if (error.message && error.message.startsWith('Loại file không hợp lệ')) { // Kiểm tra error.message tồn tại
             return res.status(400).json({ message: error.message });
        }
        handleServerError(res, error, "tải lên CV");
    }
};

// >>> THÊM HÀM MỚI ĐỂ LẤY SỐ LIỆU THỐNG KÊ CHO EMPLOYER DASHBOARD <<<
// GET /api/users/employer/dashboard-stats
exports.getEmployerDashboardStats = async (req, res) => {
    try {
        const employerId = req.user.userId;

        // 1. Đếm số tin đang tuyển (Active Jobs)
        const activeJobs = await Job.countDocuments({ postedBy: employerId, status: 'Active' });

        // 2. Đếm tổng số tin đã đăng
        const totalJobsPosted = await Job.countDocuments({ postedBy: employerId });

        // 3. Đếm tổng số hồ sơ ứng tuyển
        const totalApplicants = await Application.countDocuments({ employerId: employerId });

        // 4. Đếm số hồ sơ mới trong ngày
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Bắt đầu ngày
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Bắt đầu ngày mai

        const newApplicantsToday = await Application.countDocuments({
            employerId: employerId,
            createdAt: { $gte: today, $lt: tomorrow }
        });
        
        // (Tùy chọn) Các số liệu khác bạn có thể muốn thêm sau:
        // const interviewsScheduled = await Application.countDocuments({ employerId: employerId, status: 'Mời phỏng vấn', 'interviewDetails.interviewDate': { $gte: new Date() } });
        // const hiresThisMonth = ... (cần logic phức tạp hơn dựa trên status 'Trúng tuyển' và tháng hiện tại)

        res.status(200).json({
            activeJobs,
            totalJobsPosted,
            totalApplicants,
            newApplicantsToday,
            interviewsScheduled: 0, // Placeholder, bạn có thể tính toán sau
            hiresThisMonth: 0      // Placeholder
        });

    } catch (error) {
        handleServerError(res, error, "lấy số liệu dashboard nhà tuyển dụng");
    }
};

// >>> HÀM MỚI: LƯU/BỎ LƯU CÔNG VIỆC <<<
// POST /api/users/saved-jobs/:jobId
exports.toggleSaveJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const jobId = req.params.jobId;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Job ID không hợp lệ.' });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'candidate') {
            return res.status(404).json({ message: 'Không tìm thấy ứng viên.' });
        }

        const jobExists = await Job.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({ message: 'Công việc không tồn tại.' });
        }

        const isJobSaved = user.savedJobs.includes(jobId);
        let updatedUser;
        let message = '';

        if (isJobSaved) {
            // Bỏ lưu: Xóa jobId khỏi mảng savedJobs
            user.savedJobs.pull(jobId);
            message = 'Đã bỏ lưu công việc thành công.';
        } else {
            // Lưu: Thêm jobId vào mảng savedJobs (nếu chưa có)
            user.savedJobs.addToSet(jobId); // $addToSet để tránh trùng lặp
            message = 'Đã lưu công việc thành công.';
        }

        updatedUser = await user.save();
        // Populate lại savedJobs để trả về cho client
        await updatedUser.populate({
            path: 'savedJobs',
            select: '_id title companyName location type salary createdAt companyId', // Các trường cần cho JobCard
            populate: { path: 'companyId', select: 'name logoUrl' } // Populate company trong job
        });


        res.status(200).json({
            message,
            savedJobs: updatedUser.savedJobs // Trả về danh sách savedJobs đã cập nhật (đã populate)
        });

    } catch (error) {
        handleServerError(res, error, "lưu hoặc bỏ lưu công việc");
    }
};

// >>> HÀM MỚI: LẤY DANH SÁCH CÔNG VIỆC ĐÃ LƯU <<<
// GET /api/users/saved-jobs
exports.getSavedJobs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId)
            .populate({
                path: 'savedJobs', // Tên trường trong User model
                select: '_id title companyName location type salary createdAt companyId status', // Các trường cần thiết của Job
                populate: { // Populate lồng nhau để lấy thông tin công ty từ Job
                    path: 'companyId',
                    select: 'name logoUrl' // Chọn các trường cần thiết của Company
                }
            });

        if (!user || user.role !== 'candidate') {
            return res.status(404).json({ message: 'Không tìm thấy ứng viên.' });
        }

        res.status(200).json({
            status: 'success',
            data: user.savedJobs // Trả về mảng các job objects đã populate
        });
    } catch (error) {
        handleServerError(res, error, "lấy danh sách công việc đã lưu");
    }
};

// --- HÀM MỚI: Xóa CV của người dùng ---
exports.deleteUserCv = async (req, res) => {
    // Log để kiểm tra nội dung của req.user được gán bởi middleware 'protect'
    console.log('[deleteUserCv] req.user (payload từ token):', req.user);

    try {
        // Cố gắng lấy userId từ các trường phổ biến trong payload của token
        const userId = req.user?.id || req.user?.userId || req.user?._id; 
        const { cvId } = req.params;

        console.log(`[deleteUserCv] Attempting to delete CV. UserId from token: ${userId}, CvId from params: ${cvId}`);

        if (!userId) {
            // Nếu không thể lấy được userId từ token payload
            return res.status(401).json({ message: 'Người dùng không được xác thực (không tìm thấy ID người dùng trong token).' });
        }
        if (!cvId) {
            return res.status(400).json({ message: 'Không có ID của CV được cung cấp.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng trong cơ sở dữ liệu.' });
        }

        // Tìm CV cần xóa trong mảng uploadedCVs của user
        const cvToDelete = user.uploadedCVs.find(cv => cv._id.toString() === cvId);

        if (!cvToDelete) {
            return res.status(404).json({ message: 'Không tìm thấy CV này trong hồ sơ của bạn.' });
        }

        // Bước 1: Xóa file vật lý khỏi server
        // QUAN TRỌNG: Đảm bảo logic lấy đường dẫn file chính xác
        // Giả sử cvToDelete.url là đường dẫn tương đối như '/uploads/cvs/ten_file.pdf'
        const fileNameOnly = path.basename(cvToDelete.url); 
        const fullFilePath = path.join(__dirname, '..', 'uploads', 'cvs', fileNameOnly);

        console.log(`[deleteUserCv] Attempting to delete physical file at: ${fullFilePath}`);

        if (fs.existsSync(fullFilePath)) {
            try {
                fs.unlinkSync(fullFilePath);
                console.log(`[deleteUserCv] Đã xóa file CV vật lý: ${fullFilePath}`);
            } catch (fileError) {
                console.error('[deleteUserCv] Lỗi khi xóa file CV vật lý:', fileError);
                return res.status(500).json({ message: 'Lỗi khi xóa file CV trên server.' });
            }
        } else {
            console.warn(`[deleteUserCv] File CV không tồn tại trên server để xóa: ${fullFilePath}`);
            // Cân nhắc: Nếu file không tồn tại, có thể vẫn muốn xóa tham chiếu trong DB
        }

        // Bước 2: Xóa tham chiếu CV khỏi mảng uploadedCVs trong User model
        user.uploadedCVs = user.uploadedCVs.filter(cv => cv._id.toString() !== cvId);
        await user.save();

        console.log(`[deleteUserCv] Đã xóa tham chiếu CV ID: ${cvId} cho user ID: ${userId} khỏi DB.`);

        res.status(200).json({ 
            message: 'CV đã được xóa thành công!',
            remainingCVs: user.uploadedCVs 
        });

    } catch (error) {
        console.error('[deleteUserCv] Lỗi trong quá trình xóa CV:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID CV hoặc User ID không hợp lệ.' });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa CV.' });
    }
};
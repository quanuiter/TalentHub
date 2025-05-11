// backend/controllers/userController.js
const User = require('../models/User');
const mongoose = require('mongoose');
const multer = require('multer');
// --- Helper xử lý lỗi chung ---
const handleServerError = (res, error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: `Lỗi validation: ${messages.join('. ')}` });
    }
    // Bắt lỗi trùng lặp key (ví dụ: email)
    if (error.code === 11000) {
         return res.status(400).json({ message: 'Thông tin bị trùng lặp (ví dụ: email đã tồn tại).' });
    }
    res.status(500).json({ message: `Lỗi máy chủ khi ${contextMessage.toLowerCase()}.` });
};

// --- Lấy hồ sơ của người dùng đang đăng nhập ---
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy từ middleware protect
        const user = await User.findById(userId).select('-password'); // Không trả về password

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.status(200).json(user); // Trả về toàn bộ thông tin user (đã bỏ password)

    } catch (error) {
        handleServerError(res, error, "Lấy hồ sơ người dùng");
    }
};


// --- Cập nhật hồ sơ của người dùng đang đăng nhập ---
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Lấy từ middleware protect
        const updates = req.body;

        // --- Ngăn chặn cập nhật các trường nhạy cảm ---
        // User không thể tự đổi vai trò của mình qua endpoint này
        delete updates.role;
        // User không thể đổi mật khẩu qua endpoint này (nên có endpoint riêng)
        delete updates.password;
        // User không thể tự set mình thành admin (nếu có trường isAdmin)
        delete updates.isAdmin;
        // User không nên tự đổi companyId trực tiếp qua đây (nếu là employer)
        // Việc thay đổi công ty nên có quy trình riêng
        delete updates.companyId;

        // --- Validate dữ liệu cập nhật (Có thể thêm ở đây nếu cần) ---
        // Ví dụ: Kiểm tra định dạng email nếu email được phép cập nhật
        // if (updates.email && !/.+\@.+\..+/.test(updates.email)) {
        //     return res.status(400).json({ message: 'Định dạng email không hợp lệ.' });
        // }

        // Cập nhật bằng findByIdAndUpdate
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,          // Trả về document *sau khi* cập nhật
            runValidators: true // Chạy validation của Mongoose Schema
        }).select('-password'); // Không trả về password

        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }

        res.status(200).json({
            message: 'Cập nhật hồ sơ thành công!',
            user: updatedUser // Trả về thông tin user đã cập nhật
        });

    } catch (error) {
        handleServerError(res, error, "Cập nhật hồ sơ người dùng");
    }
};

exports.uploadCv = async (req, res) => {
    try {
        const candidateId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({ message: 'Không có file CV nào được tải lên.' });
        }

        // --- Lấy thông tin file đã lưu bởi multer ---
        const savedFileName = req.file.filename; // Tên file đã lưu trên server
        // Tạo URL tương đối để truy cập file qua static serving
        // Quan trọng: Đường dẫn URL này phải khớp với cách bạn serve static file trong server.js
        const fileUrl = `/uploads/cvs/${savedFileName}`; // Ví dụ: /uploads/cvs/userId-timestamp-filename.pdf

        console.log(`File saved on server: ${req.file.path}`);
        console.log(`Generated file URL: ${fileUrl}`);

        // Tìm Candidate trong CSDL
        const candidate = await User.findById(candidateId);
        if (!candidate || candidate.role !== 'candidate') {
            // Cân nhắc xóa file vừa upload lên nếu user không hợp lệ
            // fs.unlinkSync(req.file.path); // Cần import fs
            return res.status(404).json({ message: 'Không tìm thấy ứng viên.' });
        }

        // Tạo object CV mới để lưu vào DB
        const newCv = {
            _id: new mongoose.Types.ObjectId(),
            fileName: req.file.originalname, // Tên gốc
            url: fileUrl,                    // URL để truy cập file
            uploadDate: new Date()
        };

        // Thêm CV vào mảng uploadedCVs
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
        // Xử lý lỗi cụ thể từ multer (ví dụ: file quá lớn)
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'Dung lượng file CV không được vượt quá 5MB.' });
            }
             // Các lỗi multer khác...
             console.error("Multer Error:", error);
             return res.status(400).json({ message: `Lỗi tải file: ${error.message}` });
        }
        // Xử lý lỗi bộ lọc file
        if (error.message.startsWith('Loại file không hợp lệ')) {
             return res.status(400).json({ message: error.message });
        }
        // Xử lý lỗi chung
        handleServerError(res, error, "Tải lên CV");
    }
};
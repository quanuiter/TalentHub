// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path'); // Cần module 'path'
const fs = require('fs'); // Cần module 'fs'

// --- Đảm bảo thư mục upload tồn tại ---
const uploadDir = path.join(__dirname, '..', 'uploads', 'cvs'); // Đường dẫn tuyệt đối đến backend/uploads/cvs
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Tạo thư mục nếu chưa có
    console.log(`Created directory: ${uploadDir}`);
} else {
    console.log(`Upload directory exists: ${uploadDir}`);
}
// ---------------------------------

// Cấu hình lưu file vào đĩa
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Chỉ định thư mục lưu file
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        try {
            const candidateId = req.user?.userId ? String(req.user.userId) : 'unknown'; // Đảm bảo là string
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

            // Sử dụng dấu + để nối chuỗi thay vì template literal
            const finalFilename = candidateId + '-' + uniqueSuffix + '-' + safeOriginalName;

            console.log('[uploadMiddleware] Tạo tên file bằng nối chuỗi:', finalFilename); // Log mới
            cb(null, finalFilename);

        } catch (error) {
             console.error("[uploadMiddleware] Lỗi trong hàm filename:", error);
             // Gọi callback với lỗi để multer xử lý
             cb(error);
        }
    }
});

// Bộ lọc file (giữ nguyên)
const fileFilter = (req, file, cb) => {
    
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Loại file không hợp lệ. Chỉ chấp nhận PDF, DOC, DOCX.'), false);
    }
};

// Tạo middleware upload với diskStorage
const upload = multer({
    storage: storage, // Sử dụng diskStorage
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
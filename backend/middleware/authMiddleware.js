// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model để có thể lấy thông tin chi tiết nếu cần

// Middleware để bảo vệ các route yêu cầu đăng nhập
const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra xem header 'Authorization' có tồn tại và bắt đầu bằng 'Bearer' không
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Lấy token từ header (loại bỏ chữ 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 3. Xác thực token bằng secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Lấy thông tin user từ token và gắn vào request
            // Chúng ta đã lưu userId và role trong payload khi tạo token
            // Gắn payload đã giải mã (chứa userId, role) vào req.user
            req.user = decoded;

            // (Tùy chọn nâng cao): Nếu bạn muốn lấy toàn bộ thông tin user từ DB và gắn vào req:
            // req.user = await User.findById(decoded.userId).select('-password'); // Lấy user, bỏ qua password
            // if (!req.user) {
            //     return res.status(401).json({ message: 'Không tìm thấy người dùng cho token này.' });
            // }

            next(); // Token hợp lệ, cho phép đi tiếp đến route handler tiếp theo
        } catch (error) {
            console.error('Token Verification Error:', error.name, error.message);
            // Xử lý các lỗi token phổ biến
            if (error.name === 'JsonWebTokenError') {
                 return res.status(401).json({ message: 'Token không hợp lệ.' });
            }
            if (error.name === 'TokenExpiredError') {
                 return res.status(401).json({ message: 'Token đã hết hạn.' });
            }
            // Lỗi khác
            return res.status(401).json({ message: 'Xác thực thất bại, vui lòng đăng nhập lại.' });
        }
    }

    // Nếu không có token hoặc không đúng định dạng 'Bearer'
    if (!token) {
        return res.status(401).json({ message: 'Chưa xác thực, không tìm thấy token.' });
    }
};

// Middleware để kiểm tra vai trò (ví dụ: chỉ cho phép employer)
const authorize = (...roles) => { // Nhận danh sách các vai trò được phép
    return (req, res, next) => {
        // Middleware này phải chạy SAU middleware 'protect' vì nó cần req.user
        if (!req.user || !req.user.role) {
            // Trường hợp req.user không được gắn đúng cách (lỗi logic)
             return res.status(403).json({ message: 'Lỗi xác định vai trò người dùng.' });
        }

        if (!roles.includes(req.user.role)) {
            // Nếu vai trò của user không nằm trong danh sách được phép
            return res.status(403).json({ // 403: Forbidden
                message: `Vai trò '${req.user.role}' không được phép truy cập tài nguyên này.`
            });
        }
        next(); // Vai trò hợp lệ, cho phép đi tiếp
    };
};


// Export các middleware
module.exports = { protect, authorize };
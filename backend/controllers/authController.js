// backend/controllers/authController.js
const User = require('../models/User'); // Import User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Hàm xử lý Đăng ký ---
exports.registerUser = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ request body (frontend gửi lên)
        const { fullName, email, password, role, companyName, companyId } = req.body;

        // 2. Validate dữ liệu cơ bản (có thể validate kỹ hơn)
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Mật khẩu, Vai trò).' });
        }
        // Kiểm tra độ dài mật khẩu (Schema cũng đã có nhưng check ở đây sớm hơn)
        if (password.length < 6) {
             return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        // 3. Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        // 4. Tạo user mới (Mật khẩu sẽ tự động được hash bởi pre-save hook trong User model)
        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            password, // Truyền mật khẩu gốc, model sẽ hash nó
            role,
            companyName: role === 'employer' ? companyName : undefined, // Chỉ gán nếu là employer
            companyId: role === 'employer' ? companyId : undefined      // Chỉ gán nếu là employer (cần ID công ty nếu có)
        });

        // 5. Lưu user vào CSDL
        const savedUser = await newUser.save();

        // 6. Tạo JWT token cho user vừa đăng ký (tùy chọn, có thể yêu cầu login sau)
        const token = jwt.sign(
            { userId: savedUser._id, role: savedUser.role }, // Payload chứa ID và role
            process.env.JWT_SECRET, // Khóa bí mật từ .env
            { expiresIn: '1d' } // Token hết hạn sau 1 ngày (ví dụ)
        );

        // 7. Trả về thông tin user (loại bỏ password) và token
        res.status(201).json({ // status 201: Created
            message: 'Đăng ký thành công!',
            token, // Trả token để frontend lưu lại và tự động đăng nhập
            user: {
                id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                role: savedUser.role,
                // Thêm các trường khác nếu cần
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        // Xử lý lỗi validation từ Mongoose
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký.' });
    }
};

// --- Hàm xử lý Đăng nhập ---
exports.loginUser = async (req, res) => {
    try {
        // 1. Lấy email và password từ request body
        const { email, password } = req.body;

        // 2. Validate cơ bản
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
        }

        // 3. Tìm user trong CSDL bằng email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' }); // 401: Unauthorized
        }

        // 4. So sánh mật khẩu đã nhập với mật khẩu đã hash trong CSDL
        const isMatch = await user.comparePassword(password); // Dùng phương thức đã tạo trong Model
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        // 5. Nếu thông tin hợp lệ, tạo JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // Payload
            process.env.JWT_SECRET,                // Secret key
            { expiresIn: '1d' }                    // Thời hạn token
        );

        // 6. Trả về token và thông tin user (loại bỏ password)
        res.status(200).json({ // status 200: OK
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                // Lấy thêm các trường cần thiết cho frontend context
                phone: user.phone,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                linkedin: user.linkedin,
                portfolio: user.portfolio,
                summary: user.summary,
                education: user.education,
                experience: user.experience,
                skills: user.skills,
                uploadedCVs: user.uploadedCVs,
                savedJobs: user.savedJobs,
                companyName: user.companyName,
                companyId: user.companyId,
                // KHÔNG trả về password
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập.' });
    }
};

// Có thể thêm các hàm khác như forgotPassword, resetPassword, getUserProfile... sau
// backend/controllers/authController.js
const User = require('../models/User'); // Import User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

// --- Hàm xử lý Đăng ký ---
exports.registerUser = async (req, res) => {
    try {
        // 1. Lấy dữ liệu từ request body (frontend gửi lên)
        const { fullName, email, password, role, companyName} = req.body;
        
        // 2. Validate dữ liệu cơ bản (có thể validate kỹ hơn)
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Mật khẩu, Vai trò).' });
        }
        // Kiểm tra độ dài mật khẩu (Schema cũng đã có nhưng check ở đây sớm hơn)
        if (password.length < 6) {
             return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }
        if (role === 'employer' && !companyName) { // <<< Bắt buộc companyName nếu là employer
            return res.status(400).json({ message: 'Vui lòng nhập tên công ty cho nhà tuyển dụng.' });
       }
        // 3. Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }
        let companyId = null; // Khai báo bằng let
        let finalCompanyName = companyName; // Khai báo bằng let

        if (role === 'employer') {
            // Tìm công ty theo tên (có thể cần xử lý case-insensitive hoặc tìm kiếm linh hoạt hơn)
            let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } }); // Tìm không phân biệt hoa thường

            if (!company) {
                // Nếu công ty chưa tồn tại -> Tạo mới
                console.log(`Company "${companyName}" not found, creating new one.`);
                const newCompany = new Company({
                    name: companyName, // Sử dụng tên từ request
                    //createdBy: savedUser._id // Sẽ gán sau khi có savedUser._id, hoặc bỏ qua nếu không cần
                    // Thêm các trường mặc định khác nếu muốn
                });
                const savedCompany = await newCompany.save();
                companyId = savedCompany._id; // Lấy ID công ty mới tạo
                finalCompanyName = savedCompany.name; // Lấy tên chuẩn từ CSDL (nếu có xử lý tên)
                console.log(`New company created with ID: ${companyId}`);
            } else {
                // Nếu công ty đã tồn tại -> Lấy ID
                companyId = company._id;
                finalCompanyName = company.name; // Lấy tên chuẩn từ CSDL
                console.log(`Existing company found with ID: ${companyId}`);
            }
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
        const tokenPayload = {
            userId: savedUser._id,
            role: savedUser.role
       };
        // Thêm companyId và companyName vào payload nếu là employer
       if (savedUser.role === 'employer') {
            if (savedUser.companyId) { // companyId đã được gán khi tạo/tìm company
               tokenPayload.companyId = savedUser.companyId;
            }
            if (savedUser.companyName) { // companyName cũng đã được gán
               tokenPayload.companyName = savedUser.companyName; // <<< THÊM GÁN companyName
            }
       }
        // 6. Tạo JWT token cho user vừa đăng ký (tùy chọn, có thể yêu cầu login sau)
        const token = jwt.sign(
            tokenPayload,
            //{ userId: savedUser._id, role: savedUser.role, companyId: savedUser.companyId }, // <<< Thêm companyId vào token payload nếu cần
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 7. Trả về thông tin user (loại bỏ password) và token
        res.status(201).json({
            message: 'Đăng ký thành công!',
            token,
            user: {
                id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                role: savedUser.role,
                companyName: savedUser.companyName, // Trả về companyName
                companyId: savedUser.companyId // Trả về companyId
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
        const tokenPayload = { userId: user._id, role: user.role };
        // Thêm companyId vào payload nếu là employer và có companyId
        if (user.role === 'employer') {
            if (user.companyId) {
               tokenPayload.companyId = user.companyId;
            }
            if (user.companyName) { // <<< THÊM KIỂM TRA VÀ GÁN companyName
               tokenPayload.companyName = user.companyName;
            }
       }
        // 5. Nếu thông tin hợp lệ, tạo JWT token
        const token = jwt.sign(
            tokenPayload,
            //{ userId: user._id, role: user.role }, // Payload
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
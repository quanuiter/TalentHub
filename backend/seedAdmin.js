// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa mật khẩu
const User = require('./models/User'); // Đường dẫn đến User model của bạn
const dotenv =require('dotenv'); // Để đọc biến môi trường từ .env

// Tải biến môi trường từ file .env (nếu có)
dotenv.config(); // Giả sử bạn có file .env trong thư mục config

// --- CẤU HÌNH THÔNG TIN ADMIN ---
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'Admin';
// ---------------------------------

const MONGO_URI = process.env.MONGODB_URI; // Lấy URI kết nối MongoDB từ biến môi trường

if (!MONGO_URI) {
    console.error('Lỗi: Vui lòng đặt biến môi trường MONGO_URI.');
    process.exit(1);
}

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            // Các tùy chọn mongoose mới không cần nhiều thiết lập như trước
            // useNewUrlParser: true, // Không cần nữa
            // useUnifiedTopology: true, // Không cần nữa
            // useCreateIndex: true, // Không cần nữa
            // useFindAndModify: false // Không cần nữa
        });
        console.log('MongoDB đã kết nối thành công để seed dữ liệu...');

        // 1. Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`Admin với email ${ADMIN_EMAIL} đã tồn tại.`);
            return; // Không tạo nếu đã có
        }

        // 2. Mã hóa mật khẩu
        console.log(`Đang sử dụng email: ${ADMIN_EMAIL} và mật khẩu: ${ADMIN_PASSWORD} để tạo admin.`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // 3. Tạo đối tượng admin mới
        const adminUser = new User({
            fullName: ADMIN_FULL_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
            // Các trường khác có thể cần thiết hoặc có giá trị mặc định trong model
            // Ví dụ: isVerified: true (nếu bạn có cơ chế xác thực email)
        });

        // 4. Lưu admin vào cơ sở dữ liệu
        await adminUser.save();
        console.log(`Tài khoản Admin ${ADMIN_FULL_NAME} (${ADMIN_EMAIL}) đã được tạo thành công!`);

    } catch (error) {
        console.error('Lỗi khi seed tài khoản Admin:', error);
    } finally {
        // 5. Đóng kết nối MongoDB
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối MongoDB.');
    }
};

// Chạy hàm seed
seedDB();

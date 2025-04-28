// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Định nghĩa cấu trúc cho CV được tải lên (subdocument)
const cvSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    url: { type: String, required: true }, // Đường dẫn lưu trữ file (ví dụ: S3, Cloudinary)
    uploadDate: { type: Date, default: Date.now }
});

// Định nghĩa cấu trúc cho Học vấn (subdocument)
const educationSchema = new mongoose.Schema({
    school: { type: String, required: true },
    degree: { type: String, required: true },
    startYear: { type: Number },
    endYear: { type: Number }
}, { _id: false });

// Định nghĩa cấu trúc cho Kinh nghiệm (subdocument)
const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
}, { _id: false });


// --- Định nghĩa Schema chính cho User ---
const userSchema = new mongoose.Schema({
    // --- Thông tin cơ bản & Xác thực ---
    fullName: {
        type: String,
        required: [true, 'Vui lòng nhập họ tên'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Vui lòng nhập địa chỉ email hợp lệ']
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
    },
    role: {
        type: String,
        required: true,
        enum: ['candidate', 'employer'],
        default: 'candidate'
    },
    // createdAt & updatedAt sẽ tự động thêm bởi timestamps: true

    // --- Thông tin riêng cho Candidate ---
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    linkedin: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    summary: { type: String, trim: true },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [{ type: String, trim: true }],
    uploadedCVs: [cvSchema],
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],

    // --- Thông tin riêng cho Employer ---
    companyName: {
        type: String,
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }

}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// --- Middleware (Hook) để Hash mật khẩu trước khi lưu ---
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// --- Phương thức để so sánh mật khẩu đã nhập với mật khẩu đã hash ---
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// --- Tạo Model từ Schema ---
const User = mongoose.model('User', userSchema);

// --- Export Model ---
module.exports = User;
// code/backend/models/Test.js
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên bài test'],
        trim: true
    },
    link: {
        type: String,
        required: [true, 'Vui lòng cung cấp link cho bài test'],
        trim: true
        // Bạn có thể thêm validation cho URL ở đây nếu muốn
    },
    description: { // Tùy chọn: Mô tả ngắn về bài test
        type: String,
        trim: true
    },
    durationMinutes: { // Tùy chọn: Thời gian làm bài (phút)
        type: Number,
        min: 0
    },
    createdBy: { // Employer đã tạo bài test này
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    companyId: { // Công ty mà bài test này thuộc về (để dễ dàng query)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
        // Có thể không required nếu admin hệ thống có thể tạo test chung
    }
    // Thêm các trường khác nếu cần: loại test, độ khó, v.v.
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

// Index để tìm kiếm nhanh theo tên hoặc người tạo (nếu cần)
testSchema.index({ name: 1 });
testSchema.index({ createdBy: 1 });

const Test = mongoose.model('Test', testSchema); // Mongoose sẽ tạo collection 'tests'

module.exports = Test;
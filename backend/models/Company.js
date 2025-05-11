// backend/models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên công ty'],
        trim: true,
        unique: true // Có thể muốn tên công ty là duy nhất
    },
    description: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String,
        trim: true
    },
    industry: { // Ngành nghề
        type: String,
        trim: true
    },
    size: { // Quy mô
         type: String,
         trim: true
    },
    // Có thể thêm liên kết đến những người dùng là employer của công ty này
    // employers: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }],
    createdBy: { // User đầu tiên tạo công ty này (ví dụ)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    // Thêm các trường khác nếu cần
}, {
    timestamps: true
});

// Có thể thêm index cho tên công ty để tìm kiếm nhanh hơn
companySchema.index({ name: 1 });

const Company = mongoose.model('Company', companySchema); // Collection sẽ là 'companies'

module.exports = Company;
// backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập chức danh công việc'],
        trim: true
    },
    companyName: { // Giữ lại tên Cty để hiển thị nhanh, dù có companyId
        type: String,
        required: [true, 'Vui lòng nhập tên công ty']
    },
    companyId: { // ID tham chiếu đến Company document (sẽ tạo model Company sau)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        // required: true // Sẽ yêu cầu khi có model Company
    },
    postedBy: { // ID của employer user đã đăng tin
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Tham chiếu đến User model
    },
    location: {
        type: String,
        required: [true, 'Vui lòng nhập địa điểm làm việc']
    },
    type: { // Loại hình công việc
        type: String,
        required: [true, 'Vui lòng chọn loại hình công việc'],
        enum: ['Full-time', 'Part-time', 'Hợp đồng', 'Thực tập', 'Remote', 'Freelance'] // Các loại được phép
    },
    salary: { // Có thể lưu dạng string (vd: "Thương lượng", "10-15 triệu") hoặc object {min, max, unit, isNegotiable}
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả công việc']
    },
    requirements: { // Lưu dạng String, dùng xuống dòng để liệt kê, hoặc có thể đổi thành Array of Strings
        type: String,
        required: [true, 'Vui lòng nhập yêu cầu ứng viên']
    },
    benefits: { // Lưu dạng String hoặc Array of Strings
        type: String
    },
    industry: { // Ngành nghề (Có thể tách ra model riêng nếu cần quản lý phức tạp)
        type: String,
        // required: true // Có thể yêu cầu
    },
    requiredSkills: [{ // Mảng các kỹ năng yêu cầu
        type: String,
        trim: true
    }],
    experienceLevel: { // Kinh nghiệm yêu cầu
        type: String
    },
    numberOfHires: { // Số lượng tuyển
        type: Number,
        default: 1,
        min: 1
    },
    status: { // Trạng thái tin đăng
        type: String,
        enum: ['Active', 'Closed', 'Draft', 'Expired'], // Trạng thái có thể có
        default: 'Active'
    },
    applicationDeadline: { // Hạn nộp hồ sơ
        type: Date
    },
    associatedTests: [{ // Các bài test liên quan (tham chiếu đến Test model nếu có)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test' // Giả sử có model Test
    }],
    // Không nên lưu applicants trực tiếp ở đây nếu số lượng lớn
    // Thay vào đó, Application model sẽ tham chiếu đến Job và User

    // Thêm các trường khác nếu cần

}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

// Có thể thêm index để tối ưu tìm kiếm sau này, ví dụ:
// jobSchema.index({ title: 'text', companyName: 'text', location: 'text', requiredSkills: 'text' });

const Job = mongoose.model('Job', jobSchema); // Mongoose sẽ tạo collection 'jobs'

module.exports = Job;
// backend/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job', // Tham chiếu đến Job Model
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến User Model (candidate)
        required: true
    },
    employerId: { // Lưu lại ID của employer để dễ query (lấy từ job.postedBy)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến User Model (employer)
        required: true
    },
    companyId: { // Lưu lại ID công ty để dễ query (lấy từ job.companyId)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
        // required: true // Bỏ require nếu job có thể chưa có companyId
    },
    // Lưu thông tin CV đã dùng để ứng tuyển tại thời điểm đó
    cvFileName: {
        type: String,
        required: true
    },
    cvUrl: {
        type: String,
        required: true
    },
    coverLetter: { // Thư giới thiệu (tùy chọn)
        type: String,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: [
            'Đã nộp',       // Candidate submitted
            'Đã xem',       // Employer viewed
            'Phù hợp',      // Employer marked as suitable initial screen
            'Không phù hợp',// Employer marked as unsuitable initial screen
            'Mời làm bài test', // Invited for test
            'Đã gửi bài test', // Test sent (confirmed state maybe)
            'Mời phỏng vấn', // Invited for interview
            'Đã xác nhận PV/Test', // Candidate confirmed schedule
            'Đã từ chối PV/Test', // Candidate declined schedule
            'Trúng tuyển',    // Offer extended
            'Từ chối',      // Candidate rejected / Offer declined by candidate
            'Đã hủy',       // Application cancelled by employer/candidate
            // Thêm các trạng thái khác nếu cần
        ],
        default: 'Đã nộp'
    },
    // Có thể thêm các trường về lịch sử thay đổi status, notes của employer,... sau
    // employerNotes: [{ note: String, date: Date, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User'} }],

}, {
    timestamps: true // Tự động thêm applicationDate (createdAt) và updatedAt
});

// Index để tối ưu việc tìm kiếm ứng dụng theo job hoặc candidate
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ candidateId: 1 });
// Index để tránh ứng viên nộp lại cùng 1 job
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema); // Collection: 'applications'

module.exports = Application;
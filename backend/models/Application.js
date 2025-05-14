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
        'Đã nộp',        // Candidate submitted
        'Đã xem',        // Employer viewed
        'Phù hợp',       // Employer marked as suitable
        'Mời phỏng vấn',  // Invited for interview
        'Trúng tuyển',     // Offer extended
        'Từ chối',       // Rejected by employer or candidate declined offer
        // Bỏ bớt các trạng thái trung gian nếu không quá cần thiết cho giai đoạn này
    ],
    default: 'Đã nộp'
},
    interviewDetails: {
        interviewDate: { type: Date },
        interviewTime: { type: String }, // Lưu dưới dạng HH:mm
        interviewType: { type: String }, // Ví dụ: "Vòng 1 - HR", "Technical Interview"
        location: { type: String }, // Địa điểm cụ thể hoặc "Online"
        link: { type: String }, // Link cho phỏng vấn online (Google Meet, Zoom, etc.)
        notes: { type: String, trim: true } // Ghi chú thêm từ nhà tuyển dụng
    },
    evaluation: {
        rating: { // Điểm từ 1-5 sao
            type: Number,
            min: 1,
            max: 5
        },
        notes: { // Ghi chú của NTD
            type: String,
            trim: true
        },
        evaluatedBy: { // NTD nào đánh giá
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        evaluationDate: { // Ngày đánh giá
            type: Date
        }
    },// Có thể thêm các trường về lịch sử thay đổi status, notes của employer,... sau
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
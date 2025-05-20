// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { // Người nhận thông báo
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    sender: { // Người gửi (hành động từ ai, có thể là hệ thống nếu null)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: { // Loại thông báo để dễ dàng phân loại hoặc hiển thị icon khác nhau
        type: String,
        required: true,
        enum: [
            'NEW_APPLICATION',          // UV nộp đơn -> Cho NTD
            'APPLICATION_STATUS_UPDATE',// NTD đổi status -> Cho UV
            'INTERVIEW_SCHEDULED',      // NTD mời PV -> Cho UV
            'TEST_ASSIGNED',            // NTD giao test -> Cho UV
            'INTERVIEW_REMINDER',       // Nhắc lịch PV -> Cho UV (Nâng cao, cần scheduler)
            'TEST_DEADLINE_REMINDER',   // Nhắc hạn test -> Cho UV (Nâng cao)
            'NEW_JOB_MATCHING_PROFILE', // Có job mới phù hợp -> Cho UV (Nâng cao)
            // Thêm các loại khác nếu cần
        ]
    },
    message: { // Nội dung thông báo
        type: String,
        required: true
    },
    link: { // Đường dẫn khi click vào thông báo (ví dụ: /candidate/applications, /employer/jobs/:jobId/applicants)
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedApplication: { // ID của Application liên quan (nếu có)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    relatedJob: { // ID của Job liên quan (nếu có)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    // Thêm các trường liên quan khác nếu cần
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

notificationSchema.index({ recipient: 1, createdAt: -1 }); // Index để query nhanh
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });


module.exports = mongoose.model('Notification', notificationSchema);

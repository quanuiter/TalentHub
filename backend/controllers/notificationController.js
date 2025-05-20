// backend/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User'); // Cần cho populate sender
const mongoose = require('mongoose'); // Cần cho ObjectId nếu dùng

// Helper xử lý lỗi chung (có thể copy từ controller khác hoặc tạo file helper riêng)
const handleServerError = (res, error, contextMessage) => {
    console.error(`[NOTIFICATION_CONTROLLER_ERROR] ${contextMessage}:`, error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        const messages = error.errors ? Object.values(error.errors).map(val => val.message) : [error.message];
        return res.status(400).json({ message: `Lỗi dữ liệu khi ${contextMessage.toLowerCase()}: ${messages.join('. ')}` });
    }
    res.status(500).json({ message: `Lỗi máy chủ khi ${contextMessage.toLowerCase()}.` });
};

/**
 * @desc    Helper function to create a new notification (không phải là route handler)
 * @param   {Object} notificationData - Data for the notification
 */
const createNotification = async (notificationData) => {
    try {
        // Đảm bảo các ID là ObjectId hợp lệ nếu chúng được cung cấp
        if (notificationData.recipient && !mongoose.Types.ObjectId.isValid(notificationData.recipient)) {
            console.error('[NotificationService] Invalid recipient ID for notification:', notificationData.recipient);
            return null; // Hoặc throw lỗi nếu muốn chặt chẽ hơn
        }
        if (notificationData.sender && !mongoose.Types.ObjectId.isValid(notificationData.sender)) {
            console.error('[NotificationService] Invalid sender ID for notification:', notificationData.sender);
            // Có thể set sender thành null hoặc không tạo thông báo
            notificationData.sender = null;
        }
        if (notificationData.relatedApplication && !mongoose.Types.ObjectId.isValid(notificationData.relatedApplication)) {
            notificationData.relatedApplication = null;
        }
        if (notificationData.relatedJob && !mongoose.Types.ObjectId.isValid(notificationData.relatedJob)) {
            notificationData.relatedJob = null;
        }

        const notification = new Notification(notificationData);
        await notification.save();
        console.log(`[NotificationService] Notification created for recipient ${notificationData.recipient}, type: ${notificationData.type}`);
        // TODO: Implement real-time notification (e.g., Socket.IO emit event to recipient)
        // Ví dụ: global.io.to(notificationData.recipient.toString()).emit('new_notification', notification);
        return notification;
    } catch (error) {
        console.error('[NotificationService] Error creating notification:', error);
        // Không throw error để không làm dừng luồng chính, chỉ log lỗi
        // Hoặc bạn có thể throw lỗi nếu muốn hàm gọi biết về nó
        return null; // Trả về null để hàm gọi có thể kiểm tra
    }
};

// Export helper để các controller khác có thể dùng
// Sử dụng `exports.tenHam = ...` cho nhất quán nếu bạn có nhiều exports
exports.createNotificationHelper = createNotification;


// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotificationsForUser = async (req, res) => {
    try {
        const recipientId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: recipientId })
            .populate('sender', 'fullName avatar role')
            .populate({
                path: 'relatedJob',
                select: 'title companyName'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalNotifications = await Notification.countDocuments({ recipient: recipientId });
        const unreadCount = await Notification.countDocuments({ recipient: recipientId, isRead: false });

        res.status(200).json({
            status: 'success',
            data: notifications,
            unreadCount,
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit),
            totalResults: totalNotifications
        });
    } catch (error) {
        handleServerError(res, error, "lấy danh sách thông báo");
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
exports.markNotificationAsRead = async (req, res) => {
    try {
        const recipientId = req.user.userId;
        const notificationId = req.params.notificationId;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Notification ID không hợp lệ.' });
        }

        const notification = await Notification.findOne({ _id: notificationId, recipient: recipientId });

        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo hoặc bạn không có quyền.' });
        }

        if (notification.isRead) {
            const unreadCountUnchanged = await Notification.countDocuments({ recipient: recipientId, isRead: false });
            return res.status(200).json({ message: 'Thông báo đã được đánh dấu đọc trước đó.', notification, unreadCount: unreadCountUnchanged });
        }

        notification.isRead = true;
        await notification.save();

        const unreadCount = await Notification.countDocuments({ recipient: recipientId, isRead: false });

        res.status(200).json({
            message: 'Đã đánh dấu thông báo là đã đọc.',
            notification,
            unreadCount
        });
    } catch (error) {
        handleServerError(res, error, "đánh dấu thông báo đã đọc");
    }
};

// @desc    Mark all notifications as read for the logged-in user
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const recipientId = req.user.userId;

        await Notification.updateMany(
            { recipient: recipientId, isRead: false },
            { $set: { isRead: true } }
        );
        
        const notifications = await Notification.find({ recipient: recipientId })
            .populate('sender', 'fullName avatar role')
            .populate({ path: 'relatedJob', select: 'title companyName' })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            message: 'Đã đánh dấu tất cả thông báo là đã đọc.',
            data: notifications,
            unreadCount: 0
        });
    } catch (error) {
        handleServerError(res, error, "đánh dấu tất cả thông báo đã đọc");
    }
};

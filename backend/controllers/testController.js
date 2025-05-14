// code/backend/controllers/testController.js
const Test = require('../models/Test');
const mongoose = require('mongoose');

// --- Helper xử lý lỗi chung ---
const handleServerError = (res, error, contextMessage) => {
    console.error(`${contextMessage}:`, error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: `Lỗi validation: ${messages.join('. ')}` });
    }
    res.status(500).json({ message: `Lỗi máy chủ khi ${contextMessage.toLowerCase()}.` });
};

// 1. Lấy danh sách bài test của Employer đang đăng nhập
// GET /api/tests/my-tests
exports.getMyTests = async (req, res) => {
    try {
        const employerId = req.user.userId; // Lấy từ middleware protect
        // Cũng có thể lọc theo companyId nếu Test model có trường đó và token có companyId
        // const companyId = req.user.companyId;

        const tests = await Test.find({ createdBy: employerId }).sort({ createdAt: -1 });
        res.status(200).json(tests);
    } catch (error) {
        handleServerError(res, error, "lấy danh sách bài test");
    }
};

// 2. Tạo bài test mới
// POST /api/tests
exports.createTest = async (req, res) => {
    try {
        const { name, link, description, durationMinutes } = req.body;
        const employerId = req.user.userId;
        const companyId = req.user.companyId; // Lấy từ token

        if (!name || !link) {
            return res.status(400).json({ message: 'Tên bài test và Link không được để trống.' });
        }
        // (Optional) Validate URL format for link
        try {
            new URL(link);
        } catch (_) {
            return res.status(400).json({ message: 'Link bài test không hợp lệ.' });
        }

        const newTest = new Test({
            name,
            link,
            description,
            durationMinutes,
            createdBy: employerId,
            companyId: companyId || undefined // Gán companyId nếu có
        });

        const savedTest = await newTest.save();
        res.status(201).json({ message: 'Tạo bài test thành công!', test: savedTest });
    } catch (error) {
        handleServerError(res, error, "tạo bài test");
    }
};

// 3. Lấy chi tiết một bài test (có thể không cần thiết cho trang quản lý ban đầu)
// GET /api/tests/:id
exports.getTestById = async (req, res) => {
    try {
        const testId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: 'ID bài test không hợp lệ.' });
        }

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Không tìm thấy bài test.' });
        }

        // Kiểm tra quyền sở hữu (tùy chọn, nếu không muốn test là public)
        // if (test.createdBy.toString() !== req.user.userId) {
        //     return res.status(403).json({ message: 'Bạn không có quyền xem bài test này.' });
        // }

        res.status(200).json(test);
    } catch (error) {
        handleServerError(res, error, "lấy chi tiết bài test");
    }
};


// 4. Cập nhật bài test
// PUT /api/tests/:id
exports.updateTest = async (req, res) => {
    try {
        const testId = req.params.id;
        const updates = req.body; // { name, link, description, durationMinutes }
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: 'ID bài test không hợp lệ.' });
        }

        // Chỉ cho phép cập nhật name và link, description, durationMinutes
        const allowedUpdates = ['name', 'link', 'description', 'durationMinutes'];
        const finalUpdates = {};
        for (const key of allowedUpdates) {
            if (updates.hasOwnProperty(key)) {
                finalUpdates[key] = updates[key];
            }
        }

        if (Object.keys(finalUpdates).length === 0) {
            return res.status(400).json({ message: 'Không có thông tin cập nhật hợp lệ.' });
        }
        if (finalUpdates.link) {
             try { new URL(finalUpdates.link); } catch (_) { return res.status(400).json({ message: 'Link bài test không hợp lệ.' }); }
        }


        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Không tìm thấy bài test để cập nhật.' });
        }

        // Kiểm tra quyền sở hữu
        if (test.createdBy.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài test này.' });
        }

        const updatedTest = await Test.findByIdAndUpdate(testId, finalUpdates, {
            new: true, // Trả về document sau khi update
            runValidators: true // Chạy validation của Schema
        });

        if (!updatedTest) { // Trường hợp hiếm gặp nhưng vẫn nên check
            return res.status(404).json({ message: 'Cập nhật thất bại, không tìm thấy bài test.' });
        }

        res.status(200).json({ message: 'Cập nhật bài test thành công!', test: updatedTest });
    } catch (error) {
        handleServerError(res, error, "cập nhật bài test");
    }
};

// 5. Xóa bài test
// DELETE /api/tests/:id
exports.deleteTest = async (req, res) => {
    try {
        const testId = req.params.id;
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: 'ID bài test không hợp lệ.' });
        }

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Không tìm thấy bài test để xóa.' });
        }

        // Kiểm tra quyền sở hữu
        if (test.createdBy.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài test này.' });
        }

        // TODO: Trước khi xóa, kiểm tra xem bài test này có đang được gán cho Job nào không.
        // Nếu có, có thể không cho xóa hoặc cảnh báo. Phần này cần logic phức tạp hơn (query Job model).
        // Ví dụ:
        // const jobsUsingTest = await Job.countDocuments({ associatedTests: testId });
        // if (jobsUsingTest > 0) {
        //    return res.status(400).json({ message: `Không thể xóa. Bài test này đang được sử dụng bởi ${jobsUsingTest} tin tuyển dụng.` });
        // }

        await Test.findByIdAndDelete(testId);
        res.status(200).json({ message: 'Xóa bài test thành công!' });

    } catch (error) {
        handleServerError(res, error, "xóa bài test");
    }
};
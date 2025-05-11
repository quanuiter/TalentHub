// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');

// --- 1. Tạo Application mới (Candidate) ---
// POST /api/applications
exports.createApplication = async (req, res) => {
    const session = await mongoose.startSession(); // Bắt đầu transaction để đảm bảo tính toàn vẹn
    session.startTransaction();
    try {
        const { jobId, cvId, coverLetter } = req.body;
        const candidateId = req.user.userId; // Lấy từ token

        // Validate input
        if (!jobId || !cvId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Thiếu Job ID hoặc CV ID.' });
        }
        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(cvId)) {
             await session.abortTransaction();
             session.endSession();
            return res.status(400).json({ message: 'Job ID hoặc CV ID không hợp lệ.' });
        }

        // Kiểm tra ứng tuyển trùng lặp
        const existingApplication = await Application.findOne({ jobId, candidateId }).session(session);
        if (existingApplication) {
             await session.abortTransaction();
             session.endSession();
            return res.status(400).json({ message: 'Bạn đã ứng tuyển vào vị trí này rồi.' });
        }

        // Tìm thông tin Job để lấy employerId, companyId
        const job = await Job.findById(jobId).session(session);
        if (!job || job.status !== 'Active') { // Chỉ apply vào job Active
             await session.abortTransaction();
             session.endSession();
            return res.status(404).json({ message: 'Không tìm thấy công việc hoặc công việc đã đóng.' });
        }

        // Tìm thông tin Candidate để lấy chi tiết CV
        const candidate = await User.findById(candidateId).select('uploadedCVs').session(session);
        if (!candidate) {
             await session.abortTransaction();
             session.endSession();
            return res.status(404).json({ message: 'Không tìm thấy thông tin ứng viên.' });
        }
        const selectedCv = candidate.uploadedCVs.id(cvId); // Tìm subdocument CV bằng ID
        if (!selectedCv) {
             await session.abortTransaction();
             session.endSession();
            return res.status(404).json({ message: 'CV bạn chọn không tồn tại trong hồ sơ.' });
        }

        // Tạo Application mới
        const newApplication = new Application({
            jobId,
            candidateId,
            employerId: job.postedBy, // Lấy từ job
            companyId: job.companyId, // Lấy từ job
            cvFileName: selectedCv.fileName,
            cvUrl: selectedCv.url,
            coverLetter,
            status: 'Đã nộp' // Trạng thái ban đầu
        });

        await newApplication.save({ session }); // Lưu trong transaction

        // TODO: Gửi thông báo cho Employer (sẽ làm sau)

        await session.commitTransaction(); // Hoàn tất transaction thành công
        session.endSession();

        res.status(201).json({ message: 'Ứng tuyển thành công!', application: newApplication });

    } catch (error) {
        await session.abortTransaction(); // Hủy transaction nếu có lỗi
        session.endSession();
        console.error("Create Application Error:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi ứng tuyển.' });
    }
};


// --- 2. Lấy danh sách ứng viên cho một Job (Employer) ---
// GET /api/jobs/:jobId/applicants (Route này sẽ đặt trong jobRoutes.js)
exports.getApplicantsForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Job ID không hợp lệ.' });
        }

        // Kiểm tra xem employer có quyền xem job này không
        const job = await Job.findById(jobId);
        if (!job) { return res.status(404).json({ message: 'Không tìm thấy công việc.' }); }
        if (job.postedBy.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem ứng viên cho công việc này.' });
        }

        // Lấy danh sách applications cho job đó và populate thông tin candidate cần thiết
        const applications = await Application.find({ jobId: jobId })
            .populate({
                path: 'candidateId', // Tên trường chứa ID của User (candidate)
                select: 'fullName email phone skills summary uploadedCVs' // Chọn các trường cần lấy từ User model
            })
            .sort({ createdAt: -1 }); // Mới nhất lên đầu

        res.status(200).json(applications);

    } catch (error) {
        console.error("Get Applicants Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách ứng viên.' });
    }
};

// --- 3. Cập nhật trạng thái Application (Employer) ---
// PUT /api/applications/:appId/status
exports.updateApplicationStatus = async (req, res) => {
     try {
        const appId = req.params.appId;
        const { status: newStatus } = req.body; // Lấy status mới từ body
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(appId)) {
             return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }

        // Kiểm tra xem status mới có hợp lệ không (lấy từ enum trong model)
        if (!Application.schema.path('status').enumValues.includes(newStatus)) {
             return res.status(400).json({ message: 'Trạng thái cập nhật không hợp lệ.' });
        }

        const application = await Application.findById(appId);
        if (!application) { return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' }); }

        // Kiểm tra quyền của employer
        if (application.employerId.toString() !== employerId) {
             return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn ứng tuyển này.' });
        }

        // Cập nhật status và lưu
        application.status = newStatus;
        const updatedApplication = await application.save();

        // TODO: Gửi thông báo cho Candidate (sẽ làm sau)

        res.status(200).json({ message: 'Cập nhật trạng thái thành công!', application: updatedApplication });

     } catch (error) {
        console.error("Update Application Status Error:", error);
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái.' });
    }
};

// --- 4. Lấy danh sách Applications của Candidate ---
// GET /api/applications/candidate (Route này sẽ đặt trong applicationRoutes.js)
exports.getCandidateApplications = async (req, res) => {
    try {
        const candidateId = req.user.userId;

        const applications = await Application.find({ candidateId: candidateId })
            .populate({
                path: 'jobId', // Tên trường chứa ID của Job
                select: 'title companyName location' // Lấy các trường cần thiết từ Job model
            })
            .sort({ createdAt: -1 });

        res.status(200).json(applications);

    } catch (error) {
        console.error("Get Candidate Applications Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách việc làm đã ứng tuyển.' });
    }
};
// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');
const Test = require('../models/Test');
const { createNotificationHelper } = require('./notificationController');
// --- Helper xử lý lỗi chung ---
const handleServerError = (res, error, contextMessage) => {
    console.error(`[CONTROLLER_ERROR] ${contextMessage}:`, error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        const messages = [];
        if (error.errors) {
            for (const fieldInError in error.errors) {
                messages.push(error.errors[fieldInError].message);
            }
        } else {
            messages.push(error.message);
        }
        return res.status(400).json({ message: `Lỗi dữ liệu khi ${contextMessage.toLowerCase()}: ${messages.join('. ')}` });
    }
    res.status(500).json({ message: `Lỗi máy chủ khi ${contextMessage.toLowerCase()}.` });
};

// ... (Các hàm createApplication, getApplicantsForJob, updateApplicationStatus, evaluateApplication, scheduleInterview, assignTestToApplicant giữ nguyên như phiên bản đầy đủ trước đó) ...
// --- Đảm bảo các hàm này populate 'candidateId' và 'jobId' khi trả về 'application' ---

// --- 1. Tạo Application mới (Candidate) ---
exports.createApplication = async (req, res) => {
    try {
        const { jobId, cvId, coverLetter } = req.body;
        const candidateId = req.user.userId;

        if (!jobId || !cvId) {
            return res.status(400).json({ message: 'Thiếu Job ID hoặc CV ID.' });
        }
        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(cvId)) {
            return res.status(400).json({ message: 'Job ID hoặc CV ID không hợp lệ.' });
        }

        const existingApplication = await Application.findOne({ jobId, candidateId });
        if (existingApplication) {
            return res.status(400).json({ message: 'Bạn đã ứng tuyển vào vị trí này rồi.' });
        }

        const job = await Job.findById(jobId);
        if (!job || job.status !== 'Active') {
            return res.status(404).json({ message: 'Không tìm thấy công việc hoặc công việc đã đóng.' });
        }

        const candidate = await User.findById(candidateId).select('uploadedCVs');
        if (!candidate) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin ứng viên.' });
        }
        const selectedCv = candidate.uploadedCVs.id(cvId);
        if (!selectedCv) {
            return res.status(404).json({ message: 'CV bạn chọn không tồn tại trong hồ sơ.' });
        }

        const newApplication = new Application({
            jobId,
            candidateId,
            employerId: job.postedBy,
            companyId: job.companyId,
            cvFileName: selectedCv.fileName,
            cvUrl: selectedCv.url,
            coverLetter,
            status: 'Đã nộp'
        });

        const savedApplication = await newApplication.save();
        const populatedApplication = await Application.findById(savedApplication._id)
            .populate({ path: 'jobId', select: 'title companyName location _id' })
            .populate({ path: 'candidateId', select: 'fullName email _id' });
        if (populatedApplication && populatedApplication.jobId && populatedApplication.jobId.postedBy) {
                const employerId = populatedApplication.jobId.postedBy;
                const candidateName = populatedApplication.candidateId.fullName;
                const jobTitle = populatedApplication.jobId.title;
                await createNotificationHelper({
                    recipient: employerId, // NTD nhận
                    sender: candidateId,   // UV gửi
                    type: 'NEW_APPLICATION',
                    message: `${candidateName} vừa ứng tuyển vào vị trí "${jobTitle}" của bạn.`,
                    link: `/employer/jobs/${jobId}/applicants`, // Link đến trang quản lý ứng viên của job đó
                    relatedApplication: savedApplication._id,
                    relatedJob: jobId
                });
            }
        res.status(201).json({ message: 'Ứng tuyển thành công!', application: populatedApplication });
    } catch (error) {
        handleServerError(res, error, "ứng tuyển");
    }
};

// --- 2. Lấy danh sách ứng viên cho một Job (Employer) ---
exports.getApplicantsForJob = async (req, res) => {
    try {
        const jobIdFromParams = req.params.jobId;
        const employerIdFromToken = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(jobIdFromParams)) {
            return res.status(400).json({ message: 'Job ID không hợp lệ.' });
        }
        const job = await Job.findById(jobIdFromParams);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        if (job.postedBy.toString() !== employerIdFromToken) {
            return res.status(403).json({ message: 'Bạn không có quyền xem ứng viên cho công việc này.' });
        }
        const applications = await Application.find({ jobId: jobIdFromParams })
            .populate({
                path: 'candidateId',
                select: 'fullName email phone address dateOfBirth linkedin portfolio skills summary uploadedCVs education experience _id'
            })
            .populate({ path: 'jobId', select: 'title companyName _id' })
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        handleServerError(res, error, "lấy danh sách ứng viên");
    }
};

// --- 3. Cập nhật trạng thái Application (Employer) ---
exports.updateApplicationStatus = async (req, res) => {
    try {
        const appId = req.params.appId;
        const { status: newStatus } = req.body;
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(appId)) {
             return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }
        if (!Application.schema.path('status').enumValues.includes(newStatus)) {
             return res.status(400).json({ message: 'Trạng thái cập nhật không hợp lệ.' });
        }
        const application = await Application.findById(appId);
        if (!application) { return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' }); }
        if (application.employerId.toString() !== employerId) {
             return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn ứng tuyển này.' });
        }
        application.status = newStatus;
        const updatedApplicationRaw = await application.save();
        const populatedApplication = await Application.findById(updatedApplicationRaw._id)
            .populate({ path: 'candidateId', select: 'fullName email _id' })
            .populate({ path: 'jobId', select: 'title companyName _id' });
        if (populatedApplication) {
                const jobTitle = populatedApplication.jobId.title;
                let notificationMessage = `Trạng thái ứng tuyển của bạn cho vị trí "${jobTitle}" đã được cập nhật thành: ${newStatus}.`;
                // Tùy chỉnh message dựa trên newStatus nếu muốn
                if (newStatus === 'Từ chối') {
                    notificationMessage = `Rất tiếc, hồ sơ ứng tuyển của bạn cho vị trí "${jobTitle}" chưa phù hợp.`;
                } else if (newStatus === 'Trúng tuyển') {
                     notificationMessage = `Chúc mừng! Bạn đã trúng tuyển vị trí "${jobTitle}". Nhà tuyển dụng sẽ sớm liên hệ với bạn.`;
                }

                await createNotificationHelper({
                    recipient: populatedApplication.candidateId._id, // UV nhận
                    sender: employerId,                             // NTD gây ra
                    type: 'APPLICATION_STATUS_UPDATE',
                    message: notificationMessage,
                    link: `/candidate/applications`, // Link đến trang việc đã ứng tuyển
                    relatedApplication: populatedApplication._id,
                    relatedJob: populatedApplication.jobId._id
                });
            }
        res.status(200).json({ message: 'Cập nhật trạng thái thành công!', application: populatedApplication });
    } catch (error) {
        handleServerError(res, error, "cập nhật trạng thái ứng tuyển");
    }
};

// --- Đánh giá Application (Employer) ---
exports.evaluateApplication = async (req, res) => {
    try {
        const appId = req.params.appId;
        const { rating, notes } = req.body;
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(appId)) {
            return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }
        if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Điểm đánh giá (rating) phải là số từ 1 đến 5.' });
        }
        const application = await Application.findById(appId);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }
        if (application.employerId.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền đánh giá đơn ứng tuyển này.' });
        }
        application.evaluation = {
            rating: rating,
            notes: notes,
            evaluatedBy: employerId,
            evaluationDate: new Date()
        };
        const updatedApplicationRaw = await application.save();
        const populatedApplication = await Application.findById(updatedApplicationRaw._id)
            .populate({ path: 'candidateId', select: 'fullName email phone skills summary uploadedCVs education experience _id' })
            .populate({ path: 'jobId', select: 'title companyName _id' });
        res.status(200).json({
            message: 'Lưu đánh giá thành công!',
            application: populatedApplication
        });
    } catch (error) {
        handleServerError(res, error, "lưu đánh giá ứng tuyển");
    }
};

// --- Lên lịch phỏng vấn (Employer) ---
exports.scheduleInterview = async (req, res) => {
    try {
        const { appId } = req.params;
        const { interviewDate, interviewType, location, link, notes } = req.body;
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(appId)) {
            return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }
        if (!interviewDate || !interviewType || !location) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin lịch phỏng vấn (ngày giờ, loại, địa điểm).' });
        }
        if (location && String(location).toLowerCase() === 'online' && !link) {
            return res.status(400).json({ message: 'Vui lòng cung cấp link nếu phỏng vấn online.'});
        }
        const application = await Application.findById(appId);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }
        if (application.employerId.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền lên lịch cho đơn ứng tuyển này.' });
        }
        application.interviewDetails = {
            interviewDate: new Date(interviewDate),
            interviewType: String(interviewType),
            location: String(location),
            link: link ? String(link) : undefined,
            notes: notes ? String(notes) : undefined
        };
        application.status = 'Mời phỏng vấn';
        const updatedApplicationRaw = await application.save();
        const populatedApplication = await Application.findById(updatedApplicationRaw._id)
            .populate({ path: 'candidateId', select: 'fullName email _id' })
            .populate({ path: 'jobId', select: 'title companyName _id' });
        if (populatedApplication) {
                const jobTitle = populatedApplication.jobId.title;
                const companyName = populatedApplication.jobId.companyName;
                const interviewDateFormatted = new Date(populatedApplication.interviewDetails.interviewDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

                await createNotificationHelper({
                    recipient: populatedApplication.candidateId._id,
                    sender: req.user.userId, // Employer
                    type: 'INTERVIEW_SCHEDULED',
                    message: `Bạn có lời mời phỏng vấn cho vị trí "${jobTitle}" tại ${companyName} vào lúc ${interviewDateFormatted}. Vui lòng kiểm tra lịch hẹn.`,
                    link: '/candidate/schedule',
                    relatedApplication: populatedApplication._id,
                    relatedJob: populatedApplication.jobId._id
                });
            }
        res.status(200).json({
            message: 'Đã lên lịch phỏng vấn thành công và cập nhật trạng thái ứng viên.',
            application: populatedApplication
        });
    } catch (error) {
        handleServerError(res, error, "lên lịch phỏng vấn");
    }
};

// --- Giao bài test cho Ứng viên (Employer) ---
exports.assignTestToApplicant = async (req, res) => {
    console.log("[BACKEND][assignTestToApplicant] Req Body:", req.body);
    try {
        const { appId } = req.params;
        const { testId, deadline, notesForCandidate } = req.body;
        const employerId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(appId)) {
            return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }
        if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: 'Test ID không hợp lệ hoặc bị thiếu.' });
        }
        const application = await Application.findById(appId);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }
        if (application.employerId.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền giao bài test cho đơn ứng tuyển này.' });
        }
        const testDetails = await Test.findById(testId).select('name link');
        if (!testDetails) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin bài test đã chọn.' });
        }
        application.assignedTestDetails = {
            testId: testDetails._id,
            testName: testDetails.name,
            testLink: testDetails.link,
            sentDate: new Date(),
            deadline: deadline ? new Date(deadline) : undefined,
            notesForCandidate: notesForCandidate ? String(notesForCandidate) : undefined
        };
        application.status = 'Đã gửi bài test';
        console.log("[BACKEND][assignTestToApplicant] Data to save in assignedTestDetails:", application.assignedTestDetails);
        const updatedApplicationRaw = await application.save();
        console.log("[BACKEND][assignTestToApplicant] Application saved, raw:", updatedApplicationRaw);

        const populatedApplication = await Application.findById(updatedApplicationRaw._id)
            .populate({ path: 'candidateId', select: 'fullName email _id' })
            .populate({ path: 'jobId', select: 'title companyName _id' });
        if (populatedApplication && testDetails) {
                const jobTitle = populatedApplication.jobId.title;
                const testName = testDetails.name;

                await createNotificationHelper({
                    recipient: populatedApplication.candidateId._id,
                    sender: req.user.userId, // Employer
                    type: 'TEST_ASSIGNED',
                    message: `Bạn đã được giao bài test "${testName}" cho vị trí "${jobTitle}". Vui lòng kiểm tra lịch hẹn/bài tập.`,
                    link: '/candidate/schedule', // Hoặc một link cụ thể hơn nếu có
                    relatedApplication: populatedApplication._id,
                    relatedJob: populatedApplication.jobId._id
                });
            }
        console.log("[BACKEND][assignTestToApplicant] Populated application:", populatedApplication);
        res.status(200).json({
            message: `Đã gửi bài test "${testDetails.name}" thành công và cập nhật trạng thái ứng viên.`,
            application: populatedApplication
        });
    } catch (error) {
        handleServerError(res, error, "giao bài test cho ứng viên");
    }
};

// --- Lấy danh sách Applications của Candidate (cho mục "Việc đã ứng tuyển") ---
exports.getCandidateApplications = async (req, res) => {
    console.log("[BACKEND][getCandidateApplications] Called by Candidate ID:", req.user.userId);
    try {
        const candidateId = req.user.userId;
        const applications = await Application.find({ candidateId: candidateId })
            .populate({
                path: 'jobId',
                select: 'title companyName location _id' // Đảm bảo các trường này có trong Job model
            })
            // Không cần populate candidateId vì đây là lấy application của chính candidate đó
            .sort({ createdAt: -1 });

        console.log(`[BACKEND][getCandidateApplications] Found ${applications.length} applications. First one (if any):`, applications[0]);
        res.status(200).json(applications);
    } catch (error) {
        handleServerError(res, error, "lấy danh sách việc làm đã ứng tuyển của ứng viên");
    }
};

// --- Lấy lịch hẹn (Phỏng vấn & Test) cho Candidate (cho mục "Lịch hẹn") ---
exports.getCandidateScheduledInterviews = async (req, res) => {
    console.log("[BACKEND][getCandidateScheduledInterviews] Called by Candidate ID:", req.user.userId);
    try {
        const candidateId = req.user.userId;
        const applications = await Application.find({
            candidateId: candidateId,
            $or: [
                { status: 'Mời phỏng vấn', 'interviewDetails.interviewDate': { $exists: true, $ne: null } },
                { status: 'Đã gửi bài test', 'assignedTestDetails.testId': { $exists: true, $ne: null } }
            ]
        })
        .populate({ path: 'jobId', select: 'title companyName location companyId _id' }) // Đảm bảo jobId được populate
        .sort({ 'interviewDetails.interviewDate': 1, 'assignedTestDetails.deadline': 1, 'assignedTestDetails.sentDate': 1 });

        console.log(`[BACKEND][getCandidateScheduledInterviews] Found ${applications.length} scheduled items.`);
        applications.forEach(app => { // Log chi tiết từng application tìm được
            console.log(`  [App ID: ${app._id}] Status: ${app.status}`);
            if (app.interviewDetails && app.interviewDetails.interviewDate) {
                console.log(`    Interview Details: ${JSON.stringify(app.interviewDetails)}`);
            }
            if (app.assignedTestDetails && app.assignedTestDetails.testId) {
                console.log(`    Assigned Test Details: ${JSON.stringify(app.assignedTestDetails)}`); // QUAN TRỌNG
            }
        });
        res.status(200).json(applications);
    } catch (error) {
        handleServerError(res, error, "lấy lịch hẹn và bài tập của ứng viên");
    }
};

// --- Lấy TẤT CẢ ứng viên cho TẤT CẢ jobs của một Employer ---
exports.getAllApplicantsForEmployer = async (req, res) => {
    try {
        const employerId = req.user.userId;
        if (!employerId) {
            return res.status(401).json({ message: "Không thể xác định nhà tuyển dụng." });
        }
        const applications = await Application.find({ employerId: employerId })
            .populate({
                path: 'candidateId',
                select: 'fullName email phone address dateOfBirth linkedin portfolio skills summary uploadedCVs education experience _id'
            })
            .populate({ path: 'jobId', select: 'title companyName _id' })
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        handleServerError(res, error, "lấy danh sách tất cả ứng viên cho nhà tuyển dụng");
    }
};

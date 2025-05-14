// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');

// --- 1. Tạo Application mới (Candidate) ---
// POST /api/applications
exports.createApplication = async (req, res) => {
    // Bỏ phần khởi tạo session và transaction
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        const { jobId, cvId, coverLetter } = req.body;
        const candidateId = req.user.userId; // Lấy từ token

        // Validate input
        if (!jobId || !cvId) {
            // await session.abortTransaction(); // Bỏ
            // session.endSession(); // Bỏ
            return res.status(400).json({ message: 'Thiếu Job ID hoặc CV ID.' });
        }
        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(cvId)) {
            // await session.abortTransaction(); // Bỏ
            // session.endSession(); // Bỏ
            return res.status(400).json({ message: 'Job ID hoặc CV ID không hợp lệ.' });
        }

        // Kiểm tra ứng tuyển trùng lặp
        // Bỏ .session(session) nếu không dùng transaction
        const existingApplication = await Application.findOne({ jobId, candidateId });
        if (existingApplication) {
            // await session.abortTransaction(); // Bỏ
            // session.endSession(); // Bỏ
            return res.status(400).json({ message: 'Bạn đã ứng tuyển vào vị trí này rồi.' });
        }

        // Tìm thông tin Job để lấy employerId, companyId
        // Bỏ .session(session)
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'Active') { // Chỉ apply vào job Active
            // await session.abortTransaction(); // Bỏ
            // session.endSession(); // Bỏ
            return res.status(404).json({ message: 'Không tìm thấy công việc hoặc công việc đã đóng.' });
        }

        // Tìm thông tin Candidate để lấy chi tiết CV
        // Bỏ .session(session)
        const candidate = await User.findById(candidateId).select('uploadedCVs');
        if (!candidate) {
            // await session.abortTransaction(); // Bỏ
            // session.endSession(); // Bỏ
            return res.status(404).json({ message: 'Không tìm thấy thông tin ứng viên.' });
        }
        const selectedCv = candidate.uploadedCVs.id(cvId); // Tìm subdocument CV bằng ID
        if (!selectedCv) {
            // await session.abortTransaction(); // Bỏ
            // session.endSession(); // Bỏ
            return res.status(404).json({ message: 'CV bạn chọn không tồn tại trong hồ sơ.' });
        }

        // Tạo Application mới
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

        // Bỏ { session } khi save nếu không dùng transaction
        await newApplication.save();

        // TODO: Gửi thông báo cho Employer (sẽ làm sau)

        // await session.commitTransaction(); // Bỏ
        // session.endSession(); // Bỏ

        res.status(201).json({ message: 'Ứng tuyển thành công!', application: newApplication });

    } catch (error) {
        // await session.abortTransaction(); // Bỏ
        // session.endSession(); // Bỏ
        console.error("Create Application Error:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi ứng tuyển.' });
    }
};


// --- 2. Lấy danh sách ứng viên cho một Job (Employer) ---
// GET /api/jobs/:jobId/applicants
exports.getApplicantsForJob = async (req, res) => {
    console.log('--- [BACKEND] Reached getApplicantsForJob Controller ---'); // Log khi vào hàm
    try {
        const jobIdFromParams = req.params.jobId; // Lấy jobId từ URL params
        const employerIdFromToken = req.user.userId; // Lấy employerId từ token đã xác thực

        console.log(`[BACKEND] Attempting to get applicants for Job ID: ${jobIdFromParams}`);
        console.log(`[BACKEND] Request made by Employer ID: ${employerIdFromToken}`);

        if (!mongoose.Types.ObjectId.isValid(jobIdFromParams)) {
            console.log('[BACKEND] Invalid Job ID format.');
            return res.status(400).json({ message: 'Job ID không hợp lệ.' });
        }

        // 1. Kiểm tra xem job có tồn tại và có thuộc về employer này không
        const job = await Job.findById(jobIdFromParams);
        if (!job) {
            console.log('[BACKEND] Job not found with ID:', jobIdFromParams);
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        if (job.postedBy.toString() !== employerIdFromToken) {
            console.log('[BACKEND] Employer does not own this job. Job postedBy:', job.postedBy, 'Employer:', employerIdFromToken);
            return res.status(403).json({ message: 'Bạn không có quyền xem ứng viên cho công việc này.' });
        }
        console.log('[BACKEND] Job found and ownership verified.');

        // 2. Lấy danh sách applications cho job đó và populate thông tin candidate
        const applications = await Application.find({ jobId: jobIdFromParams })
            .populate({
                path: 'candidateId',
                select: 'fullName email phone address dateOfBirth linkedin portfolio skills summary uploadedCVs education experience' // Lấy thêm các trường cần cho ViewProfileDialog
            })
            .sort({ createdAt: -1 });

        console.log(`[BACKEND] Found ${applications.length} applications for Job ID: ${jobIdFromParams}`);
        // console.log('[BACKEND] Applications data:', JSON.stringify(applications, null, 2)); // Log chi tiết nếu cần

        res.status(200).json(applications);

    } catch (error) {
        console.error("[BACKEND] Get Applicants Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách ứng viên.' });
    }
};

// --- 3. Cập nhật trạng thái Application (Employer) ---
// PUT /api/applications/:appId/status
exports.updateApplicationStatus = async (req, res) => {
     // ... (code hàm này không dùng transaction, giữ nguyên) ...
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
        const updatedApplication = await application.save();
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
exports.evaluateApplication = async (req, res) => {
    try {
        const appId = req.params.appId;
        const { rating, notes } = req.body; // Lấy rating và notes từ request body
        const employerId = req.user.userId; // ID của NTD đang thực hiện đánh giá

        if (!mongoose.Types.ObjectId.isValid(appId)) {
            return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }

        // Kiểm tra rating có hợp lệ không (nếu được cung cấp)
        if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Điểm đánh giá (rating) phải là số từ 1 đến 5.' });
        }

        const application = await Application.findById(appId);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }

        // Kiểm tra quyền: NTD này có phải là người đăng job của application này không
        if (application.employerId.toString() !== employerId) {
            return res.status(403).json({ message: 'Bạn không có quyền đánh giá đơn ứng tuyển này.' });
        }

        // Chuẩn bị dữ liệu đánh giá
        const evaluationData = {
            rating: rating, // Sẽ là undefined nếu không có trong req.body
            notes: notes,   // Sẽ là undefined nếu không có trong req.body
            evaluatedBy: employerId,
            evaluationDate: new Date()
        };

        // Cập nhật hoặc ghi đè trường evaluation
        // Nếu bạn muốn chỉ cập nhật các field được gửi lên và giữ lại các field cũ (nếu có) trong evaluation:
        // application.evaluation = { ...application.evaluation, ...evaluationData };
        // Hoặc nếu mỗi lần submit là ghi đè toàn bộ đánh giá:
        application.evaluation = evaluationData;

        const updatedApplication = await application.save();

        // Populate lại thông tin candidate để trả về cho client (tương tự getApplicantsForJob)
        const populatedApplication = await Application.findById(updatedApplication._id)
            .populate({
                path: 'candidateId',
                select: 'fullName email phone skills summary uploadedCVs education experience'
            })
            .populate({ path: 'jobId', select: 'title companyName' }) // Nếu cần thông tin job


        res.status(200).json({
            message: 'Lưu đánh giá thành công!',
            application: populatedApplication // Trả về application đã cập nhật và populate
        });

    } catch (error) {
        console.error("Evaluate Application Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi lưu đánh giá.' });
    }
};
// --- 4. Lấy danh sách Applications của Candidate ---
// GET /api/applications/candidate
exports.getCandidateApplications = async (req, res) => {
    // ... (code hàm này không dùng transaction, giữ nguyên) ...
    try {
        const candidateId = req.user.userId;
        const applications = await Application.find({ candidateId: candidateId })
            .populate({
                path: 'jobId',
                select: 'title companyName location'
            })
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        console.error("Get Candidate Applications Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách việc làm đã ứng tuyển.' });
    }
};
// --- 6. Lấy TẤT CẢ ứng viên cho TẤT CẢ jobs của một Employer ---
// GET /api/applications/employer/all
exports.getAllApplicantsForEmployer = async (req, res) => {
    console.log('--- [BACKEND] Reached getAllApplicantsForEmployer Controller ---');
    try {
        const employerId = req.user.userId;
        console.log(`[BACKEND] getAllApplicantsForEmployer - Attempting to fetch for Employer ID: ${employerId}`);

        if (!employerId) {
            console.error("[BACKEND] getAllApplicantsForEmployer - Critical: Employer ID is missing from req.user.");
            return res.status(400).json({ message: "Không thể xác định nhà tuyển dụng. Token có thể không hợp lệ hoặc thiếu thông tin." });
        }
        if (!mongoose.Types.ObjectId.isValid(employerId)) {
            console.error(`[BACKEND] getAllApplicantsForEmployer - Invalid Employer ID format: ${employerId}`);
            return res.status(400).json({ message: "Định dạng ID nhà tuyển dụng không hợp lệ." });
        }

        const applications = await Application.find({ employerId: employerId })
            .populate({
                path: 'candidateId',
                select: 'fullName email phone address dateOfBirth linkedin portfolio skills summary uploadedCVs education experience _id'
            })
            .populate({
                path: 'jobId',
                select: 'title companyName _id' // Đảm bảo lấy _id của Job
            })
            .sort({ createdAt: -1 });

        console.log(`[BACKEND] getAllApplicantsForEmployer - Found ${applications.length} total applications for Employer ID: ${employerId}.`);
        
        res.status(200).json(applications);

    } catch (error) {
        console.error("[BACKEND] getAllApplicantsForEmployer Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách tất cả ứng viên.' });
    }
};
// PUT /api/applications/:appId/schedule-interview
exports.scheduleInterview = async (req, res) => {
    //const session = await mongoose.startSession(); // Cân nhắc dùng transaction nếu có nhiều thao tác DB
    //session.startTransaction();
    try {
        const { appId } = req.params;
        const { interviewDate, interviewTime, interviewType, location, link, notes } = req.body;
        const employerId = req.user.userId; // Lấy từ token

        if (!mongoose.Types.ObjectId.isValid(appId)) {
            //await session.abortTransaction();
            //session.endSession();
            return res.status(400).json({ message: 'Application ID không hợp lệ.' });
        }

        // Kiểm tra các trường bắt buộc cho lịch phỏng vấn
        if (!interviewDate || /*!interviewTime ||*/ !interviewType || !location) {
             //await session.abortTransaction();
             //session.endSession();
            return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin lịch phỏng vấn (ngày, giờ, loại, địa điểm).' });
        }
        if (location && location.toLowerCase() === 'online' && !link) {
            //await session.abortTransaction();
            //session.endSession();
            return res.status(400).json({ message: 'Vui lòng cung cấp link nếu phỏng vấn online.'});
        }


        const application = await Application.findById(appId);
        if (!application) {
            //await session.abortTransaction();
            //session.endSession();
            return res.status(404).json({ message: 'Không tìm thấy đơn ứng tuyển.' });
        }

        // Kiểm tra quyền của employer
        if (application.employerId.toString() !== employerId) {
            //await session.abortTransaction();
            //session.endSession();
            return res.status(403).json({ message: 'Bạn không có quyền lên lịch cho đơn ứng tuyển này.' });
        }

        // Cập nhật chi tiết lịch phỏng vấn và trạng thái
        application.interviewDetails = {
            interviewDate: new Date(interviewDate),
            interviewType: String(interviewType),     
            location: String(location),         
            link: link ? String(link) : undefined, 
            notes: notes ? String(notes) : undefined
        };

        application.status = 'Mời phỏng vấn'; // Cập nhật trạng thái

        const updatedApplication = await application.save();

        // (Nâng cao) Gửi email thông báo cho ứng viên tại đây
        // sendInterviewInvitationEmail(application.candidateId, updatedApplication);

        //await session.commitTransaction();
        //session.endSession();

        res.status(200).json({
            message: 'Đã lên lịch phỏng vấn thành công và cập nhật trạng thái ứng viên.',
            application: updatedApplication
        });

    } catch (error) {
        //await session.abortTransaction();
        //session.endSession();
        console.error("Schedule Interview Error:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi lên lịch phỏng vấn.' });
    }
};
exports.getCandidateScheduledInterviews = async (req, res) => {
    try {
        const candidateId = req.user.userId;
        const applications = await Application.find({
            candidateId: candidateId,
            status: 'Mời phỏng vấn',
            'interviewDetails.interviewDate': { $exists: true } // Chỉ lấy những application có lịch phỏng vấn
        })
        .populate({ path: 'jobId', select: 'title companyName' })
        .populate({ path: 'interviewDetails.interviewers', select: 'fullName email' }) // Nếu có trường interviewers
        .sort({ 'interviewDetails.interviewDate': 1 }); // Sắp xếp theo ngày phỏng vấn

        res.status(200).json(applications);
    } catch (error) {
        handleServerError(res, error, "lấy lịch phỏng vấn của ứng viên");
    }
};
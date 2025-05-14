// backend/controllers/jobController.js
const Job = require('../models/Job');
const mongoose = require('mongoose');

// --- 1. Tạo Job mới (POST /api/jobs) ---
exports.createJob = async (req, res) => {
    console.log('--- Received Request to Create Job ---');
    try {
        // Lấy dữ liệu job chính từ body request
        const {
            title, companyName: reqCompanyName, // Lấy từ body làm dự phòng
            location, type, salary, description,
            requirements, benefits, industry, requiredSkills,
            experienceLevel, numberOfHires, applicationDeadline,
            associatedTestIds
        } = req.body;

        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        // <<< BƯỚC 1: LẤY THÔNG TIN TỪ req.user (từ token) LÊN TRƯỚC >>>
        if (!req.user || !req.user.userId) {
             console.error('Error: req.user or req.user.userId is missing. Check protect middleware.');
             return res.status(401).json({ message: 'Xác thực thất bại hoặc thiếu thông tin người dùng.' });
        }
        const postedByUserId = req.user.userId;
        const employerCompanyName = req.user.companyName; // Lấy CompanyName từ token
        const employerCompanyId = req.user.companyId;    // Lấy CompanyId từ token

        console.log('User Info from Token:', JSON.stringify(req.user, null, 2));

        // --- VALIDATE DỮ LIỆU ĐẦU VÀO ---
        // In ra các giá trị cụ thể đang được kiểm tra
        console.log('--- Checking fields for validation ---');
        console.log('Title:', title);
        console.log('CompanyName (from token):', employerCompanyName); // <<< Sửa: Dùng employerCompanyName
        console.log('Location:', location);
        console.log('Type:', type);
        console.log('Description:', description);
        console.log('Requirements:', requirements);
        console.log('PostedByUserId:', postedByUserId);
        console.log('------------------------------------');

        // Sử dụng employerCompanyName (lấy từ token) để kiểm tra
        if (!title || !employerCompanyName || !location || !type || !description || !requirements || !postedByUserId) {
             console.log('>>> Validation Failed! Sending 400 Error.');
             // Trả về lỗi rõ ràng hơn
             let missingFields = [];
             if (!title) missingFields.push('Chức danh');
             if (!employerCompanyName) missingFields.push('Tên công ty (từ tài khoản)'); // Chỉ rõ nguồn
             if (!location) missingFields.push('Địa điểm');
             if (!type) missingFields.push('Loại hình');
             if (!description) missingFields.push('Mô tả');
             if (!requirements) missingFields.push('Yêu cầu');
             if (!postedByUserId) missingFields.push('Thông tin người đăng');
             return res.status(400).json({ message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}.` });
        }
        // TODO: Thêm kiểm tra companyId nếu cần

        // --- Tạo đối tượng Job mới ---
        const newJobData = {
            title,
            companyName: employerCompanyName, // <<< Dùng biến chuẩn hóa từ token
            companyId: employerCompanyId,     // <<< Dùng biến chuẩn hóa từ token
            postedBy: postedByUserId,
            location,
            type,
            salary,
            description,
            requirements,
            benefits,
            industry, // Lấy từ req.body
            requiredSkills,
            experienceLevel,
            numberOfHires: parseInt(numberOfHires, 10) || 1,
            applicationDeadline: applicationDeadline || null,
            associatedTests: Array.isArray(associatedTestIds) ? associatedTestIds : [],
            status: 'Active'
        };

        console.log('--- Creating new Job with data ---');
        console.log(JSON.stringify(newJobData, null, 2));
        console.log('---------------------------------');

        const newJob = new Job(newJobData);

        // --- Lưu vào CSDL ---
        const savedJob = await newJob.save();
        console.log('--- Job Saved Successfully! ---');

        res.status(201).json({ message: 'Tạo tin tuyển dụng thành công!', job: savedJob });

    } catch (error) {
        console.error("Create Job Error:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             console.error("Validation Errors:", messages);
             return res.status(400).json({ message: `Lỗi validation: ${messages.join('. ')}` });
        }
        console.error("Unhandled Server Error:", error.message, error.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo tin tuyển dụng.' });
    }
};

// --- Lấy danh sách Jobs của Employer đang đăng nhập ---
exports.getEmployerJobs = async (req, res) => {
    console.log('--- [BACKEND] Reached getEmployerJobs Controller ---');
    try {
        const employerId = req.user.userId;
        if (!employerId) {
            return res.status(401).json({ message: 'Không thể xác định nhà tuyển dụng.' });
        }

        const jobsWithApplicantCount = await Job.aggregate([
            { $match: { postedBy: new mongoose.Types.ObjectId(employerId) } }, // Lọc job của employer
            {
                $lookup: { // Join với collection 'applications'
                    from: 'applications', // Tên collection applications trong DB
                    localField: '_id',    // Khóa của Job model
                    foreignField: 'jobId',// Khóa của Application model
                    as: 'jobApplicants'   // Tên mảng kết quả join
                }
            },
            {
                $addFields: { // Thêm trường applicantCount
                    applicantCount: { $size: '$jobApplicants' }
                }
            },
            {
                $project: { // Loại bỏ mảng jobApplicants không cần thiết trả về client
                    jobApplicants: 0
                }
            },
            { $sort: { createdAt: -1 } } // Sắp xếp
        ]);

        console.log(`[BACKEND] Found ${jobsWithApplicantCount.length} jobs with applicant counts for employer.`);
        res.status(200).json(jobsWithApplicantCount);

    } catch (error) {
        console.error("[BACKEND] Error in getEmployerJobs:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc của bạn.' });
    }
};

// --- Lấy tất cả Jobs công khai ---
exports.getAllJobs = async (req, res) => {
    // ... (code hàm này giữ nguyên như trước) ...
     try {
        const jobs = await Job.find({ status: 'Active' }).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Get All Jobs Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc.' });
    }
};

// --- Lấy chi tiết một Job ---
exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(jobId)) { // ID format is valid in user's example
            return res.status(400).json({ message: 'ID công việc không hợp lệ.' });
        }
        console.log(`Finding job with ID: ${jobId}`); // Add log
        const job = await Job.findById(jobId); // <<< The database lookup happens here
        console.log('Job found:', job); // Add log

        if (!job) {
            // <<< THIS IS LIKELY WHERE THE 404 RESPONSE IS SENT >>>
            console.log(`Job with ID ${jobId} not found in DB.`); // Add log
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        res.status(200).json(job); // Send job if found
    } catch (error) {
        console.error("Get Job By ID Error:", error); // Check for DB errors here
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết công việc.' });
    }
};

// --- Cập nhật Job ---
exports.updateJob = async (req, res) => {
    // ... (code hàm này giữ nguyên như trước, đã có kiểm tra mongoose.Types.ObjectId và quyền sở hữu) ...
      try {
        const jobId = req.params.id;
        const updates = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ.' });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        if (job.postedBy.toString() !== userId) {
             return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa tin tuyển dụng này.' });
        }
        const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true, runValidators: true });
        res.status(200).json({ message: 'Cập nhật tin tuyển dụng thành công!', job: updatedJob });
    } catch (error) {
        console.error("Update Job Error:", error);
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tin tuyển dụng.' });
    }
};

// --- Xóa Job ---
exports.deleteJob = async (req, res) => {
    // ... (code hàm này giữ nguyên như trước, đã có kiểm tra mongoose.Types.ObjectId và quyền sở hữu) ...
      try {
        const jobId = req.params.id;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ.' });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        if (job.postedBy.toString() !== userId) {
             return res.status(403).json({ message: 'Bạn không có quyền xóa tin tuyển dụng này.' });
        }
        await Job.findByIdAndDelete(jobId);
        res.status(200).json({ message: 'Xóa tin tuyển dụng thành công!' });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa tin tuyển dụng.' });
    }
};
exports.getJobsByCompany = async (req, res) => {
    try {
        const companyId = req.params.companyId;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'Company ID không hợp lệ.' });
        }

        // Tìm các jobs thuộc companyId này và có status là 'Active'
        // Đồng thời populate tên công ty để hiển thị (mặc dù đã biết companyId)
        const jobs = await Job.find({ companyId: companyId, status: 'Active' })
            .sort({ createdAt: -1 }); // Sắp xếp job mới nhất lên đầu

        if (!jobs) { // jobs sẽ là mảng rỗng nếu không tìm thấy, không phải null
            return res.status(200).json([]); // Trả về mảng rỗng nếu không có job
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Get Jobs By Company Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc của công ty.' });
    }
};
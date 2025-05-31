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

        if (!req.user || !req.user.userId) {
            console.error('Error: req.user or req.user.userId is missing. Check protect middleware.');
            return res.status(401).json({ message: 'Xác thực thất bại hoặc thiếu thông tin người dùng.' });
        }
        const postedByUserId = req.user.userId;
        const employerCompanyName = req.user.companyName; // Lấy CompanyName từ token
        const employerCompanyId = req.user.companyId;   // Lấy CompanyId từ token

        console.log('User Info from Token:', JSON.stringify(req.user, null, 2));

        console.log('--- Checking fields for validation ---');
        console.log('Title:', title);
        console.log('CompanyName (from token):', employerCompanyName);
        console.log('Location:', location);
        console.log('Type:', type);
        console.log('Description:', description);
        console.log('Requirements:', requirements);
        console.log('PostedByUserId:', postedByUserId);
        console.log('------------------------------------');

        if (!title || !employerCompanyName || !location || !type || !description || !requirements || !postedByUserId) {
            console.log('>>> Validation Failed! Sending 400 Error.');
            let missingFields = [];
            if (!title) missingFields.push('Chức danh');
            if (!employerCompanyName) missingFields.push('Tên công ty (từ tài khoản)');
            if (!location) missingFields.push('Địa điểm');
            if (!type) missingFields.push('Loại hình');
            if (!description) missingFields.push('Mô tả');
            if (!requirements) missingFields.push('Yêu cầu');
            if (!postedByUserId) missingFields.push('Thông tin người đăng');
            return res.status(400).json({ message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}.` });
        }

        const newJobData = {
            title,
            companyName: employerCompanyName,
            companyId: employerCompanyId,
            postedBy: postedByUserId,
            location, // Giả định location là một String, ví dụ: "TP. Hồ Chí Minh"
            type,
            salary,
            description,
            requirements,
            benefits,
            industry,
            requiredSkills,
            experienceLevel,
            numberOfHires: parseInt(numberOfHires, 10) || 1,
            applicationDeadline: applicationDeadline || null,
            associatedTests: Array.isArray(associatedTestIds) ? associatedTestIds : [],
            //status: 'Active'
        };

        console.log('--- Creating new Job with data ---');
        console.log(JSON.stringify(newJobData, null, 2));
        console.log('---------------------------------');

        const newJob = new Job(newJobData);
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
            { $match: { postedBy: new mongoose.Types.ObjectId(employerId) } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'jobId',
                    as: 'jobApplicants'
                }
            },
            {
                $addFields: {
                    applicantCount: { $size: '$jobApplicants' }
                }
            },
            {
                $project: {
                    jobApplicants: 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        console.log(`[BACKEND] Found ${jobsWithApplicantCount.length} jobs with applicant counts for employer.`);
        res.status(200).json(jobsWithApplicantCount);

    } catch (error) {
        console.error("[BACKEND] Error in getEmployerJobs:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc của bạn.' });
    }
};

// --- Lấy tất cả Jobs công khai (CÓ LỌC VÀ PHÂN TRANG) ---
exports.getAllJobs = async (req, res) => {
    try {
        const {
            keyword,
            location, // Mong đợi là chuỗi dạng "TP. HCM,Hà Nội" hoặc một địa điểm
            type,     // Mong đợi là chuỗi dạng "Full-time,Part-time" hoặc một loại
            experienceLevel, // Mong đợi là chuỗi dạng "1 năm,2 năm" hoặc một mức
            salary,   // Mong đợi là chuỗi dạng "10-15,20-30" hoặc một mức
            industry, // Mong đợi là một chuỗi ngành nghề
            sort = '-createdAt', // Mặc định sắp xếp
            page = 1,
            limit = 12 // Giống jobsPerPage ở frontend
        } = req.query;

        const queryOptions = { status: 'Active' };

        // 1. Lọc theo từ khóa (keyword)
        if (keyword) {
            const keywordRegex = { $regex: keyword, $options: 'i' };
            queryOptions.$or = [
                { title: keywordRegex },
                { companyName: keywordRegex },
                { description: keywordRegex },
                { requiredSkills: keywordRegex },
                { location: keywordRegex }, // Cho phép keyword tìm trong location luôn
                { industry: keywordRegex }
            ];
        }

        // 2. Lọc theo địa điểm (location)
        // Giả định trường 'location' trong Job model là một String.
        // Ví dụ: "TP. Hồ Chí Minh", "Hà Nội".
        if (location) {
            const locationsArray = location.split(',').map(loc => loc.trim());
            // Tạo một mảng các biểu thức chính quy (regex) không phân biệt hoa thường
            // cho mỗi địa điểm. Điều này giúp khớp "TP. Hồ Chí Minh" với "tp. hồ chí minh".
            // Ký tự ^ và $ đảm bảo khớp chính xác toàn bộ chuỗi địa điểm.
            const regexLocations = locationsArray.map(loc => 
                new RegExp(`^${loc.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
            );
            queryOptions.location = { $in: regexLocations };
        }

        // 3. Lọc theo loại hình công việc (type)
        if (type) {
            const typesArray = type.split(',').map(t => t.trim());
            const regexTypes = typesArray.map(t => 
                new RegExp(`^${t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
            );
            queryOptions.type = { $in: regexTypes };
        }

        // 4. Lọc theo kinh nghiệm (experienceLevel)
        if (experienceLevel) {
            const experienceLevelsArray = experienceLevel.split(',').map(exp => exp.trim());
            const regexExperienceLevels = experienceLevelsArray.map(exp => 
                new RegExp(`^${exp.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
            );
            queryOptions.experienceLevel = { $in: regexExperienceLevels };
        }

        // 5. Lọc theo mức lương (salary)
        if (salary) {
            const salariesArray = salary.split(',').map(s => s.trim());
            const regexSalaries = salariesArray.map(s => 
                new RegExp(`^${s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
            );
            queryOptions.salary = { $in: regexSalaries };
        }

        // 6. Lọc theo ngành nghề (industry)
        if (industry) {
            // Cho phép tìm kiếm industry không cần khớp toàn bộ, ví dụ "Công nghệ" sẽ khớp "Công nghệ Thông tin"
            queryOptions.industry = { $regex: industry.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
        }

        // --- Thực thi truy vấn và phân trang ---
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalJobs = await Job.countDocuments(queryOptions);
        const jobs = await Job.find(queryOptions)
            .sort(sort.split(',').join(' '))
            .skip(skip)
            .limit(limitNum)
            .populate('companyId', 'name logo slug');

        const totalPages = Math.ceil(totalJobs / limitNum);

        res.status(200).json({
            status: 'success',
            totalJobs,
            totalPages,
            currentPage: pageNum,
            results: jobs.length,
            data: jobs
        });

    } catch (error) {
        console.error("Get All Jobs Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc.' });
    }
};


// --- Lấy chi tiết một Job ---
exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ.' });
        }
        console.log(`Finding job with ID: ${jobId}`);
        const job = await Job.findById(jobId).populate('companyId', 'name logo description website industry companySize location slug');
        console.log('Job found:', job);

        if (!job) {
            console.log(`Job with ID ${jobId} not found in DB.`);
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error("Get Job By ID Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết công việc.' });
    }
};

// --- Cập nhật Job ---
exports.updateJob = async (req, res) => {
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

        // >>> THÊM KIỂM TRA APPROVAL STATUS Ở ĐÂY <<<
        if (job.approvalStatus === 'Pending') {
            // Nếu công việc đang chờ duyệt, không cho phép nhà tuyển dụng thay đổi status (khóa/mở)
            if (updates.hasOwnProperty('status')) {
                return res.status(403).json({ message: 'Công việc đang chờ phê duyệt. Bạn không thể thay đổi trạng thái (khóa/mở) vào lúc này.' });
            }
            // Bạn cũng có thể hạn chế các trường khác nếu cần, ví dụ: không cho sửa title, description khi đang chờ duyệt
            // delete updates.title;
            // delete updates.description;
        } else if (job.approvalStatus === 'Rejected') {
            // Nếu công việc đã bị từ chối, có thể cũng không cho phép thay đổi status
             if (updates.hasOwnProperty('status')) {
                return res.status(403).json({ message: 'Công việc này đã bị từ chối. Bạn không thể thay đổi trạng thái (khóa/mở).' });
            }
        }


        // Nhà tuyển dụng không được tự ý thay đổi các trường này qua hàm updateJob thông thường
        delete updates.approvalStatus;
        delete updates.approvedBy;
        delete updates.approvedAt;
        delete updates.rejectionReason;

        // Giữ lại companyName và companyId từ job gốc, không cho phép cập nhật qua đây
        updates.companyName = job.companyName;
        updates.companyId = job.companyId;


        const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true, runValidators: true });

        if (!updatedJob) {
            // Trường hợp này ít xảy ra nếu job.findById(jobId) ở trên đã thành công
            return res.status(404).json({ message: 'Không tìm thấy công việc sau khi cập nhật.' });
        }

        res.status(200).json({ message: 'Cập nhật tin tuyển dụng thành công!', job: updatedJob });

    } catch (error) {
        console.error("Update Job Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Lỗi validation: ${messages.join('. ')}` });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tin tuyển dụng.' });
    }
};

// --- Xóa Job ---
exports.deleteJob = async (req, res) => {
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

// --- Lấy Jobs theo Company ID ---
exports.getJobsByCompany = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'Company ID không hợp lệ.' });
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const queryOptions = { companyId: companyId, status: 'Active' };

        const totalJobs = await Job.countDocuments(queryOptions);
        const jobs = await Job.find(queryOptions)
            .sort(sort.split(',').join(' '))
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalJobs / limitNum);

        res.status(200).json({
            status: 'success',
            totalJobs,
            totalPages,
            currentPage: pageNum,
            results: jobs.length,
            data: jobs
        });
    } catch (error) {
        console.error("Get Jobs By Company Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc của công ty.' });
    }
};

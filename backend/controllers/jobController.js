// backend/controllers/jobController.js
const Job = require('../models/Job');
// (Có thể cần import các model khác như Company, User sau)

// --- 1. Tạo Job mới (POST /api/jobs) ---
// Yêu cầu: Đã đăng nhập, vai trò 'employer'
exports.createJob = async (req, res) => {
    try {
        // Lấy dữ liệu từ body request
        const {
            title, companyName, location, type, salary, description,
            requirements, benefits, industry, requiredSkills,
            experienceLevel, numberOfHires, applicationDeadline,
            associatedTestIds // Giả sử frontend gửi mảng ID của test
            // companyId sẽ lấy từ đâu? Tạm thời có thể yêu cầu gửi kèm hoặc lấy từ user employer
        } = req.body;

        // Lấy ID của employer từ middleware protect (req.user được gắn ở middleware)
        const postedByUserId = req.user.userId; // userId được lấy từ token payload

        // --- VALIDATE DỮ LIỆU ĐẦU VÀO ---
        if (!title || !companyName || !location || !type || !description || !requirements || !postedByUserId) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc để tạo công việc.' });
        }

        // (Thêm Validate companyId nếu bạn yêu cầu nó trong body hoặc lấy từ req.user)
        // Ví dụ: Lấy companyId từ thông tin user (nếu đã lưu trong User model/token)
        // const companyId = req.user.companyId; // Giả sử có companyId trong token payload
        // if (!companyId) {
        //     return res.status(400).json({ message: 'Không tìm thấy thông tin công ty của nhà tuyển dụng.' });
        // }


        // Tạo job mới
        const newJob = new Job({
            title,
            companyName,
            // companyId, // Thêm vào nếu đã lấy được ở trên
            postedBy: postedByUserId, // Gán ID của employer đăng bài
            location,
            type,
            salary,
            description,
            requirements,
            benefits,
            industry,
            requiredSkills,
            experienceLevel,
            numberOfHires,
            applicationDeadline: applicationDeadline || null, // null nếu không cung cấp
            associatedTests: associatedTestIds || [], // Mảng ID các bài test
            status: 'Active' // Mặc định là Active khi tạo
        });

        // Lưu vào CSDL
        const savedJob = await newJob.save();

        res.status(201).json({ message: 'Tạo tin tuyển dụng thành công!', job: savedJob });

    } catch (error) {
        console.error("Create Job Error:", error);
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo tin tuyển dụng.' });
    }
};

// --- 2. Lấy tất cả Jobs (GET /api/jobs) ---
// Có thể thêm lọc, phân trang, sắp xếp ở đây
exports.getAllJobs = async (req, res) => {
    try {
        // Chỉ lấy các job đang Active để hiển thị công khai (ví dụ)
        const jobs = await Job.find({ status: 'Active' })
                              .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Get All Jobs Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công việc.' });
    }
};

// --- 3. Lấy chi tiết một Job (GET /api/jobs/:id) ---
exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id; // Lấy ID từ URL parameter

        // Kiểm tra ID có hợp lệ không (Mongoose ObjectId)
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ.' });
        }

        const job = await Job.findById(jobId);
                            // .populate('postedBy', 'fullName email companyName') // Lấy thêm thông tin người đăng (tùy chọn)
                            // .populate('companyId', 'name logoUrl'); // Lấy thêm thông tin công ty (tùy chọn)

        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc.' }); // 404: Not Found
        }

        res.status(200).json(job);
    } catch (error) {
        console.error("Get Job By ID Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết công việc.' });
    }
};


// --- 4. Cập nhật Job (PUT /api/jobs/:id) ---
// Yêu cầu: Đã đăng nhập, vai trò 'employer', là người đăng job đó
exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const updates = req.body; // Dữ liệu cần cập nhật từ body
        const userId = req.user.userId; // ID của user đang thực hiện request

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'ID công việc không hợp lệ.' });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }

        // --- KIỂM TRA QUYỀN SỞ HỮU ---
        if (job.postedBy.toString() !== userId) {
             return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa tin tuyển dụng này.' }); // 403: Forbidden
        }

        // Cập nhật job, { new: true } để trả về bản ghi đã được cập nhật
        // runValidators: true để chạy lại các validation trong Schema khi cập nhật
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

// --- 5. Xóa Job (DELETE /api/jobs/:id) ---
// Yêu cầu: Đã đăng nhập, vai trò 'employer', là người đăng job đó
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

        // --- KIỂM TRA QUYỀN SỞ HỮU ---
        if (job.postedBy.toString() !== userId) {
             return res.status(403).json({ message: 'Bạn không có quyền xóa tin tuyển dụng này.' });
        }

        // Xóa job
        await Job.findByIdAndDelete(jobId);

        // TODO: Có thể cần xóa các Applications liên quan đến job này (nếu cần)

        res.status(200).json({ message: 'Xóa tin tuyển dụng thành công!' });

    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa tin tuyển dụng.' });
    }
};
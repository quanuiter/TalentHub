// code/backend/controllers/companyController.js
const Company = require('../models/Company');
const Job = require('../models/Job'); // Để đếm số lượng jobs của mỗi công ty
const mongoose = require('mongoose');

// --- Lấy tất cả Companies công khai ---
// GET /api/companies
exports.getAllCompanies = async (req, res) => {
    try {
        // Lấy tất cả các công ty
        const companies = await Company.find().lean(); // .lean() để trả về plain JS objects, nhanh hơn

        // Để hiển thị "X Jobs" trên CompanyCard, chúng ta cần đếm số lượng job đang active cho mỗi công ty
        const companiesWithJobCounts = await Promise.all(
            companies.map(async (company) => {
                const jobCount = await Job.countDocuments({ companyId: company._id, status: 'Active' });

                // Dữ liệu trả về cần khớp với những gì CompanyCard.jsx mong đợi
                // Hoặc bạn sẽ cần điều chỉnh CompanyCard.jsx sau
                return {
                    id: company._id, // Frontend của bạn có thể đang dùng 'id' thay vì '_id'
                    name: company.name,
                    logoUrl: company.logoUrl || '', // Cung cấp giá trị mặc định nếu null
                    description: company.description, // Nếu CompanyCard cần
                    website: company.website, // Nếu CompanyCard cần
                    address: company.address, // Có thể dùng để suy ra 'locations'
                    industry: company.industry, // Nếu CompanyCard cần
                    size: company.size, // Nếu CompanyCard cần
                    jobCount: jobCount,
                    // Các trường CompanyCard.jsx đang dùng:
                    // locations: (suy ra từ address hoặc thêm trường riêng)
                    // techStack: (thêm trường riêng vào Company model hoặc tạo mock/suy ra từ industry)
                    // Tạm thời cho CompanyCard, chúng ta sẽ cần đảm bảo nó có các trường này
                    locations: company.address || 'Nhiều địa điểm', // Ví dụ
                    techStack: company.industry ? [company.industry, 'MockTech'] : ['MockTech1', 'MockTech2'] // Ví dụ
                };
            })
        );

        // Sắp xếp công ty (ví dụ: theo tên, hoặc theo số lượng job giảm dần)
        companiesWithJobCounts.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        // Hoặc sắp xếp theo jobCount: companiesWithJobCounts.sort((a, b) => b.jobCount - a.jobCount);


        res.status(200).json(companiesWithJobCounts);
    } catch (error) {
        console.error("Get All Companies Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách công ty.' });
    }
};

// --- Lấy chi tiết một Company (có thể dùng cho trang CompanyDetailPage sau này) ---
// GET /api/companies/:id
exports.getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'ID công  không  hợp lệ.' });
        }

        const company = await Company.findById(companyId).lean();
        if (!company) {
            return res.status(404).json({ message: 'Không tìm thấy công ty.' });
        }

        const jobCount = await Job.countDocuments({ companyId: company._id, status: 'Active' });

        const companyDataForDetail = {
            id: company._id,
            name: company.name,
            logoUrl: company.logoUrl || '',
            description: company.description,
            website: company.website,
            address: company.address,
            industry: company.industry,
            size: company.size,
            jobCount: jobCount,
            // Giả sử CompanyDetailPage cũng cần locations và techStack
            locations: company.address || 'Nhiều địa điểm',
            techStack: company.industry ? [company.industry, 'MockTech Detail'] : ['DetailTech1', 'DetailTech2']
        };

        res.status(200).json(companyDataForDetail);
    } catch (error) {
        console.error("Get Company By ID Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết công ty.' });
    }
};
exports.getMyCompanyProfile = async (req, res) => {
    try {
        console.log('[getMyCompanyProfile] req.user received:', JSON.stringify(req.user, null, 2)); 
        const companyId = req.user.companyId; // Lấy từ token JWT (đã được middleware `protect` thêm vào `req.user`)

        if (!companyId) {
            // Trường hợp này có thể xảy ra nếu NTD mới đăng ký và chưa được gán/tạo công ty
            // Hoặc token không chứa companyId (cần kiểm tra logic tạo token)
            return res.status(404).json({ message: 'Tài khoản của bạn chưa được liên kết với công ty nào.' });
        }
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'ID công ty trong tài khoản của bạn không hợp lệ.' });
        }

        const company = await Company.findById(companyId).lean();

        if (!company) {
            // NTD có companyId trong token nhưng không tìm thấy công ty trong DB (lỗi dữ liệu)
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ công ty được liên kết.' });
        }

        // Trả về thông tin công ty, map _id sang id nếu frontend cần
        const companyProfileData = {
            ...company, // Giữ lại tất cả các trường từ company
            id: company._id // Đảm bảo frontend nhận được 'id'
        };
        // delete companyProfileData._id; // Xóa _id nếu đã map sang id

        res.status(200).json(companyProfileData);
    } catch (error) {
        console.error("Get My Company Profile Error:", error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy hồ sơ công ty của bạn.' });
    }
};

// --- NHÀ TUYỂN DỤNG CẬP NHẬT HỒ SƠ CÔNG TY CỦA CHÍNH MÌNH ---
// PUT /api/companies/my-profile
exports.updateMyCompanyProfile = async (req, res) => {
    try {
        const companyId = req.user.companyId; // Lấy từ token
        const updates = req.body; // Dữ liệu cập nhật từ frontend

        if (!companyId) {
            return res.status(400).json({ message: 'Không thể xác định công ty để cập nhật. Tài khoản của bạn có thể chưa liên kết với công ty nào.' });
        }
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: 'ID công ty không hợp lệ.' });
        }

        // Ngăn chặn cập nhật một số trường không mong muốn (ví dụ: _id, id, createdBy)
        delete updates._id;
        delete updates.id;
        delete updates.createdBy; // NTD không thể tự đổi người tạo công ty

        // Tìm và cập nhật công ty
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updates, // Dữ liệu cần cập nhật
            { new: true, runValidators: true } // Options: trả về document mới sau khi cập nhật, và chạy schema validators
        ).lean(); // .lean() để trả về plain JS object

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Không tìm thấy công ty để cập nhật. Vui lòng thử lại.' });
        }
        
        // Chuẩn bị dữ liệu trả về cho frontend
        const responseData = { ...updatedCompany, id: updatedCompany._id };
        // delete responseData._id;

        res.status(200).json({ message: 'Cập nhật hồ sơ công ty thành công!', company: responseData });

    } catch (error) {
        console.error("Update My Company Profile Error:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Lỗi xác thực dữ liệu: ${messages.join('. ')}` });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hồ sơ công ty.' });
    }
};
// src/services/api.js
import axios from 'axios';
import process from 'process'; // Để sử dụng process.env trong frontend
// Địa chỉ cơ sở của backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
// Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Interceptor để tự động thêm Token vào Header ---
// Interceptor này sẽ chạy trước mỗi request được gửi đi bởi apiClient
apiClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (hoặc nơi bạn lưu trữ token sau khi đăng nhập)
        const token = localStorage.getItem('authToken'); // Giả sử bạn lưu token với key 'authToken'

        if (token) {
            // Nếu có token, thêm vào header Authorization
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config; // Trả về config đã được sửa đổi (hoặc không)
    },
    (error) => {
        // Xử lý lỗi nếu có vấn đề khi cấu hình request
        return Promise.reject(error);
    }
);

// --- Định nghĩa các hàm gọi API cụ thể ---

// === Auth APIs ===
export const registerApi = (userData) => apiClient.post('/auth/register', userData);
export const loginApi = (credentials) => apiClient.post('/auth/login', credentials);
// export const getMeApi = () => apiClient.get('/auth/me'); // Ví dụ API lấy thông tin user hiện tại

// === Job APIs ===
// Lấy danh sách jobs công khai (ví dụ: chỉ lấy job 'Active')
export const getPublicJobs = (params = {}) => apiClient.get('/jobs', { params }); // params để lọc/phân trang sau này
export const getJobDetailsApi = (jobId) => apiClient.get(`/jobs/${jobId}`);
// Tạo job mới (yêu cầu token)
export const createJobApi = (jobData) => apiClient.post('/jobs', jobData);
// Cập nhật job (yêu cầu token)
export const updateJobApi = (jobId, jobData) => apiClient.put(`/jobs/${jobId}`, jobData);
// Xóa job (yêu cầu token)
export const deleteJobApi = (jobId) => apiClient.delete(`/jobs/${jobId}`);

// === Candidate APIs (Ví dụ) ===
// export const applyJobApi = (applicationData) => apiClient.post('/apply', applicationData);
// export const getAppliedJobsApi = () => apiClient.get('/candidate/applications');

// === Company APIs (Ví dụ) ===
// export const getPublicCompanies = (params = {}) => apiClient.get('/companies', { params });
// export const getCompanyDetailsApi = (companyId) => apiClient.get(`/companies/${companyId}`);


// Export apiClient nếu muốn dùng trực tiếp ở nơi khác (ít khuyến khích hơn dùng hàm cụ thể)
// export default apiClient;

// Export các hàm đã định nghĩa
export default {
    registerApi,
    loginApi,
    getPublicJobs,
    getJobDetailsApi,
    createJobApi,
    updateJobApi,
    deleteJobApi,
    //... thêm các hàm khác
};
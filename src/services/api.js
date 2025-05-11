// src/services/api.js
import axios from 'axios';
import process from 'process'; // Để sử dụng process.env trong frontend
// Địa chỉ cơ sở của backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
// Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    //headers: {
    //    'Content-Type': 'application/json',
    //},
});

// --- Interceptor để tự động thêm Token vào Header ---
// Interceptor này sẽ chạy trước mỗi request được gửi đi bởi apiClient
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Quan trọng: KHÔNG set Content-Type cứng ở đây, đặc biệt khi có thể gửi FormData
        // if (!(config.data instanceof FormData)) {
        //     config.headers['Content-Type'] = 'application/json'; // Chỉ set nếu không phải FormData? (Có thể không cần)
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Định nghĩa các hàm gọi API cụ thể ---

// === Auth APIs ===
export const registerApi = (userData) => apiClient.post('/auth/register', userData);
export const loginApi = (credentials) => apiClient.post('/auth/login', credentials);
// export const getMeApi = () => apiClient.get('/auth/me'); // Ví dụ API lấy thông tin user hiện tại

// === Job APIs ===
export const getEmployerJobsApi = () => apiClient.get('/jobs/my-jobs');
export const getPublicJobs = (params = {}) => apiClient.get('/jobs', { params }); // params để lọc/phân trang sau này
export const getJobDetailsApi = (jobId) => apiClient.get(`/jobs/${jobId}`);
// Tạo job mới (yêu cầu token)
export const createJobApi = (jobData) => apiClient.post('/jobs', jobData);
// Cập nhật job (yêu cầu token)
export const updateJobApi = (jobId, jobData) => apiClient.put(`/jobs/${jobId}`, jobData);
// Xóa job (yêu cầu token)
export const deleteJobApi = (jobId) => apiClient.delete(`/jobs/${jobId}`);

// === Application APIs ===
export const createApplicationApi = (applicationData) => apiClient.post('/applications', applicationData);
export const getApplicantsForJobApi = (jobId) => apiClient.get(`/jobs/${jobId}/applicants`);
export const updateApplicationStatusApi = (appId, statusData) => apiClient.put(`/applications/${appId}/status`, statusData);
export const getCandidateApplicationsApi = () => apiClient.get('/applications/candidate');
// === User Profile APIs (Thêm vào) ===
export const getProfileApi = () => apiClient.get('/users/profile'); // Lấy profile của user đang đăng nhập
export const updateProfileApi = (profileData) => apiClient.put('/users/profile', profileData); // Cập nhật profile user đang đăng nhập

export const uploadCvApi = (formData) => { // Có thể là export const hoặc chỉ const tùy cách bạn làm
    return apiClient.post('/users/profile/cv', formData);
};
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
    getEmployerJobsApi,
    createApplicationApi,
    getApplicantsForJobApi,
    updateApplicationStatusApi,
    getCandidateApplicationsApi,
    getProfileApi,
    updateProfileApi,
    uploadCvApi,
    //... thêm các hàm khác
};
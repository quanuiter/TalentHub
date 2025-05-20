// src/services/api.js
import axios from 'axios';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
// Sửa lỗi ReferenceError: process is not defined trong môi trường Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || 'http://localhost:5001/api';


const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// === Auth APIs ===
export const registerApi = (userData) => apiClient.post('/auth/register', userData);
export const loginApi = (credentials) => apiClient.post('/auth/login', credentials);

// === Job APIs ===
export const getEmployerJobsApi = () => apiClient.get('/jobs/my-jobs');
export const getPublicJobs = (params = {}) => apiClient.get('/jobs', { params });
export const getJobDetailsApi = (jobId) => apiClient.get(`/jobs/${jobId}`);
export const createJobApi = (jobData) => apiClient.post('/jobs', jobData);
export const updateJobApi = (jobId, jobData) => apiClient.put(`/jobs/${jobId}`, jobData);
export const deleteJobApi = (jobId) => apiClient.delete(`/jobs/${jobId}`);
export const getJobsByCompanyApi = (companyId) => apiClient.get(`/jobs/company/${companyId}`);


// === Application APIs ===
export const createApplicationApi = (applicationData) => apiClient.post('/applications', applicationData);
export const getApplicantsForJobApi = (jobId) => apiClient.get(`/jobs/${jobId}/applicants`); // Route này nằm trong jobRoutes.js
export const updateApplicationStatusApi = (appId, statusData) => apiClient.put(`/applications/${appId}/status`, statusData);
export const getCandidateApplicationsApi = () => apiClient.get('/applications/candidate');
export const evaluateApplicationApi = (appId, evaluationData) => apiClient.put(`/applications/${appId}/evaluate`, evaluationData);
export const scheduleInterviewApi = (appId, scheduleData) => apiClient.put(`/applications/${appId}/schedule-interview`, scheduleData);
export const assignTestToApplicantApi = (appId, testAssignmentData) => apiClient.post(`/applications/${appId}/assign-test`, testAssignmentData);
export const getCandidateScheduledInterviewsApi = () => apiClient.get('/applications/candidate/scheduled-interviews');
export const getAllApplicantsForEmployerApi = () => apiClient.get('/applications/employer/all');


// === User Profile APIs ===
export const getProfileApi = () => apiClient.get('/users/profile');
export const updateProfileApi = (profileData) => apiClient.put('/users/profile', profileData);
export const uploadCvApi = (formData) => apiClient.post('/users/profile/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' } // Cần thiết cho FormData
});

// === Company APIs ===
export const getPublicCompaniesApi = (params = {}) => apiClient.get('/companies', { params });
export const getCompanyDetailsApi = (companyId) => apiClient.get(`/companies/${companyId}`);
export const getMyCompanyProfileApi = () => apiClient.get('/companies/my-profile');
export const updateMyCompanyProfileApi = (profileData) => apiClient.put('/companies/my-profile', profileData);

// === Test APIs ===
export const getMyTestsApi = () => apiClient.get('/tests/my-tests');
export const createTestApi = (testData) => apiClient.post('/tests', testData);
export const updateTestApi = (testId, testData) => apiClient.put(`/tests/${testId}`, testData);
export const deleteTestApi = (testId) => apiClient.delete(`/tests/${testId}`);

// >>> THÊM HÀM MỚI ĐỂ LẤY STATS CHO EMPLOYER DASHBOARD <<<
export const getEmployerDashboardStats = () => apiClient.get('/users/employer/dashboard-stats');
export const toggleSaveJobApi = (jobId) => apiClient.post(`/users/saved-jobs/${jobId}`); // POST để toggle
export const getSavedJobsApi = () => apiClient.get('/users/saved-jobs');

export const getNotificationsApi = (params = {}) => apiClient.get('/notifications', { params }); // Hỗ trợ phân trang page, limit
export const markNotificationAsReadApi = (notificationId) => apiClient.put(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsReadApi = () => apiClient.put('/notifications/read-all');
export const deleteCvApi = (cvId) => apiClient.delete(`/users/profile/cv/${cvId}`);

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
    evaluateApplicationApi,
    getPublicCompaniesApi,
    getCompanyDetailsApi,
    getJobsByCompanyApi,
    getMyCompanyProfileApi,
    updateMyCompanyProfileApi,
    getAllApplicantsForEmployerApi,
    getMyTestsApi,
    createTestApi,
    updateTestApi,
    deleteTestApi,
    scheduleInterviewApi,
    assignTestToApplicantApi,
    getCandidateScheduledInterviewsApi,
    getEmployerDashboardStats,
    toggleSaveJobApi,
    getSavedJobsApi,
    getNotificationsApi,
    markNotificationAsReadApi,
    markAllNotificationsAsReadApi,
    deleteCvApi
};

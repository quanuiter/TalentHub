// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout'; // <<< Import DashboardLayout
import ProtectedRoute from './ProtectedRoute'; // <<< Import ProtectedRoute
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'; // Để debug nếu cần

// Import Pages
import HomePage from '../pages/HomePage';
import JobListingsPage from '../pages/JobListingsPage';
import JobDetailPage from '../pages/JobDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage'; 
import CompanyDetailPage from '../pages/CompanyDetailPage'; // <<< THÊM IMPORT NÀY
// Import Candidate Pages (Tạo các file này ở bước sau)
import CandidateDashboardPage from '../pages/candidate/DashboardPage';
import CandidateProfilePage from '../pages/candidate/ProfilePage';
import AppliedJobsPage from '../pages/candidate/AppliedJobsPage';
import SavedJobsPage from '../pages/candidate/SavedJobsPage';
import CandidateSchedulePage from '../pages/candidate/SchedulePage';
import CandidateSettingsPage from '../pages/candidate/SettingsPage';
// import CandidateSchedulePage from '../pages/candidate/SchedulePage';
// import CandidateSettingsPage from '../pages/candidate/SettingsPage';

// <<< Import Employer Page Placeholders (Tạo ở Bước 5) >>>
import EmployerDashboardPage from '../pages/employer/EmployerDashboardPage';
import PostJobPage from '../pages/employer/PostJobPage';
import ManageJobsPage from '../pages/employer/ManageJobsPage';
import ApplicantsPage from '../pages/employer/ApplicantsPage';
import ManageTestsPage from '../pages/employer/ManageTestsPage';
import StatisticsPage from '../pages/employer/StatisticsPage';
// import StaffManagementPage from '../pages/employer/StaffManagementPage'; // Sẽ xóa ở bước sau
import CompanyProfilePage from '../pages/employer/CompanyProfilePage';
import EmployerSettingsPage from '../pages/employer/SettingsPage';
import AdminManageUsersPage from '../pages/admin/AdminManageUsersPage';
import AdminApproveJobsPage from '../pages/admin/AdminApproveJobsPage';

const InlineAdminPageTest = () => {
  console.log('[InlineAdminPageTest] Inline component is rendering inside DashboardLayout!');
  return (
    <Box>
      <Typography variant="h3" color="secondary">Đây là trang Admin Test Nội Tuyến</Typography>
      <Typography>Nếu bạn thấy dòng này, DashboardLayout và Outlet đang hoạt động.</Typography>
    </Box>
  );
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes using MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobListingsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route path="companies/:companyId" element={<CompanyDetailPage />} />
          {/* Thêm các trang public khác nếu cần */}
        </Route>

        {/* Auth Routes (No Layout or different Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* === ADMIN ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}> {/* Bảo vệ tất cả các route lồng bên trong /admin */}
          <Route path="/admin" element={<DashboardLayout />}> {/* DashboardLayout là layout chung */}
            {/* Các trang con của admin sẽ được render bởi <Outlet /> trong DashboardLayout */}
            <Route path="manage-users" element={<AdminManageUsersPage />} />
            {/* Thay <InlineAdminPageTest /> bằng <AdminManageUsersPage /> khi bạn đã sửa xong trang đó */}

            <Route path="approve-jobs" element={<AdminApproveJobsPage />} />
            {/* Thay <ApproveJobsTestPage /> bằng <AdminApproveJobsPage /> khi bạn đã sửa xong trang đó */}

            {/* Nếu truy cập /admin, tự động chuyển đến /admin/manage-users */}
            <Route index element={<Navigate to="manage-users" replace />} />
          </Route>
        </Route>
        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']} /> // Chỉ cho phép role 'candidate'
          }
        >
           {/* Các route con của candidate sẽ dùng DashboardLayout */}
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<CandidateDashboardPage />} />
            <Route path="profile" element={<CandidateProfilePage />} />
            <Route path="applications" element={<AppliedJobsPage />} />
            <Route path="saved-jobs" element={<SavedJobsPage />} />
            <Route path="schedule" element={<CandidateSchedulePage />} />
            <Route path="settings" element={<CandidateSettingsPage />} />
            {/* Redirect từ /candidate về /candidate/dashboard nếu cần */}
             <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={['employer']} /> // Chỉ cho phép role 'employer'
          }
        >
           <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<EmployerDashboardPage />} />
            <Route path="post-job" element={<PostJobPage />} />
            <Route path="edit-job/:jobId" element={<PostJobPage />} />
            <Route path="manage-jobs" element={<ManageJobsPage />} />
            {/* Route xem ứng viên có thể lồng vào manage-jobs hoặc để riêng */}
            <Route path="applicants" element={<ApplicantsPage />} />
             {/* Ví dụ route xem ứng viên của 1 job cụ thể */}
             {/* <Route path="manage-jobs/:jobId/applicants" element={<JobApplicantsPage />} /> */}
            <Route path="manage-tests" element={<ManageTestsPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="company-profile" element={<CompanyProfilePage />} />
            <Route path="settings" element={<EmployerSettingsPage />} />
            {/* Redirect từ /employer về /employer/dashboard */}
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="post-job" element={<PostJobPage />} />
             <Route path="manage-jobs" element={<ManageJobsPage />} />
             <Route path="applicants" element={<ApplicantsPage />} />
             <Route path="manage-tests" element={<ManageTestsPage />} />
             <Route path="jobs/:jobId/applicants" element={<ApplicantsPage />} />
          </Route>
        </Route>
 
        {/* Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
// Nhớ import Navigate từ react-router-dom nếu chưa có
import { Navigate } from 'react-router-dom';

export default AppRouter;
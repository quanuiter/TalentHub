// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout'; // <<< Import DashboardLayout
import ProtectedRoute from './ProtectedRoute'; // <<< Import ProtectedRoute

// Import Pages
import HomePage from '../pages/HomePage';
import JobListingsPage from '../pages/JobListingsPage';
import JobDetailPage from '../pages/JobDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

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
import EmployerCompanyProfilePage from '../pages/employer/CompanyProfilePage';
import EmployerSettingsPage from '../pages/employer/SettingsPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes using MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobListingsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          {/* Thêm các trang public khác nếu cần */}
        </Route>

        {/* Auth Routes (No Layout or different Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}

        {/* === Candidate Protected Routes using DashboardLayout === */}
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
            <Route path="manage-jobs" element={<ManageJobsPage />} />
            {/* Route xem ứng viên có thể lồng vào manage-jobs hoặc để riêng */}
            <Route path="applicants" element={<ApplicantsPage />} />
             {/* Ví dụ route xem ứng viên của 1 job cụ thể */}
             {/* <Route path="manage-jobs/:jobId/applicants" element={<JobApplicantsPage />} /> */}
            <Route path="manage-tests" element={<ManageTestsPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="company-profile" element={<EmployerCompanyProfilePage />} />
            <Route path="settings" element={<EmployerSettingsPage />} />
            {/* Redirect từ /employer về /employer/dashboard */}
             <Route index element={<Navigate to="dashboard" replace />} />
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
// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Thêm useLocation
import Box from '@mui/material/Box';
import Header from '../components/common/Header';
import CandidateSidebar from '../components/dashboard/CandidateSidebar';
import EmployerSidebar from '../components/dashboard/EmployerSidebar'; // <<< Import EmployerSidebar
import { useAuth } from '../contexts/AuthContext';

function DashboardLayout() {
  const { authState } = useAuth();
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const userRole = authState.user?.role;

  // Xác định Sidebar dựa trên role hoặc path (linh hoạt hơn)
  // Nếu user có role thì dùng role, nếu không (ví dụ load lần đầu chưa có state) thì dựa vào path
  let SidebarComponent = null;
  if (userRole === 'candidate' || location.pathname.startsWith('/candidate')) {
      SidebarComponent = CandidateSidebar;
  } else if (userRole === 'employer' || location.pathname.startsWith('/employer')) {
      SidebarComponent = EmployerSidebar;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Render Sidebar đã xác định */}
        {SidebarComponent && <SidebarComponent />}

        <Box component="main" sx={{ flexGrow: 1, p: 3, /* overflow: 'auto' */ }}>
          <Outlet />
        </Box>
      </Box>
      {/* <Footer /> */}
    </Box>
  );
}

export default DashboardLayout;
// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Header from '../components/common/Header'; // Vẫn import Header cho các role khác
import CandidateSidebar from '../components/dashboard/CandidateSidebar';
import EmployerSidebar from '../components/dashboard/EmployerSidebar';
import AdminSidebar from '../components/dashboard/AdminSidebar'; // << THÊM IMPORT
import { useAuth } from '../contexts/AuthContext';
import AdminHeader from '../components/admin/AdminHeader';
import Typography from '@mui/material/Typography'; // Để debug nếu cần

function DashboardLayout() {
  const { authState } = useAuth();
  const location = useLocation();
  const userRole = authState.user?.role;

  console.log('[DashboardLayout] Current userRole:', userRole);
  console.log('[DashboardLayout] Current pathname:', location.pathname);

  let SidebarComponent = null;
   let CurrentHeaderToRender = Header;
  let showHeader = true; // Mặc định hiển thị Header

  if (userRole === 'candidate' || location.pathname.startsWith('/candidate')) {
      SidebarComponent = CandidateSidebar;
  } else if (userRole === 'employer' || location.pathname.startsWith('/employer')) {
      SidebarComponent = EmployerSidebar;
  } else if (userRole === 'admin' || location.pathname.startsWith('/admin')) {
      SidebarComponent = AdminSidebar; // << SỬ DỤNG ADMIN SIDEBAR
      CurrentHeaderToRender = AdminHeader; // << KHÔNG HIỂN THỊ HEADER CHO ADMIN
      console.log('[DashboardLayout] Admin route detected. Using AdminSidebar, Header will be hidden.');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showHeader && <CurrentHeaderToRender />} {/* << CHỈ HIỂN THỊ HEADER NẾU showHeader LÀ TRUE */}
      {/* Nếu là admin và không muốn khoảng trống của header, bạn có thể thêm một div trống hoặc style khác */}
      {!showHeader && userRole === 'admin' && (
        <Box sx={{height: '64px', display: 'flex', alignItems: 'center', justifyContent:'center', bgcolor: 'alternate.main', color:'white'}}>
            {/* <Typography variant="h6">Admin Panel</Typography> */}
            {/* Để trống nếu không muốn gì cả, hoặc một thanh bar tối giản */}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, height: showHeader ? 'calc(100vh - 64px)' : 'calc(100vh - 64px)' /* Điều chỉnh chiều cao nếu cần khi ẩn header */ }}>
        {SidebarComponent && <SidebarComponent />}
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' /* Thêm overflow để scroll nếu nội dung dài */ }}>
          {console.log('[DashboardLayout] Rendering Outlet.')}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
export default DashboardLayout;
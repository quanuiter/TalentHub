// src/components/dashboard/EmployerSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'; // Thêm Typography
import { useAuth } from '../../contexts/AuthContext'; // Để lấy tên công ty

// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Cho bài test hoặc thống kê
import QueryStatsIcon from '@mui/icons-material/QueryStats'; // Cho thống kê
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';

// Định nghĩa các mục menu cho Employer
const sidebarItems = [
  { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/employer/dashboard' },
  { text: 'Đăng tin mới', icon: <PostAddIcon />, path: '/employer/post-job' },
  { text: 'Quản lý tin đăng', icon: <ListAltIcon />, path: '/employer/manage-jobs' },
  { text: 'Quản lý ứng viên', icon: <PeopleIcon />, path: '/employer/applicants' }, // Có thể link đến manage-jobs trước
  { text: 'Quản lý Bài Test', icon: <AssessmentIcon />, path: '/employer/manage-tests' },
  { text: 'Thống kê', icon: <QueryStatsIcon />, path: '/employer/statistics' },
];

const bottomItems = [
   { text: 'Hồ sơ công ty', icon: <BusinessIcon />, path: '/employer/company-profile' },
   { text: 'Cài đặt', icon: <SettingsIcon />, path: '/employer/settings' },
]

function EmployerSidebar() {
  const { authState } = useAuth(); // Lấy thông tin user/công ty
  const activeStyle = {
    backgroundColor: 'action.selected',
    fontWeight: 'bold',
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': { // Đổi màu icon và text khi active
        color: 'primary.main',
    }
  };

  return (
    // Đặt chiều rộng cố định cho Sidebar
    <Box sx={{ width: 260, borderRight: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', flexDirection: 'column' }}>
      {/* Hiển thị tên công ty ở đầu (tùy chọn) */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" noWrap>{authState.user?.companyName || 'Nhà tuyển dụng'}</Typography>
      </Box>

      {/* Phần menu chính */}
      <List component="nav" sx={{ flexGrow: 1 /* Để đẩy phần dưới xuống */ }}>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              // end // Chỉ active khi khớp hoàn toàn (cho Dashboard)
              style={({ isActive }) => isActive ? activeStyle : {}} // Dùng style thay vì sx cho NavLink
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Phần menu dưới */}
      <Divider />
      <List component="nav">
         {bottomItems.map((item) => (
           <ListItem key={item.text} disablePadding>
            <ListItemButton
                component={NavLink}
                to={item.path}
                style={({ isActive }) => isActive ? activeStyle : {}}
            >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
            </ListItemButton>
            </ListItem>
         ))}
      </List>
    </Box>
  );
}

export default EmployerSidebar;
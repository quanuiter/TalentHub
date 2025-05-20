// src/components/dashboard/EmployerSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// Import Icons (sử dụng các phiên bản Outlined cho sự nhất quán)
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'; // Cho Quản lý Bài Test
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined'; // Cho Thống kê
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'; // Cho Hồ sơ công ty & Avatar fallback
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

// Định nghĩa các mục menu cho Employer
const sidebarItems = [
  { text: 'Bảng điều khiển', icon: <DashboardOutlinedIcon />, path: '/employer/dashboard' },
  { text: 'Đăng tin mới', icon: <PostAddOutlinedIcon />, path: '/employer/post-job' },
  { text: 'Quản lý tin đăng', icon: <ListAltOutlinedIcon />, path: '/employer/manage-jobs' },
  { text: 'Quản lý ứng viên', icon: <PeopleOutlineOutlinedIcon />, path: '/employer/applicants' },
  { text: 'Quản lý Bài Test', icon: <AssessmentOutlinedIcon />, path: '/employer/manage-tests' },
  { text: 'Thống kê & Báo cáo', icon: <QueryStatsOutlinedIcon />, path: '/employer/statistics' },
];

const bottomItems = [
   { text: 'Hồ sơ công ty', icon: <BusinessOutlinedIcon />, path: '/employer/company-profile' },
   { text: 'Cài đặt tài khoản', icon: <SettingsOutlinedIcon />, path: '/employer/settings' },
];

function EmployerSidebar() {
  const { authState } = useAuth();
  const user = authState.user; // user object chứa companyName, có thể có companyLogoUrl sau này
  const theme = useTheme();

  // Style cho NavLink khi active
  const activeStyle = {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    borderRight: `3px solid ${theme.palette.primary.main}`,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
        fontWeight: 600,
    }
  };

  // Style chung cho các ListItemButton
  const listItemButtonStyle = {
    borderRadius: '8px',
    margin: theme.spacing(0.5, 1.5), // Tăng margin ngang một chút
    padding: theme.spacing(1.2, 2),  // Điều chỉnh padding
    width: `calc(100% - ${theme.spacing(3)})`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.06),
    },
  };

  return (
    <Box
      sx={{
        width: 260, // Giữ hoặc điều chỉnh chiều rộng nếu cần
        minWidth: 260,
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Phần thông tin Công ty ở đầu Sidebar */}
      {user && ( // Chỉ hiển thị nếu có thông tin user (employer)
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Avatar
            // src={user.companyLogoUrl || undefined} // Sử dụng logo công ty nếu có trong user.companyLogoUrl
            alt={user.companyName || "Company"}
            sx={{
              width: 68, // Kích thước lớn hơn một chút
              height: 68,
              margin: '0 auto',
              mb: 1.5,
              border: `2px solid ${theme.palette.primary.light}`, // Viền nhẹ hơn
              bgcolor: 'primary.main', // Màu nền nếu không có src
              color: 'white',
              fontSize: '2rem' // Kích thước chữ cái đầu nếu không có logo
            }}
          >
            {/* Fallback nếu không có logo: Hiển thị icon Business hoặc chữ cái đầu của tên công ty */}
            {/* {!user.companyLogoUrl && user.companyName ? user.companyName.charAt(0).toUpperCase() : <BusinessOutlinedIcon />} */}
             {!user.companyLogoUrl ? (user.companyName ? user.companyName.charAt(0).toUpperCase() : <BusinessOutlinedIcon />) : null}
          </Avatar>
          <Typography variant="h6" fontWeight="600" noWrap color="text.primary">
            {user.companyName || 'Nhà tuyển dụng'}
          </Typography>
          {/* Có thể thêm thông tin khác của employer nếu cần, ví dụ: user.fullName */}
           <Typography variant="body2" color="text.secondary" noWrap>
            {user.fullName || user.email}
          </Typography>
        </Box>
      )}

      {/* Danh sách các mục menu chính */}
      <List component="nav" sx={{ flexGrow: 1, py: 1 }}>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              // Thêm 'end' cho 'Bảng điều khiển' để chỉ active khi đúng path đó
              end={item.path.endsWith('dashboard')}
              sx={{
                ...listItemButtonStyle,
                '&.active': activeStyle,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {React.cloneElement(item.icon, { fontSize: 'small' })} {/* Đảm bảo icon có kích thước phù hợp */}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Phần Cài đặt và Hồ sơ công ty ở cuối */}
      <Box sx={{pb: 1, mt: 'auto'}}>
        <Divider light sx={{mx: 1.5, mb: 0.5}}/>
        <List component="nav" disablePadding>
         {bottomItems.map((item) => (
           <ListItem key={item.text} disablePadding>
            <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                 ...listItemButtonStyle,
                 '&.active': activeStyle,
                }}
            >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                    {React.cloneElement(item.icon, { fontSize: 'small' })}
                </ListItemIcon>
                <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                />
            </ListItemButton>
            </ListItem>
         ))}
      </List>
      </Box>
    </Box>
  );
}

export default EmployerSidebar;
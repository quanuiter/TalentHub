// src/components/dashboard/CandidateSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Để lấy thông tin user

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

// Import Icons (sử dụng các phiên bản Outlined cho sự nhất quán nếu muốn)
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'; // Đổi icon Lịch hẹn một chút
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const sidebarItems = [
  { text: 'Bảng điều khiển', icon: <DashboardOutlinedIcon />, path: '/candidate/dashboard' },
  { text: 'Hồ sơ của tôi', icon: <AccountCircleOutlinedIcon />, path: '/candidate/profile' },
  { text: 'Việc làm đã ứng tuyển', icon: <WorkHistoryOutlinedIcon />, path: '/candidate/applications' },
  { text: 'Việc làm đã lưu', icon: <BookmarkBorderOutlinedIcon />, path: '/candidate/saved-jobs' },
  { text: 'Lịch hẹn', icon: <EventNoteOutlinedIcon />, path: '/candidate/schedule' },
];

const settingsItem = { text: 'Cài đặt tài khoản', icon: <SettingsOutlinedIcon />, path: '/candidate/settings' };

function CandidateSidebar() {
  const { authState } = useAuth();
  const user = authState.user;
  const theme = useTheme();

  // Style cho NavLink khi active
  const activeStyle = {
    backgroundColor: alpha(theme.palette.primary.main, 0.08), // Màu nền nhẹ của màu primary
    color: theme.palette.primary.main, // Màu chữ là màu primary
    borderRight: `3px solid ${theme.palette.primary.main}`, // Thêm một đường viền bên phải
    '& .MuiListItemIcon-root': { // Style cho icon khi active
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': { // Style cho text khi active
        fontWeight: 600, // Làm đậm chữ
    }
  };

  const listItemButtonStyle = {
    borderRadius: '8px', // Bo tròn các mục
    margin: theme.spacing(0.5, 1), // Thêm margin ngang và dọc nhỏ
    padding: theme.spacing(1, 2), // Điều chỉnh padding bên trong
    width: `calc(100% - ${theme.spacing(2)})`, // Để margin không làm lệch item
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.06),
    },
  };

  return (
    <Box
      sx={{
        width: 250, // Tăng chiều rộng sidebar một chút
        minWidth: 250,
        height: '100%', // Chiếm toàn bộ chiều cao của parent flex container
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper, // Màu nền của sidebar
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Phần thông tin User ở đầu Sidebar */}
      {user && (
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Avatar
            src={user.avatar}
            alt={user.fullName || "User"}
            sx={{
              width: 64,
              height: 64,
              margin: '0 auto',
              mb: 1.5,
              border: `2px solid ${theme.palette.primary.main}`,
              bgcolor: 'primary.light'
            }}
          >
            {!user.avatar && user.fullName ? user.fullName.charAt(0).toUpperCase() : <AccountCircleOutlinedIcon />}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="600" noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
      )}

      {/* Danh sách các mục menu chính */}
      <List component="nav" sx={{ flexGrow: 1, py: 1 }}> {/* py để có padding trên dưới cho list */}
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              // Sử dụng sx để áp dụng style, NavLink sẽ tự quản lý active class
              // Hoặc bạn có thể dùng style prop như cũ nếu muốn kiểm soát hoàn toàn
              sx={{
                ...listItemButtonStyle,
                '&.active': activeStyle, // NavLink sẽ thêm class 'active'
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}> {/* Màu icon mặc định */}
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Phần Cài đặt ở cuối */}
      <Box sx={{pb: 1, mt: 'auto'}}> {/* mt: 'auto' để đẩy xuống dưới cùng */}
        <Divider light sx={{mx: 1, mb: 0.5}}/> {/* Divider nhẹ hơn và có margin */}
        <List component="nav" disablePadding>
          <ListItem disablePadding>
            <ListItemButton
               component={NavLink}
               to={settingsItem.path}
               sx={{
                ...listItemButtonStyle,
                '&.active': activeStyle,
               }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                {settingsItem.icon}
              </ListItemIcon>
              <ListItemText
                primary={settingsItem.text}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}

export default CandidateSidebar;
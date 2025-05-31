// src/components/dashboard/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../../contexts/AuthContext'; // Để lấy thông tin admin

const adminSidebarItems = [
  { text: 'Quản lý Người dùng', icon: <SupervisorAccountIcon />, path: '/admin/manage-users' },
  { text: 'Phê duyệt Công việc', icon: <FactCheckOutlinedIcon />, path: '/admin/approve-jobs' },
  // Thêm các mục khác cho admin nếu có
];

const adminSettingsItem = { text: 'Cài đặt Admin', icon: <SettingsOutlinedIcon />, path: '/admin/settings' }; // Ví dụ

function AdminSidebar() {
  const theme = useTheme();
  const { authState } = useAuth();
  const user = authState.user;

  const activeStyle = {
    backgroundColor: alpha(theme.palette.secondary.main, 0.08), // Có thể dùng màu khác cho admin
    color: theme.palette.secondary.main,
    borderRight: `3px solid ${theme.palette.secondary.main}`,
    '& .MuiListItemIcon-root': {
      color: theme.palette.secondary.main,
    },
    '& .MuiListItemText-primary': {
        fontWeight: 600,
    }
  };

  const listItemButtonStyle = {
    borderRadius: '8px',
    margin: theme.spacing(0.5, 1),
    padding: theme.spacing(1, 2),
    width: `calc(100% - ${theme.spacing(2)})`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.hover, 0.06),
    },
  };

  return (
    <Box
      sx={{
        width: 260,
        minWidth: 260,
        height: '100%',
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {user && (
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Avatar
            sx={{ width: 64, height: 64, margin: '0 auto', mb: 1.5, bgcolor: 'secondary.main' }}
          >
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : <SupervisorAccountIcon />}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="600" noWrap>
            {user.fullName || 'Admin'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
      )}
      <List component="nav" sx={{ flexGrow: 1, py: 1 }}>
        {adminSidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path.endsWith('/')} // Hoặc logic end phù hợp
              sx={{ ...listItemButtonStyle, '&.active': activeStyle }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
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
      {/* Optional: Settings link */}
      {/* <Box sx={{pb: 1, mt: 'auto'}}> ... </Box> */}
    </Box>
  );
}

export default AdminSidebar;
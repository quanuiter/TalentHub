// src/components/dashboard/CandidateSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // Dùng NavLink để biết link nào đang active
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

// Import icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';

const sidebarItems = [
  { text: 'Bảng điều khiển', icon: <DashboardIcon />, path: '/candidate/dashboard' },
  { text: 'Hồ sơ của tôi', icon: <AccountCircleIcon />, path: '/candidate/profile' },
  { text: 'Việc làm đã ứng tuyển', icon: <WorkHistoryIcon />, path: '/candidate/applications' },
  { text: 'Việc làm đã lưu', icon: <BookmarkIcon />, path: '/candidate/saved-jobs' },
  { text: 'Lịch hẹn', icon: <EventIcon />, path: '/candidate/schedule' },
];

const settingsItem = { text: 'Cài đặt', icon: <SettingsIcon />, path: '/candidate/settings' };

function CandidateSidebar() {
  const activeStyle = {
    backgroundColor: 'action.selected', // Màu nền khi active (từ theme)
    fontWeight: 'bold',
  };

  return (
    <Box sx={{ width: 200, borderRight: '1px solid rgba(0, 0, 0, 0.12)', minWidth: 200, }}> {/* Width và đường viền phải */}
      <List component="nav">
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              // end // Thêm 'end' nếu muốn chỉ active khi path khớp hoàn toàn
              style={({ isActive }) => isActive ? activeStyle : undefined}
            >
              <ListItemIcon sx={{ minWidth: 40 }}> {/* Giảm khoảng cách icon */}
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List component="nav">
        <ListItem disablePadding>
          <ListItemButton
             component={NavLink}
             to={settingsItem.path}
             style={({ isActive }) => isActive ? activeStyle : undefined}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{settingsItem.icon}</ListItemIcon>
            <ListItemText primary={settingsItem.text} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default CandidateSidebar;
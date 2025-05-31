// src/components/admin/AdminHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { useTheme } from '@mui/material/styles';

function AdminHeader() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Lấy hàm logout từ context
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Chuyển hướng về trang login sau khi logout
  };

  return (
    <AppBar position="static" sx={{ bgcolor: theme.palette.secondary.main /* Hoặc màu bạn muốn cho admin header */ }}>
      <Toolbar>
        <AdminPanelSettingsIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Admin Control Panel
        </Typography>
        <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
          <LogoutIcon />
          <Typography variant="caption" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' }}}>Đăng xuất</Typography>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default AdminHeader;
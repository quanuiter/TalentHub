import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link'; // MUI Link

function Header() {
  // Giả lập trạng thái đăng nhập - Sẽ thay bằng Context/Redux sau
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Thêm logic xóa token/user info
    navigate('/'); // Về trang chủ sau khi logout
  };

  return (
    <AppBar position="static"> {/* position="sticky" để dính trên cùng */}
      <Toolbar>
        {/* Logo */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
            TalentHub
          </Link>
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}> {/* Ẩn trên mobile */}
          <Button color="inherit" component={RouterLink} to="/">Trang chủ</Button>
          <Button color="inherit" component={RouterLink} to="/jobs">Tìm việc</Button>
          {/* Thêm các link khác nếu cần */}
        </Box>

        {/* Auth Buttons */}
        <Box>
          {isLoggedIn ? (
            <>
              <Button color="inherit" component={RouterLink} to="/candidate/dashboard"> {/* Hoặc /employer/dashboard */}
                Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Đăng nhập
              </Button>
              <Button variant="contained" color="secondary" component={RouterLink} to="/register" sx={{ ml: 1 }}>
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
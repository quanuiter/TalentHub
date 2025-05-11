// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';// Import context để lấy hàm login

// Import Material UI components
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link'; // MUI Link
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin location
  const from = location.state?.from?.pathname || (new URLSearchParams(location.search)).get('redirect') || "/";
  const { login } = useAuth(); // <<< LẤY HÀM LOGIN TỪ CONTEXT
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- SỬA LẠI HOÀN TOÀN HÀM NÀY ---
// src/pages/LoginPage.jsx
const handleSubmit = async (event) => { // <<< THÊM ASYNC
  event.preventDefault();
  setLoading(true);
  setError(null);
  console.log("[LoginPage] Form submitted with email:", email);

  try {
    // Gọi hàm login từ context (đã gọi API)
    const loggedInUser = await login(email, password); // <<< DÙNG AWAIT

    if (loggedInUser) {
      console.log("[LoginPage] Login successful via Context/API, user role:", loggedInUser.role);
      // Điều hướng dựa trên vai trò hoặc về trang trước đó (from)
       let targetPath = '/'; // Mặc định về trang chủ
       if (from && from !== '/login' && from !== '/register') {
          targetPath = from; // Ưu tiên về trang yêu cầu redirect
       } else if (loggedInUser.role === 'employer') {
          targetPath = '/employer/dashboard';
       } else if (loggedInUser.role === 'candidate') {
          targetPath = '/candidate/dashboard';
       }
       console.log("[LoginPage] Navigating to:", targetPath);
       navigate(targetPath, { replace: true }); // replace: true để không quay lại trang login bằng nút back

    } else {
      // Trường hợp này ít xảy ra nếu API lỗi thì đã throw error
      setError("Đã có lỗi xảy ra trong quá trình đăng nhập.");
      setLoading(false);
    }
  } catch (err) {
    console.error("[LoginPage] Login failed:", err);
    // Hiển thị lỗi trả về từ API (nếu có) hoặc lỗi chung
    setError(err.response?.data?.message || err.message || "Email hoặc mật khẩu không đúng.");
    setLoading(false);
  }
};
  // --- KẾT THÚC SỬA ĐỔI ---

  return (
    // Container giới hạn chiều rộng và căn giữa form
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8, // Khoảng cách từ top
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Icon khóa và tiêu đề */}
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Đăng nhập
        </Typography>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form đăng nhập */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Địa chỉ Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            variant="outlined" // <<< Thêm variant nếu bị thiếu ở code của bạn
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
             variant="outlined" // <<< Thêm variant nếu bị thiếu ở code của bạn
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
            }
            label="Ghi nhớ đăng nhập"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading} // Disable nút khi đang loading
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
          </Button>

          {/* Links Quên mật khẩu và Đăng ký */}
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Quên mật khẩu?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Chưa có tài khoản? Đăng ký"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
       {/* Copyright */}
       <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }}>
            {'Copyright © '}
            <Link color="inherit" component={RouterLink} to="/">
                TalentHub
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    </Container>
  );
}

export default LoginPage;
// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  const { login } = useAuth(); // <<< LẤY HÀM LOGIN TỪ CONTEXT
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- SỬA LẠI HOÀN TOÀN HÀM NÀY ---
// src/pages/LoginPage.jsx
const handleSubmit = (event) => {
  event.preventDefault();
  setLoading(true);
  setError(null);
  console.log("[LoginPage] Form submitted with email:", email); // Log email submit

  const loggedInUser = login(email, password); // Gọi login
  console.log("[LoginPage] login function returned:", loggedInUser); // Log kết quả login trả về

  if (loggedInUser) {
    console.log("[LoginPage] Login successful, user role:", loggedInUser.role);
    if (loggedInUser.role === 'employer') {
      console.log("[LoginPage] Navigating to /employer/dashboard"); // Log trước khi navigate
      navigate('/employer/dashboard');
    } else if (loggedInUser.role === 'candidate') {
      console.log("[LoginPage] Navigating to /candidate/dashboard");
      navigate('/candidate/dashboard');
    } else {
       console.log("[LoginPage] Navigating to / (default)");
      navigate('/');
    }
  } else {
    console.log("[LoginPage] Login failed"); // Log khi thất bại
    setError("Email hoặc mật khẩu không đúng.");
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
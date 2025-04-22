// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Import Material UI components & Icons
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link'; // MUI Link
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider'; // Thêm Divider
import Checkbox from '@mui/material/Checkbox'; // Thêm Checkbox
import InputAdornment from '@mui/material/InputAdornment'; // Cho icon trong TextField
import IconButton from '@mui/material/IconButton'; // Cho nút icon
import Visibility from '@mui/icons-material/Visibility'; // Icon hiện pass
import VisibilityOff from '@mui/icons-material/VisibilityOff'; // Icon ẩn pass
import GoogleIcon from '@mui/icons-material/Google'; // Icon Google (cần cài @mui/icons-material)

function RegisterPage() {
  const navigate = useNavigate();

  // State cho các trường input
  const [formData, setFormData] = useState({
    fullName: '', // Thay firstName/lastName bằng fullName
    email: '',
    password: '',
    role: 'candidate',
  });
  const [confirmPassword, setConfirmPassword] = useState(''); // Tách confirmPassword ra
  const [agreeToTerms, setAgreeToTerms] = useState(false); // State cho checkbox điều khoản
  const [showPassword, setShowPassword] = useState(false); // State ẩn/hiện password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State ẩn/hiện confirm password

  // State cho lỗi và loading
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Loading riêng cho nút Google

  // Xử lý thay đổi input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle ẩn/hiện mật khẩu
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault(); // Ngăn focus nhảy khi bấm icon
  };

  // --- Xử lý Đăng ký bằng Google (Placeholder) ---
  const handleGoogleSignUp = async () => {
      setGoogleLoading(true);
      setError(null);
      console.log("Đăng ký bằng Google - Chức năng này cần cài đặt thư viện và cấu hình phía backend.");
      // Giả lập
      await new Promise(resolve => setTimeout(resolve, 1000));
      // setError("Tính năng đăng ký Google chưa được kích hoạt.");
      setGoogleLoading(false);
  };

  // --- Xử lý khi submit form Email ---
  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // --- Validation ---
    if (!formData.fullName || !formData.email || !formData.password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setLoading(false);
      return;
    }
    if (formData.password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }
    if (!agreeToTerms) {
      setError("Bạn cần đồng ý với Điều khoản và Chính sách để đăng ký.");
      setLoading(false);
      return;
    }

    // --- Gọi API Backend (Placeholder) ---
    console.log("Dữ liệu đăng ký Email (giả lập):", formData);
    await new Promise(resolve => setTimeout(resolve, 1500));
     if (formData.email === "exist@example.com") {
        setError("Email này đã được sử dụng (demo).");
     } else {
        console.log("Đăng ký Email thành công (giả lập)");
        navigate('/login');
     }
    setLoading(false);
  };

  return (
    // Container giới hạn chiều rộng và căn giữa
    <Container component="main" maxWidth="sm"> {/* Tăng maxWidth lên sm */}
      <Box
        sx={{
          marginTop: 4, // Giảm margin top
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4 // Thêm margin bottom
        }}
      >
        {/* Bỏ Avatar, dùng Typography */}
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Sign up
        </Typography>

        {/* Google Sign Up Button */}
        <Button
          fullWidth
          variant="outlined" // Kiểu viền ngoài
          startIcon={googleLoading ? <CircularProgress size={20} color="inherit"/> : <GoogleIcon />}
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          sx={{ mb: 2, py: 1.2, textTransform: 'none', fontSize: '1rem' }} // Tùy chỉnh style nút Google
        >
           Sign up with Google
        </Button>

        {/* OR Separator */}
        <Divider sx={{ width: '100%', mb: 2 }}>OR</Divider>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Email Sign Up Form */}
        <Box component="form" noValidate onSubmit={handleSubmitEmail} sx={{ width: '100%' }}>
          <Grid spacing={4}>
            {/* Full Name */}
            <Grid item xs={12} sx={{ mb: 2 }} >
              <TextField
                autoComplete="name"
                name="fullName"
                required
                fullWidth
                id="fullName"
                label="Your Name" // Đổi label
                autoFocus
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading || googleLoading}
                variant="outlined" // Thêm variant
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sx={{ mb: 2 }}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || googleLoading}
                variant="outlined"
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} sx={{ mb: 2 }}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || googleLoading}
                helperText="Ít nhất 6 ký tự"
                variant="outlined"
                InputProps={{ // Thêm icon ẩn/hiện
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Có thể thêm phần checklist yêu cầu mật khẩu ở đây nếu muốn */}
            </Grid>

            {/* Confirm Password */}
             <Grid item xs={12} sx={{ mb: 2 }} >
              <TextField
                required
                fullWidth
                name="confirmPassword" // Name này ko cần trong state formData chính
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} // Dùng state riêng
                disabled={loading || googleLoading}
                variant="outlined"
                error={formData.password !== confirmPassword && confirmPassword !== ''}
                helperText={
                    formData.password !== confirmPassword && confirmPassword !== ''
                    ? "Mật khẩu không khớp"
                    : ""
                }
                 InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

             {/* Role Selection - Giữ lại theo yêu cầu dự án */}
             <Grid item xs={12}>
                 <FormControl component="fieldset" required disabled={loading || googleLoading} sx={{mt: 1}}>
                    <FormLabel component="legend">Bạn là?</FormLabel>
                    <RadioGroup
                        row
                        aria-label="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <FormControlLabel value="candidate" control={<Radio size="small"/>} label="Ứng viên" />
                        <FormControlLabel value="employer" control={<Radio size="small"/>} label="Nhà tuyển dụng" />
                    </RadioGroup>
                </FormControl>
             </Grid>

             {/* Terms and Conditions Checkbox */}
             <Grid item xs={12}>
                 <FormControlLabel
                    control={
                        <Checkbox
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            name="agreeToTerms"
                            color="primary"
                            disabled={loading || googleLoading}
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Tôi đã đọc và đồng ý với{' '}
                            <Link component={RouterLink} to="/terms" target="_blank" rel="noopener noreferrer"> {/* target="_blank" để mở tab mới */}
                                Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link component={RouterLink} to="/privacy" target="_blank" rel="noopener noreferrer">
                                Chính sách bảo mật
                            </Link>
                            .
                        </Typography>
                    }
                    sx={{ mt: 1 }}
                 />
             </Grid>

          </Grid> {/* End Grid container */}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.2, fontSize: '1rem' }} // Style nút chính
            disabled={loading || googleLoading || !agreeToTerms} // Disable nếu chưa đồng ý điều khoản
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign up with Email'}
          </Button>

          {/* Link tới trang Đăng nhập */}
          <Grid container justifyContent="center"> {/* Căn giữa link này */}
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in now!
              </Link>
            </Grid>
          </Grid>
        </Box> {/* End Form Box */}
      </Box>
       {/* Bỏ Copyright ở đây nếu muốn giống hình mẫu */}
    </Container>
  );
}

export default RegisterPage;
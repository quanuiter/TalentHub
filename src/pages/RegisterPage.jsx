// src/pages/RegisterPage.jsx
"use client"; // Giữ lại nếu bạn có lý do cụ thể, thường không cần cho React thuần

import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import Material UI components & Icons
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
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper'; // Sử dụng Paper
import { useTheme, alpha } from '@mui/material/styles'; // Thêm useTheme

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'; // Icon cho tên công ty
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined'; // Icon cho avatar
import Avatar from '@mui/material/Avatar';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, authState } = useAuth(); // Lấy authState để kiểm tra nếu đã đăng nhập
  const theme = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'candidate', // Mặc định là candidate
    companyName: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Tự động điều hướng nếu đã đăng nhập
    useEffect(() => {
        if (authState.isAuthenticated && authState.user) {
            let targetPath = '/';
            if (authState.user.role === 'employer') {
                targetPath = '/employer/dashboard';
            } else if (authState.user.role === 'candidate') {
                targetPath = '/candidate/dashboard';
            }
            navigate(targetPath, { replace: true });
        }
    }, [authState.isAuthenticated, authState.user, navigate]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    if (error) setError(null); // Xóa lỗi khi người dùng bắt đầu nhập lại
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleGoogleSignUp = async () => {
     setGoogleLoading(true);
     setError(null);
     console.log("Đăng ký bằng Google - Chức năng này cần cài đặt thư viện và cấu hình.");
     await new Promise(resolve => setTimeout(resolve, 1500));
     setError("Tính năng đăng ký với Google hiện chưa khả dụng. Vui lòng thử lại sau.");
     setGoogleLoading(false);
  };

  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.fullName || !formData.email || !formData.password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)."); setLoading(false); return;
    }
    if (formData.password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp."); setLoading(false); return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự."); setLoading(false); return;
    }
    if (formData.role === 'employer' && !formData.companyName.trim()) {
      setError("Vui lòng nhập Tên công ty.");
      setLoading(false);
      return;
    }
    if (!agreeToTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục."); setLoading(false); return;
    }

    try {
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        companyName: formData.role === 'employer' ? formData.companyName.trim() : undefined,
      };
      
      await register(userData); // register từ AuthContext đã xử lý API
      // AuthContext sẽ tự động cập nhật authState và có thể điều hướng hoặc LoginPage sẽ tự điều hướng dựa trên authState.isAuthenticated
      // Để đơn giản, sau khi đăng ký thành công, điều hướng đến trang login với thông báo
      navigate('/login', { state: { registrationSuccess: true, email: userData.email } });

    } catch (err) {
      console.error("[RegisterPage] Registration failed:", err);
      setError(err.response?.data?.message || err.message || "Đăng ký thất bại. Email có thể đã được sử dụng hoặc có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px - 56px)', // Giả sử header 64px, footer 56px
        bgcolor: alpha(theme.palette.primary.light, 0.03), // Nền rất nhẹ
        py: { xs: 3, sm: 5 }, // Padding top/bottom
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={5}
          sx={{
            padding: { xs: 3, sm: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '20px', // Bo góc mềm mại hơn
            bgcolor: 'background.paper',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 60, height: 60 }}>
            <LockPersonOutlinedIcon fontSize="large"/>
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary' }}>
            Tạo tài khoản mới
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            color="primary" // Hoặc màu khác nếu muốn
            startIcon={googleLoading ? <CircularProgress size={20} color="inherit"/> : <GoogleIcon />}
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            sx={{ mb: 2.5, py: 1.2, textTransform: 'none', fontSize: '1rem', borderRadius: '8px', borderColor: alpha(theme.palette.text.primary, 0.3) }}
          >
            Đăng ký với Google
          </Button>

          <Divider sx={{ width: '100%', mb: 2.5, fontSize: '0.9rem', color: 'text.secondary' }}>HOẶC ĐĂNG KÝ BẰNG EMAIL</Divider>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmitEmail} sx={{ width: '100%' }}>
            <Grid container spacing={2.5}> {/* Tăng spacing giữa các Grid item */}
              <Grid item xs={12} width={'100%'}>
                <TextField
                  autoComplete="name" name="fullName" required fullWidth id="fullName"
                  label="Họ và Tên (*)" autoFocus value={formData.fullName} onChange={handleChange}
                  disabled={loading || googleLoading} variant="outlined" size="small"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon color="action"/></InputAdornment>), sx: {borderRadius: '8px'} }}
                />
              </Grid>
              <Grid item xs={12} width={'100%'}>
                <TextField
                  required fullWidth id="email" label="Địa chỉ Email (*)" name="email" type="email"
                  autoComplete="email" value={formData.email} onChange={handleChange}
                  disabled={loading || googleLoading} variant="outlined" size="small"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon color="action"/></InputAdornment>), sx: {borderRadius: '8px'} }}
                />
              </Grid>
              <Grid item xs={12} width={'100%'}>
                <TextField
                  required fullWidth name="password" label="Mật khẩu (*)"
                  type={showPassword ? 'text' : 'password'} id="password"
                  autoComplete="new-password" value={formData.password} onChange={handleChange}
                  disabled={loading || googleLoading} helperText="Ít nhất 6 ký tự" variant="outlined" size="small"
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><VpnKeyOutlinedIcon color="action"/></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {borderRadius: '8px'}
                  }}
                />
              </Grid>
              <Grid item xs={12} width={'100%'}>
                <TextField
                  required fullWidth name="confirmPassword" label="Xác nhận Mật khẩu (*)"
                  type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword"
                  autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || googleLoading} variant="outlined" size="small"
                  error={formData.password !== confirmPassword && confirmPassword !== ''}
                  helperText={formData.password !== confirmPassword && confirmPassword !== '' ? "Mật khẩu không khớp" : ""}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><VpnKeyOutlinedIcon color="action"/></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle confirm password visibility" onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {borderRadius: '8px'}
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                  <FormControl component="fieldset" required disabled={loading || googleLoading} sx={{mt: 1}}>
                    <FormLabel component="legend" sx={{fontSize: '0.9rem', mb: 0.5}}>Bạn là:</FormLabel>
                    <RadioGroup row aria-label="role" name="role" value={formData.role} onChange={handleChange}>
                        <FormControlLabel value="candidate" control={<Radio size="small"/>} label="Ứng viên tìm việc" />
                        <FormControlLabel value="employer" control={<Radio size="small"/>} label="Nhà tuyển dụng" />
                    </RadioGroup>
                  </FormControl>
              </Grid>
              {formData.role === 'employer' && (
                  <Grid item xs={12} width={'100%'}>
                      <TextField
                          name="companyName" required fullWidth id="companyName" label="Tên công ty (*)"
                          value={formData.companyName} onChange={handleChange}
                          disabled={loading || googleLoading} variant="outlined" size="small"
                          InputProps={{ startAdornment: (<InputAdornment position="start"><BusinessOutlinedIcon color="action"/></InputAdornment>), sx: {borderRadius: '8px'} }}
                      />
                  </Grid>
              )}
              <Grid item xs={12}>
                  <FormControlLabel
                    control={
                        <Checkbox
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            name="agreeToTerms" color="primary" size="small"
                            disabled={loading || googleLoading}
                        />
                    }
                    label={
                        <Typography variant="body2" color="text.secondary">
                            Tôi đã đọc và đồng ý với{' '}
                            <Link component={RouterLink} to="/terms" target="_blank" rel="noopener noreferrer" sx={{fontWeight: 500}}>
                                Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link component={RouterLink} to="/privacy" target="_blank" rel="noopener noreferrer" sx={{fontWeight: 500}}>
                                Chính sách bảo mật
                            </Link>
                            . (*)
                        </Typography>
                    }
                    sx={{ mt: 0.5 }}
                   />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '12px', fontWeight: 'bold', fontSize: '1.05rem', boxShadow: theme.shadows[3] }}
              disabled={loading || googleLoading || !agreeToTerms}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Đăng ký tài khoản'}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2" sx={{textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                  Đã có tài khoản? Đăng nhập ngay
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 6, mb: 3 }}>
            {'Copyright © '}
            <Link color="inherit" component={RouterLink} to="/" sx={{textDecoration: 'none', '&:hover':{color:'primary.main'}}}>
                TalentHub
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
      </Container>
    </Box>
  );
}

export default RegisterPage;

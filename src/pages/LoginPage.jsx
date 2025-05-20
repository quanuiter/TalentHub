import React, { useState, useEffect } from 'react'; // Thêm useEffect
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
import Paper from '@mui/material/Paper'; // Sử dụng Paper để bọc form
import InputAdornment from '@mui/material/InputAdornment';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { useTheme, alpha } from '@mui/material/styles'; // Thêm useTheme và alpha
import MuiLink from '@mui/material/Link'; // Sử dụng MuiLink để tạo link

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme(); // Lấy theme

  // Xác định trang đích sau khi đăng nhập
  // Ưu tiên state từ location (nếu được redirect từ ProtectedRoute)
  // Sau đó là query param 'redirect'
  // Cuối cùng là trang chủ '/'
  const getRedirectPath = () => {
    const fromState = location.state?.from?.pathname;
    const fromQuery = new URLSearchParams(location.search).get('redirect');
    return fromState && fromState !== '/login' && fromState !== '/register' ? fromState :
           fromQuery && fromQuery !== '/login' && fromQuery !== '/register' ? fromQuery :
           "/";
  };


  const { login, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tự động điều hướng nếu đã đăng nhập
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
        let targetPath = '/';
        if (authState.user.role === 'employer') {
            targetPath = '/employer/dashboard';
        } else if (authState.user.role === 'candidate') {
            targetPath = '/candidate/dashboard';
        }
        const redirectPath = getRedirectPath();
        // Ưu tiên redirectPath nếu nó không phải là trang chủ mặc định và người dùng có vai trò cụ thể
        if (redirectPath !== '/' && (redirectPath.startsWith('/employer') || redirectPath.startsWith('/candidate'))) {
            navigate(redirectPath, { replace: true });
        } else {
            navigate(targetPath, { replace: true });
        }
    }
  }, [authState.isAuthenticated, authState.user, navigate, location]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    // console.log("[LoginPage] Form submitted with email:", email);

    try {
      const loggedInUser = await login(email, password, rememberMe); // Truyền rememberMe nếu context login xử lý

      if (loggedInUser) {
        // console.log("[LoginPage] Login successful, user role:", loggedInUser.role);
        const targetPath = getRedirectPath(); // Lấy lại đường dẫn đích
        let finalPath = '/';

        if (targetPath !== '/' && (targetPath.startsWith('/employer') || targetPath.startsWith('/candidate'))) {
            finalPath = targetPath;
        } else if (loggedInUser.role === 'employer') {
            finalPath = '/employer/dashboard';
        } else if (loggedInUser.role === 'candidate') {
            finalPath = '/candidate/dashboard';
        }
        // console.log("[LoginPage] Navigating to:", finalPath);
        navigate(finalPath, { replace: true });
      } else {
        // Trường hợp này ít xảy ra nếu API lỗi thì đã throw error và login context trả về lỗi
        setError("Đã có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("[LoginPage] Login failed:", err);
      setError(err.response?.data?.message || err.message || "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.");
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
        bgcolor: alpha(theme.palette.primary.light, 0.05), // Nền nhẹ cho toàn trang
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6} // Tăng độ nổi khối
          sx={{
            padding: { xs: 2.5, sm: 4 }, // Padding responsive
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '16px', // Bo góc mềm mại hơn
            bgcolor: 'background.paper',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}> {/* Avatar lớn hơn */}
            <LockOutlinedIcon fontSize="medium"/>
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Đăng nhập tài khoản
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2.5, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2.5 }}>
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
              variant="outlined" // Sử dụng outlined cho đồng bộ
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px' } // Bo tròn input
              }}
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
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyOutlinedIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '8px' }
              }}
            />
            <Grid container alignItems="center" justifyContent="space-between" sx={{mt: 1}}>
                <Grid item>
                    <FormControlLabel
                        control={
                        <Checkbox
                            value="remember"
                            color="primary"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                            size="small"
                        />
                        }
                        label={<Typography variant="body2">Ghi nhớ tôi</Typography>}
                    />
                </Grid>
                <Grid item>
                    <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                        Quên mật khẩu?
                    </Link>
                </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Đăng nhập'}
            </Button>

            <Grid container justifyContent="center"> {/* Căn giữa link Đăng ký */}
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2" sx={{textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                  {"Chưa có tài khoản? Đăng ký ngay"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5, mb: 2 }}>
            {'Copyright © '}
            <MuiLink color="inherit" component={RouterLink} to="/">
                TalentHub
            </MuiLink>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
      </Container>
    </Box>
  );
}

export default LoginPage;

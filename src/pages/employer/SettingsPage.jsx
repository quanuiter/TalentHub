// src/pages/employer/SettingsPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { changeEmployerPassword } from '../../data/mockJobs'; // Import hàm mock

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

// Import Icons
import SettingsIcon from '@mui/icons-material/Settings';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// Có thể thêm các icon khác cho các settings sau này

function EmployerSettingsPage() {
  const { authState } = useAuth();

  // State cho form đổi mật khẩu
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // State cho loading và message
  const [loading, setLoading] = useState(false); // Đổi tên saving thành loading cho nhất quán
  const [error, setError] = useState(null);
  // const [successMessage, setSuccessMessage] = useState(null); // Dùng snackbar là đủ
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handler cho input change
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    setError(null); // Xóa lỗi khi người dùng bắt đầu gõ lại
  };

  // Handlers cho ẩn/hiện password
  const toggleShowCurrentPassword = () => setShowCurrentPassword(show => !show);
  const toggleShowNewPassword = () => setShowNewPassword(show => !show);
  const toggleShowConfirmNewPassword = () => setShowConfirmNewPassword(show => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Handler submit đổi mật khẩu
  const handleChangePasswordSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSnackbar({ ...snackbar, open: false }); // Đóng snackbar cũ

    // --- Validation cơ bản ---
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmNewPassword) {
      setError("Vui lòng nhập đầy đủ các mật khẩu."); return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp."); return;
    }
    if (passwords.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự."); return;
    }
    if (passwords.newPassword === passwords.currentPassword) {
         setError("Mật khẩu mới không được trùng với mật khẩu hiện tại."); return;
    }

    setLoading(true);
    try {
      // Gọi hàm mock đổi mật khẩu
      const result = await changeEmployerPassword(
          authState.user.id, // Truyền employer ID
          passwords.currentPassword,
          passwords.newPassword
      );
      setSnackbar({ open: true, message: result.message || 'Đổi mật khẩu thành công!', severity: 'success'});
      // Xóa các trường mật khẩu sau khi thành công
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      setError(err.message || "Đã xảy ra lỗi khi đổi mật khẩu."); // Hiển thị lỗi từ hàm mock/API
      // Không xóa mật khẩu hiện tại khi lỗi để user sửa lại
      setPasswords(prev => ({...prev, newPassword:'', confirmNewPassword:''}));
    } finally {
      setLoading(false);
    }
  };

   // Đóng Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };


  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }}/> Cài đặt tài khoản
      </Typography>

      {/* --- Phần Đổi mật khẩu --- */}
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 /* Giới hạn chiều rộng form đổi pass */ }}>
        <Typography variant="h6" gutterBottom>
          <LockResetIcon sx={{ verticalAlign: 'middle', mr: 1 }}/> Đổi mật khẩu
        </Typography>
        <Divider sx={{ my: 2 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleChangePasswordSubmit}>
          <Stack spacing={2.5}> {/* Tăng spacing */}
            <TextField
              required fullWidth name="currentPassword" label="Mật khẩu hiện tại"
              type={showCurrentPassword ? 'text' : 'password'} id="currentPassword"
              value={passwords.currentPassword} onChange={handlePasswordChange} disabled={loading}
              variant="outlined" size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowCurrentPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
             <TextField
              required fullWidth name="newPassword" label="Mật khẩu mới"
              type={showNewPassword ? 'text' : 'password'} id="newPassword"
              value={passwords.newPassword} onChange={handlePasswordChange} disabled={loading}
              variant="outlined" size="small" helperText="Ít nhất 6 ký tự"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowNewPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
             <TextField
              required fullWidth name="confirmNewPassword" label="Xác nhận mật khẩu mới"
              type={showConfirmNewPassword ? 'text' : 'password'} id="confirmNewPassword"
              value={passwords.confirmNewPassword} onChange={handlePasswordChange} disabled={loading}
              variant="outlined" size="small"
              error={passwords.newPassword !== passwords.confirmNewPassword && passwords.confirmNewPassword !== ''}
              helperText={ passwords.newPassword !== passwords.confirmNewPassword && passwords.confirmNewPassword !== '' ? "Mật khẩu không khớp" : "" }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowConfirmNewPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Button
                type="submit" variant="contained" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Lưu Mật khẩu mới
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Thêm các khu vực cài đặt khác (placeholder) nếu muốn */}
      {/*
      <Paper sx={{ p: 3, mt: 3, maxWidth: 600 }}>
           <Typography variant="h6" gutterBottom>Cài đặt Thông báo</Typography>
            <Divider sx={{ my: 2 }} />
             <Typography variant="body2" color="text.secondary">(Chức năng cài đặt thông báo sẽ làm sau)</Typography>
      </Paper>
       */}

       {/* Snackbar */}
       <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>

    </Box>
  );
}

export default EmployerSettingsPage;
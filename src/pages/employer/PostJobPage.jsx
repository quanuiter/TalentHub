// src/pages/employer/PostJobPage.jsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useAuth } from '../../contexts/AuthContext';

function PostJobPage() {
  const { authState } = useAuth();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Bảng điều khiển Nhà tuyển dụng
      </Typography>
      <Typography variant="body1">
        Chào mừng, {authState.user?.fullName || 'Nhà tuyển dụng'} từ công ty {authState.user?.companyName || ''}!
      </Typography>
      <Typography variant="body2" sx={{mt: 2}}>
        (Nội dung tổng quan, thống kê nhanh, các hành động thường dùng... sẽ hiển thị ở đây)
      </Typography>
    </Paper>
  );
}

export default PostJobPage;
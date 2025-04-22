// src/pages/NotFoundPage.jsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// Import Material UI components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// Optional: Import an icon
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

function NotFoundPage() {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 150px)', // Adjust height based on Header/Footer approx height
          textAlign: 'center',
          py: 4, // Padding top/bottom
        }}
      >
        {/* Optional Icon */}
        <ReportProblemOutlinedIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />

        <Typography
          component="h1"
          variant="h2"
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          404
        </Typography>
        <Typography
          component="h2"
          variant="h5"
          color="text.secondary"
          gutterBottom
        >
          Oops! Không tìm thấy trang
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
          Có thể địa chỉ URL bị sai hoặc trang đã bị xóa.
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/" // Link về trang chủ
          size="large"
        >
          Quay về Trang chủ
        </Button>
      </Box>
    </Container>
  );
}

export default NotFoundPage;
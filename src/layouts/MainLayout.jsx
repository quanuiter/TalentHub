// src/layouts/MainLayout.jsx
import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Container from '@mui/material/Container'; // Đảm bảo đã import
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      {/* QUAN TRỌNG: Đảm bảo Container này bao bọc Outlet và có maxWidth */}
      <Container
          component="main"
          // Đặt maxWidth mong muốn, ví dụ 'lg' (large), 'md' (medium) hoặc 'xl' (extra large)
          // 'lg' thường là lựa chọn tốt cho hầu hết các trang web
          maxWidth="xl"
          sx={{ mt: 4, mb: 4, flexGrow: 1 }} // flexGrow: 1 giúp đẩy Footer xuống dưới
      >
         <Outlet /> {/* Nội dung của các trang con sẽ hiển thị ở đây */}
      </Container>
      <Footer />
    </Box>
  );
}

export default MainLayout;
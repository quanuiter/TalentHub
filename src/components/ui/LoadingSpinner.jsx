// src/components/ui/LoadingSpinner.jsx

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Sử dụng export default ngay từ đầu
export default function LoadingSpinner() {
  return (
    // Box dùng để căn giữa spinner
    <Box
      sx={{
        display: 'flex',           // Bật flexbox
        justifyContent: 'center', // Căn giữa theo chiều ngang
        alignItems: 'center',     // Căn giữa theo chiều dọc
        py: 4,                    // Thêm chút padding trên dưới (padding-top/bottom)
        width: '100%',            // Chiếm toàn bộ chiều rộng của container cha
        minHeight: '100px'        // Chiều cao tối thiểu để thấy rõ khi không có nội dung khác
      }}
    >
      {/* Component vòng xoay loading của MUI */}
      <CircularProgress />
    </Box>
  );
}
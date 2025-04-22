import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3, // padding top/bottom
        px: 2, // padding left/right
        mt: 'auto', // Đẩy footer xuống dưới cùng nếu nội dung trang ngắn
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          TalentHub - Kết nối nhân tài.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {'Copyright © '}
          <Link color="inherit" href="#"> {/* Thay bằng link trang web của bạn */}
            TalentHub
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
        {/* Thêm các link khác (Điều khoản, Chính sách...) nếu cần */}
      </Container>
    </Box>
  );
}

export default Footer;
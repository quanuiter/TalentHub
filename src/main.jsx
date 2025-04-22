import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css'; // CSS toàn cục (có thể xóa nếu chỉ dùng MUI)
import { AuthProvider } from './contexts/AuthContext';
// Tạo theme MUI cơ bản (có thể tùy chỉnh sau)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Màu xanh dương chủ đạo
    },
    secondary: {
      main: '#dc004e', // Màu phụ
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Chuẩn hóa CSS trình duyệt */}
      <AuthProvider> {/* Cung cấp AuthContext cho toàn bộ ứng dụng */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// allowedRoles là mảng các vai trò được phép truy cập (ví dụ: ['candidate'], ['employer'], ['admin'])
const ProtectedRoute = ({ allowedRoles }) => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    // Có thể truyền state để trang login biết lý do chuyển hướng (ví dụ: ?redirect=/candidate/dashboard)
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authState.user?.role)) {
    // Nếu đã đăng nhập nhưng không đúng vai trò được phép
    // Có thể chuyển hướng về trang chủ hoặc trang báo lỗi "Unauthorized"
    console.warn(`User role '${authState.user?.role}' not allowed for this route. Allowed: ${allowedRoles}`);
    return <Navigate to="/" replace />; // Tạm về trang chủ
  }

  // Nếu đã đăng nhập và đúng vai trò (hoặc không yêu cầu vai trò cụ thể), cho phép truy cập
  return <Outlet />; // Render component con của route được bảo vệ
};

export default ProtectedRoute;
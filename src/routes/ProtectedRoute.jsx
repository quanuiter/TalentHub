// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom'; // Thêm useLocation
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner'; // Import một component loading

const ProtectedRoute = ({ allowedRoles }) => {
  const { authState } = useAuth();
  const location = useLocation(); // Lấy vị trí hiện tại

  console.log('[ProtectedRoute] Evaluating access. AuthState:', JSON.stringify(authState, null, 2));

  // 1. Nếu AuthContext vẫn đang tải, hiển thị một chỉ báo loading
  if (authState.isLoading) {
    console.log('[ProtectedRoute] Auth is loading. Showing LoadingSpinner.');
    return <LoadingSpinner />; // Hoặc bất kỳ component loading nào khác
  }

  // 2. Nếu không được xác thực (sau khi đã tải xong), chuyển hướng đến trang login
  if (!authState.isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated. Redirecting to login.');
    // Truyền vị trí hiện tại để chuyển hướng lại sau khi đăng nhập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu đã xác thực nhưng vai trò không được phép, chuyển hướng về trang chủ hoặc trang không có quyền
  if (allowedRoles && !allowedRoles.includes(authState.user?.role)) {
    console.warn(`[ProtectedRoute] User role '${authState.user?.role}' not allowed. Allowed: ${allowedRoles}. Redirecting to home.`);
    return <Navigate to="/" replace />; // Tạm thời về trang chủ
  }

  // 4. Nếu đã xác thực và vai trò được phép (hoặc không yêu cầu vai trò cụ thể), render route con
  console.log('[ProtectedRoute] Access GRANTED.');
  return <Outlet />;
};

export default ProtectedRoute;
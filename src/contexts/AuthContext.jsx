// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api'; // <<< Import apiService
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { useNavigate } from 'react-router-dom'; // Có thể cần nếu muốn logout điều hướng

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true, // Thêm state loading ban đầu để kiểm tra token
  });
  // Không cần navigate trong context, các component sẽ tự navigate
  // const navigate = useNavigate();

  // --- useEffect: Kiểm tra token khi ứng dụng tải lần đầu ---
  // (Phần này tùy chọn, giúp tự động đăng nhập nếu token còn hạn)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log("[AuthContext] Found token. Verifying with API...");
        try {
          // Gọi API /users/profile để xác thực token và lấy user data mới nhất
          const response = await apiService.getProfileApi();
          if (response.data) {
            console.log("[AuthContext] Token verified via API. Restoring session.");
            localStorage.setItem('authUser', JSON.stringify(response.data)); // Lưu profile mới nhất
            setAuthState({
              isAuthenticated: true,
              user: response.data,
              isLoading: false
            });
          } else {
              // API trả về 200 nhưng không có data? -> Lỗi bất thường
              throw new Error("Invalid profile data received from API");
          }
        } catch (error) {
          // Lỗi 401 (Unauthorized) hoặc lỗi khác -> Token không hợp lệ/hết hạn
          console.error("[AuthContext] Token verification failed or expired:", error.response?.data?.message || error.message);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setAuthState({ isAuthenticated: false, user: null, isLoading: false });
        }
      } else {
        console.log("[AuthContext] No token found.");
        setAuthState({ isAuthenticated: false, user: null, isLoading: false });
      }
    };
    checkAuthStatus();
  }, []); // Chỉ chạy 1 lần khi component mount

  // --- Hàm Đăng nhập ---
  const login = async (email, password) => {
    console.log("[AuthContext] Attempting login via API:", email);
    try {
      const response = await apiService.loginApi({ email, password });
      console.log("[AuthContext] Login API Response:", response);

      if (response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;

        // Lưu token và user vào localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user)); // Lưu user data

        // Cập nhật state
        setAuthState({ isAuthenticated: true, user: user, isLoading: false });
        console.log("[AuthContext] Login successful. State updated.");
        return user; // Trả về user data khi thành công
      } else {
        // Trường hợp API trả về 2xx nhưng không có token/user (ít xảy ra)
        console.error("[AuthContext] Login API response missing token or user:", response.data);
        throw new Error(response.data?.message || 'Dữ liệu đăng nhập không hợp lệ.');
      }
    } catch (error) {
      console.error("[AuthContext] Login API Error:", error.response?.data || error.message);
      // Xóa token/user cũ nếu có lỗi đăng nhập
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setAuthState({ isAuthenticated: false, user: null, isLoading: false });
      // Ném lỗi ra ngoài để component LoginPage có thể bắt và hiển thị
      throw error;
    }
  };

   // --- Hàm Đăng ký ---
   // Hàm này chỉ gọi API đăng ký, không tự động đăng nhập sau đó
  const register = async (userData) => {
     console.log("[AuthContext] Attempting registration via API:", userData.email);
    try {
        const response = await apiService.registerApi(userData);
         console.log("[AuthContext] Register API Response:", response);
        // Đăng ký thành công thường trả về 201 và có thể có hoặc không có token/user tùy thiết kế backend
        // Ở đây chỉ cần biết là thành công hay không
        if (response.status === 201 && response.data) {
             console.log("[AuthContext] Registration successful.");
            // Không tự động đăng nhập, trả về response để RegisterPage xử lý (ví dụ: chuyển hướng đến login)
             return response.data;
        } else {
            console.error("[AuthContext] Register API response invalid:", response.data);
            throw new Error(response.data?.message || 'Dữ liệu đăng ký không hợp lệ.');
        }
    } catch(error) {
         console.error("[AuthContext] Register API Error:", error.response?.data || error.message);
         throw error; // Ném lỗi ra để RegisterPage xử lý
    }
  };


  // --- Hàm Đăng xuất ---
  const logout = () => {
    console.log("[AuthContext] Logging out.");
    // Xóa token và user khỏi localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Reset auth state
    setAuthState({ isAuthenticated: false, user: null, isLoading: false });
    // Điều hướng về trang chủ hoặc login (thường làm ở component Header hoặc nơi gọi logout)
    // navigate('/'); // Bỏ navigate ở đây
  };

  // Hàm cập nhật profile (giữ lại nếu bạn có API cập nhật profile)
  const updateUserProfile = async (updatedData) => {
    // Không cần kiểm tra role ở đây vì endpoint backend dùng chung
    console.log("Attempting to update profile via API:", updatedData);
    try {
      // Gọi API backend để cập nhật profile thật
      const response = await apiService.updateProfileApi(updatedData);

      if (response.data && response.data.user) {
        const updatedUserFromApi = response.data.user;
        console.log("API update successful. User data from API:", updatedUserFromApi);

        // Cập nhật state và localStorage với dữ liệu mới nhất từ API
        setAuthState((prevState) => {
          // Giữ nguyên isAuthenticated và isLoading
          const newUserState = { ...prevState.user, ...updatedUserFromApi };
          localStorage.setItem('authUser', JSON.stringify(newUserState)); // Cập nhật localStorage
          return {
            ...prevState,
            user: newUserState,
          };
        });
        return true; // Trả về true báo thành công cho component ProfilePage
      } else {
        // Trường hợp API trả về thành công nhưng không có user data (ít xảy ra)
        console.error("API update response missing user data:", response.data);
        throw new Error(response.data?.message || 'Dữ liệu trả về không hợp lệ.');
      }

    } catch (error) {
      console.error("Error updating profile via API:", error.response?.data || error.message);
      // Ném lỗi ra để component ProfilePage có thể bắt và hiển thị
      throw error;
    }
  };


  return (
    // Cung cấp state và các hàm mới cho các component con
    <AuthContext.Provider value={{ authState, setAuthState, login, logout, register, updateUserProfile }}>
      {!authState.isLoading ? children : <LoadingSpinner />} {/* Hiển thị children hoặc loading */}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ dàng sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
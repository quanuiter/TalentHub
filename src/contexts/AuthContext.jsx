// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api';
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useCallback } from 'react'; // Thêm import useCallback nếu chưa có
// import { useNavigate } from 'react-router-dom'; // Bỏ nếu không dùng trực tiếp

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      console.log("[AuthContext RELOAD] Token from localStorage:", token);
      if (token) {
        console.log("[AuthContext RELOAD] Found token. Verifying with API...");
        try {
          const response = await apiService.getProfileApi();
          console.log("[AuthContext RELOAD] Profile API Response:", response);
          if (response.data) {
            console.log("[AuthContext RELOAD] Token verified. User data from profile API:", JSON.stringify(response.data, null, 2));
            localStorage.setItem('authUser', JSON.stringify(response.data));
            const newState = {
              isAuthenticated: true,
              user: response.data,
              isLoading: false
            };
            setAuthState(newState);
            console.log("[AuthContext RELOAD] AuthState SET with profile data:", JSON.stringify(newState, null, 2));
          } else {
            // Nên throw error nếu response.data không tồn tại sau khi API thành công
            console.error("[AuthContext RELOAD] Profile API response successful but data is missing.");
            throw new Error("Invalid profile data received from API after reload (data missing)");
          }
        } catch (error) {
          console.error("[AuthContext RELOAD] Token verification FAILED or expired:", error.response?.data?.message || error.message, error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          const errorState = { isAuthenticated: false, user: null, isLoading: false };
          setAuthState(errorState);
          console.log("[AuthContext RELOAD] AuthState SET to unauthenticated due to error:", JSON.stringify(errorState, null, 2));
        }
      } else {
        console.log("[AuthContext RELOAD] No token found. Setting unauthenticated state.");
        const noTokenState = { isAuthenticated: false, user: null, isLoading: false };
        setAuthState(noTokenState);
        console.log("[AuthContext RELOAD] AuthState SET due to no token:", JSON.stringify(noTokenState, null, 2));
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    console.log("[AuthContext] Attempting login via API for email:", email);
    try {
      const response = await apiService.loginApi({ email, password });
      console.log("[AuthContext] Login API Full Response:", response);

      if (response.data && response.data.token && response.data.user) {
        const { token, user: userFromLoginApi } = response.data;

        // >>> LOGGING CHI TIẾT USER OBJECT TỪ API LOGIN <<<
        console.log("[AuthContext] LOGIN - User object received from Login API:", JSON.stringify(userFromLoginApi, null, 2));
        console.log(`[AuthContext] LOGIN - Checking userFromLoginApi._id: ${userFromLoginApi?._id}`);
        console.log(`[AuthContext] LOGIN - Checking userFromLoginApi.id: ${userFromLoginApi?.id}`);
        console.log(`[AuthContext] LOGIN - Checking userFromLoginApi.role: ${userFromLoginApi?.role}`);
        if (userFromLoginApi?.role === 'employer') {
          console.log(`[AuthContext] LOGIN - Checking userFromLoginApi.companyId: ${userFromLoginApi?.companyId}`);
          console.log(`[AuthContext] LOGIN - Checking userFromLoginApi.companyName: ${userFromLoginApi?.companyName}`);
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userFromLoginApi));

        const newState = {
          isAuthenticated: true,
          user: userFromLoginApi,
          isLoading: false
        };
        setAuthState(newState);
        // >>> LOGGING CHI TIẾT AUTHSTATE SAU KHI SET <<<
        console.log("[AuthContext] LOGIN - AuthState SET after login. User ID in state (newState.user._id):", newState.user?._id);
        console.log("[AuthContext] LOGIN - AuthState SET after login. User ID in state (newState.user.id):", newState.user?.id);
        console.log("[AuthContext] LOGIN - AuthState SET after login. User Role in state:", newState.user?.role);
        console.log("[AuthContext] LOGIN - AuthState SET after login. isLoading:", newState.isLoading);
        console.log("[AuthContext] LOGIN - AuthState SET after login. isAuthenticated:", newState.isAuthenticated);
        console.log("[AuthContext] LOGIN - Full AuthState SET after login:", JSON.stringify(newState, null, 2));

        return userFromLoginApi;
      } else {
        console.error("[AuthContext] Login API response missing token or user:", response.data);
        throw new Error(response.data?.message || 'Dữ liệu đăng nhập không hợp lệ từ API.');
      }
    } catch (error) {
      console.error("[AuthContext] Login API Error:", error.response?.data || error.message, error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Không set isLoading: false ở đây nếu lỗi, để component con có thể dựa vào isLoading ban đầu
      // setAuthState({ isAuthenticated: false, user: null, isLoading: false }); // Cân nhắc việc này
      throw error;
    }
  };

  const register = async (userData) => {
     console.log("[AuthContext] Attempting registration via API:", userData.email);
    try {
        const response = await apiService.registerApi(userData);
         console.log("[AuthContext] Register API Response:", response);
        if (response.status === 201 && response.data) {
             console.log("[AuthContext] Registration successful.");
             return response.data;
        } else {
            console.error("[AuthContext] Register API response invalid:", response.data);
            throw new Error(response.data?.message || 'Dữ liệu đăng ký không hợp lệ.');
        }
    } catch(error) {
         console.error("[AuthContext] Register API Error:", error.response?.data || error.message, error);
         throw error;
    }
  };

  const logout = () => {
    console.log("[AuthContext] Logging out.");
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthState({ isAuthenticated: false, user: null, isLoading: false });
  };

  const updateUserProfile = async (updatedData) => {
    console.log("[AuthContext] Attempting to update profile via API with data:", updatedData);
    try {
      const response = await apiService.updateProfileApi(updatedData);
      if (response.data && response.data.user) {
        const updatedUserFromApi = response.data.user;
        console.log("[AuthContext] Profile update successful. User data from API:", JSON.stringify(updatedUserFromApi, null, 2));
        setAuthState((prevState) => {
          const newUserState = { ...prevState.user, ...updatedUserFromApi };
          localStorage.setItem('authUser', JSON.stringify(newUserState));
          console.log("[AuthContext] AuthState updated after profile update. New user state:", JSON.stringify(newUserState, null, 2));
          return {
            ...prevState,
            user: newUserState,
          };
        });
        return true;
      } else {
        console.error("[AuthContext] Profile update API response missing user data:", response.data);
        throw new Error(response.data?.message || 'Dữ liệu trả về không hợp lệ sau khi cập nhật hồ sơ.');
      }
    } catch (error) {
      console.error("[AuthContext] Error updating profile via API:", error.response?.data || error.message, error);
      throw error;
    }
  };
      // >>> HÀM MỚI ĐỂ LƯU/BỎ LƯU JOB <<<
    const handleToggleSaveJob = useCallback(async (jobId) => {
        if (!authState.isAuthenticated || authState.user?.role !== 'candidate') {
            // Có thể hiển thị thông báo yêu cầu đăng nhập/chỉ candidate mới lưu được
            console.warn("[AuthContext] User not authenticated or not a candidate to save job.");
            throw new Error("Vui lòng đăng nhập với tư cách ứng viên để lưu công việc.");
        }
        try {
            const response = await apiService.toggleSaveJobApi(jobId);
            if (response.data && Array.isArray(response.data.savedJobs)) {
                // Backend trả về danh sách savedJobs đã populate, chúng ta chỉ cần lấy ID
                const updatedSavedJobIds = response.data.savedJobs.map(job => job._id);
                setAuthState(prevState => {
                    const updatedUser = {
                        ...prevState.user,
                        // Cập nhật savedJobs trong user object (chỉ ID) nếu backend không trả về user đầy đủ
                        // Hoặc nếu getUserProfile được gọi lại thì không cần
                    };
                    // Nếu không muốn cập nhật user.savedJobs trực tiếp, chỉ cần cập nhật authState.savedJobs
                    // localStorage.setItem('authUser', JSON.stringify(updatedUser)); // Cẩn thận nếu user object quá lớn

                    return {
                        ...prevState,
                        // user: updatedUser, // Chỉ cập nhật nếu cần thiết
                        savedJobs: updatedSavedJobIds,
                    };
                });
                return { success: true, message: response.data.message, isSaved: updatedSavedJobIds.includes(jobId) };
            } else {
                throw new Error("Phản hồi từ server không hợp lệ.");
            }
        } catch (error) {
            console.error("[AuthContext] Error toggling save job:", error);
            throw error; // Ném lỗi ra để component gọi xử lý (ví dụ: hiển thị snackbar)
        }
    }, [authState.isAuthenticated, authState.user?.role, setAuthState]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, logout, register, updateUserProfile, handleToggleSaveJob }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
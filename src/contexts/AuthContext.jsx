// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Giả lập trạng thái đăng nhập và thông tin user
  // Trong thực tế, giá trị này sẽ lấy từ localStorage/sessionStorage sau khi login thành công
  const [authState, setAuthState] = useState({
    isAuthenticated: false, // Ban đầu chưa đăng nhập
    user: null , // Chưa có thông tin user
    // Ví dụ khi đã đăng nhập:
    // isAuthenticated: true,
    // user: { id: 'uv001', email: 'test@candidate.com', fullName: 'Test Candidate', role: 'candidate' }
  });
  const detailedCandidateData = {
    id: 'uv001',
    email: 'candidate@gmail.com', // <<< Đổi email ở đây
    fullName: 'Trần Thị Bích Hằng',
    role: 'candidate',
    phone: '0912 345 678',
    address: '1 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP.HCM',
    dateOfBirth: '1998-03-22',
    linkedin: 'https://www.linkedin.com/in/bichhangtran-example',
    portfolio: 'https://bichhang.github.io',
    summary: 'Là một Frontend Developer với hơn 3 năm kinh nghiệm, tôi đam mê xây dựng giao diện người dùng đẹp mắt, trực quan và có hiệu suất cao. Thành thạo ReactJS, VueJS, và luôn cập nhật các công nghệ mới. Có kinh nghiệm làm việc trong môi trường Agile và khả năng giao tiếp tốt.',
    education: [
      { id: 'edu1', school: 'Đại học Khoa học Tự nhiên TP.HCM', degree: 'Cử nhân Công nghệ Thông tin', startYear: 2016, endYear: 2020 },
      { id: 'edu2', school: 'Trung tâm Anh ngữ VUS', degree: 'Chứng chỉ TOEIC 850', startYear: 2021, endYear: 2021 },
    ],
    experience: [
      { id: 'exp1', company: 'Công ty TNHH Giải Pháp Phần Mềm ABC', title: 'Frontend Developer', startDate: '06/2021', endDate: 'Hiện tại', description: '- Tham gia phát triển giao diện cho hệ thống quản lý khách hàng (CRM) bằng ReactJS, Redux Toolkit.\n- Tích hợp API, tối ưu hóa tốc độ tải trang.\n- Phối hợp với team Backend và QA để đảm bảo chất lượng sản phẩm.' },
      { id: 'exp2', company: 'Công ty Khởi nghiệp XYZ', title: 'Web Developer Intern', startDate: '01/2020', endDate: '05/2020', description: '- Xây dựng các landing page tĩnh bằng HTML, CSS, JavaScript.\n- Hỗ trợ sửa lỗi và bảo trì website công ty.' },
    ],
    skills: ['ReactJS', 'Redux', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SCSS', 'Material UI', 'Ant Design', 'RESTful APIs', 'Git', 'Agile/Scrum', 'Tiếng Anh giao tiếp', 'TypeScript (Learning)'],
    uploadedCVs: [
      { id: 'cv1', fileName: 'TranThiBichHang_Frontend_CV_Vi.pdf', uploadDate: '2025-04-20', url: '#' },
      { id: 'cv2', fileName: 'TranThiBichHang_CV_En.pdf', uploadDate: '2025-04-18', url: '#' },
    ]
  };
  // Hàm giả lập login (sẽ thay bằng gọi API sau)
  const login = (email, password) => {
    console.log("[AuthContext] Attempting login:", email); // Log khi bắt đầu
    let success = false;
    let loggedInUser = null;

    if (email === "candidate@test.com" && password === "password") {
        loggedInUser = detailedCandidateData;
        success = true;
        console.log("[AuthContext] Candidate identified"); // Log khi xác định candidate
    } else if (email === "employer@test.com" && password === "password") {
        loggedInUser = { /* ... */ role: 'employer', companyName: 'Test Company' };
        success = true;
        console.log("[AuthContext] Employer identified"); // Log khi xác định employer
    }

    console.log("[AuthContext] Setting state:", { isAuthenticated: success, user: loggedInUser }); // Log state sắp set
    setAuthState({ isAuthenticated: success, user: loggedInUser });

    return loggedInUser; // Trả về user hoặc null
};

  // Hàm giả lập logout
  const logout = () => {  
    setAuthState({ isAuthenticated: false, user: null });
    // Xóa token/user info khỏi localStorage/sessionStorage
    console.log("Logged out (mock)");
  };
  const updateUserProfile = async (updatedData) => {
    console.log("Updating user profile (mock):", updatedData);
    await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ mạng
    // Giả lập cập nhật thông tin người dùng
    setAuthState((prevState) => ({
      ...prevState,
      user: { ...prevState.user, ...updatedData },
    }));
    return true; // Trả về true nếu thành công
  }
  return (
    // Cung cấp state và các hàm cho các component con
    <AuthContext.Provider value={{ authState, login, logout, updateUserProfile}}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ dàng sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
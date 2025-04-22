export const mockJobs = [
    {
      id: '1',
      title: 'Frontend Developer (ReactJS)',
      companyName: 'TechCorp',
      location: 'TP. Hồ Chí Minh',
      type: 'Full-time',
      salary: 'Thương lượng',
      description: 'Phát triển giao diện người dùng bằng ReactJS cho các dự án web...',
      requirements: ['Có kinh nghiệm ReactJS 1+ năm', 'Thành thạo HTML, CSS, JS', 'Sử dụng Git'],
      benefits: ['Lương cạnh tranh', 'Bảo hiểm đầy đủ', 'Môi trường năng động'],
      datePosted: '2025-04-20',
    },
    {
      id: '2',
      title: 'Backend Developer (NodeJS)',
      companyName: 'InnoTech',
      location: 'Hà Nội',
      type: 'Full-time',
      salary: '$1500 - $2500',
      description: 'Xây dựng và bảo trì API cho hệ thống...',
      requirements: ['Kinh nghiệm NodeJS, ExpressJS', 'Hiểu biết về MongoDB/PostgreSQL', 'Kiến thức về RESTful API'],
      benefits: ['Thưởng dự án', 'Du lịch hàng năm', 'Cơ hội học hỏi'],
       datePosted: '2025-04-18',
    },
     {
      id: '3',
      title: 'UI/UX Designer',
      companyName: 'Creative Solutions',
      location: 'Đà Nẵng',
      type: 'Part-time',
      salary: 'Up to 15M VND',
      description: 'Thiết kế giao diện, trải nghiệm người dùng cho web/mobile app...',
      requirements: ['Sử dụng thành thạo Figma/Sketch/XD', 'Có kiến thức về Design Principles', 'Portfolio ấn tượng'],
      benefits: ['Làm việc linh hoạt', 'Môi trường sáng tạo'],
       datePosted: '2025-04-19',
    },
    {
        id: '4',
        title: 'UI/UX Designer',
        companyName: 'Creative Solutions',
        location: 'Đà Nẵng',
        type: 'Part-time',
        salary: 'Up to 15M VND',
        description: 'Thiết kế giao diện, trải nghiệm người dùng cho web/mobile app...',
        requirements: ['Sử dụng thành thạo Figma/Sketch/XD', 'Có kiến thức về Design Principles', 'Portfolio ấn tượng'],
        benefits: ['Làm việc linh hoạt', 'Môi trường sáng tạo'],
         datePosted: '2025-04-19',
      },
      {
        id: '5',
        title: 'UI/UX Designer',
        companyName: 'Creative Solutions',
        location: 'Đà Nẵng',
        type: 'Part-time',
        salary: 'Up to 15M VND',
        description: 'Thiết kế giao diện, trải nghiệm người dùng cho web/mobile app...',
        requirements: ['Sử dụng thành thạo Figma/Sketch/XD', 'Có kiến thức về Design Principles', 'Portfolio ấn tượng'],
        benefits: ['Làm việc linh hoạt', 'Môi trường sáng tạo'],
         datePosted: '2025-04-19',
      },
      {
        id: '6',
        title: 'UI/UX Designer',
        companyName: 'Creative Solutions',
        location: 'Đà Nẵng',
        type: 'Part-time',
        salary: 'Up to 15M VND',
        description: 'Thiết kế giao diện, trải nghiệm người dùng cho web/mobile app...',
        requirements: ['Sử dụng thành thạo Figma/Sketch/XD', 'Có kiến thức về Design Principles', 'Portfolio ấn tượng'],
        benefits: ['Làm việc linh hoạt', 'Môi trường sáng tạo'],
         datePosted: '2025-04-19',
      },
    // Thêm các job khác...
  ];
  
  // Hàm giả lập lấy dữ liệu (sau này sẽ thay bằng API call)
  export const fetchJobs = async () => {
     // Giả lập độ trễ mạng
     await new Promise(resolve => setTimeout(resolve, 500));
     return mockJobs;
  };
  
  export const fetchJobById = async (jobId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockJobs.find(job => job.id === jobId);
  };

  export const mockAppliedJobs = [
    {
      applicationId: 'app001',
      jobId: '1', // ID của job trong mockJobs
      jobTitle: 'Frontend Developer (ReactJS)',
      companyName: 'TechCorp',
      dateApplied: '2025-04-21',
      // Trạng thái: 'Đã nộp', 'Đang xét duyệt', 'Mời phỏng vấn', 'Mời làm bài test', 'Trúng tuyển', 'Từ chối'
      status: 'Đang xét duyệt',
    },
    {
      applicationId: 'app002',
      jobId: '3', // ID của job trong mockJobs
      jobTitle: 'UI/UX Designer',
      companyName: 'Creative Solutions',
      dateApplied: '2025-04-19',
      status: 'Mời phỏng vấn',
    },
    {
      applicationId: 'app003',
      jobId: '2', // ID của job trong mockJobs (ví dụ đã bị từ chối)
      jobTitle: 'Backend Developer (NodeJS)',
      companyName: 'InnoTech',
      dateApplied: '2025-04-15',
      status: 'Từ chối',
    },
     {
      applicationId: 'app004',
      jobId: 'some-other-job-id', // Job này có thể không có trong mockJobs hiện tại
      jobTitle: 'Fullstack Developer',
      companyName: 'Startup Z',
      dateApplied: '2025-04-22',
      status: 'Đã nộp',
    },
  ];
  
  // Hàm giả lập fetch applied jobs
  export const fetchAppliedJobs = async (candidateId) => {
    console.log("Fetching applied jobs for candidate (mock):", candidateId);
    // Trong thực tế sẽ gọi API: GET /api/candidates/{candidateId}/applications
    await new Promise(resolve => setTimeout(resolve, 600)); // Giả lập độ trễ mạng
    // Sắp xếp theo ngày ứng tuyển mới nhất (tùy chọn)
    return [...mockAppliedJobs].sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
  };

  // src/data/mockJobs.js

// ... mockJobs, mockAppliedJobs và các hàm fetch khác ...

// Dữ liệu giả cho việc làm đã lưu (Lấy từ mockJobs hoặc tạo mới)
// Giả sử ứng viên lưu job có id '1' và '2'
export const mockSavedJobsData = mockJobs.filter(job => ['1', '2'].includes(job.id));

// Hàm giả lập fetch saved jobs
export const fetchSavedJobs = async (candidateId) => {
  console.log("Fetching saved jobs for candidate (mock):", candidateId);
  // API thật: GET /api/candidates/{candidateId}/saved-jobs
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSavedJobsData; // Trả về dữ liệu giả
};

// Hàm giả lập bỏ lưu việc làm
export const unsaveJob = async (candidateId, jobId) => {
   console.log(`Unsaving job (mock): Candidate ${candidateId}, Job ${jobId}`);
   // API thật: DELETE /api/candidates/{candidateId}/saved-jobs/{jobId}
   await new Promise(resolve => setTimeout(resolve, 300));
   // Cập nhật lại mock data (để UI phản ánh)
   const index = mockSavedJobsData.findIndex(job => job.id === jobId);
   if (index > -1) {
       mockSavedJobsData.splice(index, 1);
   }
   return true; // Giả lập thành công
}
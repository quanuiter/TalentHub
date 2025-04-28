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
// (Hoặc thêm vào src/data/mockJobs.js)

// Lấy một vài job từ mockJobs hoặc tạo mới, thêm trạng thái
export const mockEmployerJobsData = [
  {
    id: 'empjob001', // ID riêng cho tin đăng của employer này
    originalJobId: '1', // Có thể link tới jobId gốc nếu cần
    title: 'Frontend Developer (ReactJS)',
    companyName: 'TalentHub Corp (Test)', // Tên công ty của employer đang login
    location: 'TP. Hồ Chí Minh',
    datePosted: '2025-04-22',
    applicationDeadline: '2025-05-22',
    status: 'Active', // 'Active', 'Closed', 'Draft', 'Expired'
    applicantCount: 15, // Số lượng ứng viên giả lập
    associatedTestIds: ['test001']
  },
  {
    id: 'empjob002',
    originalJobId: '3',
    title: 'UI/UX Designer (Part-time)',
    companyName: 'TalentHub Corp (Test)',
    location: 'Remote',
    datePosted: '2025-04-20',
    applicationDeadline: '2025-05-10',
    status: 'Closed',
    applicantCount: 8,
    associatedTestIds: ['test002']
  },
   {
    id: 'empjob003',
    originalJobId: 'new001', // Job mới chưa có trong mockJobs công khai
    title: 'Senior Java Developer',
    companyName: 'TalentHub Corp (Test)',
    location: 'Hà Nội',
    datePosted: '2025-04-23',
    applicationDeadline: '2025-05-30',
    status: 'Active',
    applicantCount: 5,
    associatedTestIds: ['test003']
  },
   {
    id: 'empjob004',
    originalJobId: 'draft001',
    title: 'Marketing Executive (Draft)',
    companyName: 'TalentHub Corp (Test)',
    location: 'TP. Hồ Chí Minh',
    datePosted: '2025-04-23',
    applicationDeadline: null, // Chưa set
    status: 'Draft', // Tin nháp
    applicantCount: 0,
  },
];
// Hàm giả lập fetch jobs của employer
export const fetchEmployerJobs = async (employerId) => {
  console.log("Fetching jobs for employer (mock):", employerId);
  // API Thật: GET /api/employers/{employerId}/jobs hoặc /api/jobs?companyId=...
  await new Promise(resolve => setTimeout(resolve, 700));
  // Chỉ trả về job của công ty đang login (giả lập)
  return mockEmployerJobsData.filter(job => job.companyName.includes('TalentHub Corp')); // Lọc theo tên cty (ví dụ)
};

// Hàm giả lập thay đổi trạng thái job
export const toggleJobStatus = async (employerId, jobId, currentStatus) => {
    const newStatus = (currentStatus === 'Active' ? 'Closed' : 'Active');
    console.log(`Toggling job status (mock): Emp ${employerId}, Job ${jobId}, From ${currentStatus} To ${newStatus}`);
    // API Thật: PATCH /api/jobs/{jobId}/status { status: newStatus }
    await new Promise(resolve => setTimeout(resolve, 400));
    const jobIndex = mockEmployerJobsData.findIndex(j => j.id === jobId);
    if(jobIndex > -1) {
        mockEmployerJobsData[jobIndex].status = newStatus;
        return newStatus; // Trả về status mới
    }
    throw new Error("Job not found");
};

// Hàm giả lập xóa job
export const deleteEmployerJob = async (employerId, jobId) => {
     console.log(`Deleting job (mock): Emp ${employerId}, Job ${jobId}`);
     // API Thật: DELETE /api/jobs/{jobId}
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEmployerJobsData.findIndex(j => j.id === jobId);
    if (index > -1) {
        mockEmployerJobsData.splice(index, 1);
        return true;
    }
     throw new Error("Job not found");
}

// src/data/mockEmployerData.js (hoặc mockApplicants.js)

// ... mockEmployerJobsData và các hàm khác ...

// Dữ liệu giả lập ứng viên cho một Job ID cụ thể (ví dụ: 'empjob001')
export const mockApplicantsData = [
  {
    applicationId: 'app101',
    jobId: 'empjob001', // Job họ ứng tuyển
    candidateId: 'uv001', // ID ứng viên (link tới profile sau)
    candidateName: 'Trần Thị Bích Hằng',
    applicationDate: '2025-04-23T10:00:00',
    status: 'Mời phỏng vấn', // 'Mới', 'Đã xem', 'Phù hợp', 'Không phù hợp', 'Mời phỏng vấn', 'Từ chối'...
    cvUrl: '#', // Link tới file CV giả lập
    profileUrl: '/candidate/profile/uv001' // Link tới profile ứng viên (nếu có)
  },
  {
    applicationId: 'app102',
    jobId: 'empjob001',
    candidateId: 'uv002',
    candidateName: 'Lê Văn An',
    applicationDate: '2025-04-22T15:30:00',
    status: 'Đã xem',
    cvUrl: '#',
    profileUrl: '#'
  },
  {
    applicationId: 'app103',
    jobId: 'empjob001',
    candidateId: 'uv003',
    candidateName: 'Phạm Thị Dung',
    applicationDate: '2025-04-22T09:00:00',
    status: 'Phù hợp', // Đã được đánh dấu phù hợp
    cvUrl: '#',
    profileUrl: '#'
  },
   {
    applicationId: 'app104',
    jobId: 'empjob003', // Ứng tuyển job khác
    candidateId: 'uv004',
    candidateName: 'Hoàng Minh Khang',
    applicationDate: '2025-04-24T08:15:00',
    status: 'Mới',
    cvUrl: '#',
    profileUrl: '#'
  },
];

// Hàm giả lập fetch ứng viên cho một job
export const fetchApplicantsForJob = async (employerId, jobId) => {
  console.log(`Workspaceing applicants for job (mock): Employer ${employerId}, Job ${jobId}`);
  // API Thật: GET /api/jobs/{jobId}/applicants?employerId={employerId}
  await new Promise(resolve => setTimeout(resolve, 600));
  // Trả về danh sách ứng viên giả lập cho job 'empjob001' (ví dụ)
  return mockApplicantsData.filter(app => app.jobId === 'empjob001');
  // Hoặc trả về tất cả nếu jobId là null/undefined (cho trang tổng hợp sau này)
  // return mockApplicantsData;
};

// Hàm giả lập thay đổi trạng thái ứng viên
export const updateApplicantStatus = async (applicationId, newStatus) => {
  console.log(`Updating applicant status (mock): App ${applicationId}, New Status ${newStatus}`);
  await new Promise(resolve => setTimeout(resolve, 350));
  const appIndex = mockApplicantsData.findIndex(a => a.applicationId === applicationId);
  if (appIndex > -1) {
      mockApplicantsData[appIndex].status = newStatus;
      // Cần cập nhật cả mảng gốc nếu muốn thay đổi có hiệu lực giữa các lần load
      // Hoặc chỉ cần trả về object đã cập nhật
      return { ...mockApplicantsData[appIndex] };
  }
  throw new Error("Application not found");
};

export const sendTestToApplicant = async (employerId, applicationId, testId, testLink, testName, applicantName) => {
  console.log(`Sending test (mock): Emp ${employerId}, App ${applicationId}, Test ${testId}`);
  console.log(` -> Test Name: ${testName}, Link: ${testLink}`);
  console.log(` -> To Applicant: ${applicantName}`);
  // API Thật: POST /api/applications/{applicationId}/send-test { testId: testId }
  await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập gửi email/thông báo

  // Cập nhật trạng thái ứng viên thành "Đã gửi bài test"
  const updatedApp = await updateApplicantStatus(applicationId, 'Đã gửi bài test');
  return updatedApp; // Trả về ứng dụng đã cập nhật status
};

export const fetchEmployerJobDetail = async (employerId, jobId) => {
  console.log(`Fetching job detail (mock): Emp ${employerId}, Job ${jobId}`);
  await new Promise(resolve => setTimeout(resolve, 200));
  const job = mockEmployerJobsData.find(j => j.id === jobId);
  // Đảm bảo trả về associatedTestIds là một mảng (có thể rỗng)
  return job ? { ...job, associatedTestIds: job.associatedTestIds || [] } : undefined;
};

// src/data/mockData.js (hoặc file data của bạn)

// ... mock data khác ...

// Dữ liệu giả lập cho các bài test (ĐÃ ĐƠN GIẢN HÓA)
export let mockTestsData = [ // Dùng let để có thể xóa/sửa trực tiếp
  {
    testId: 'test001',
    name: 'Test ReactJS Cơ bản (Google Form)',
    link: 'https://docs.google.com/forms/d/e/your-google-form-link-1/viewform?usp=sf_link', // <<< Thêm link
    dateCreated: '2025-04-20T10:00:00Z',
    // questionCount: 10, // <<< Bỏ số lượng câu hỏi
  },
  {
    testId: 'test002',
    name: 'Kiểm tra Tư duy Logic (External Link)',
    link: 'https://externa-test-platform.com/logic-test-xyz', // <<< Thêm link
    dateCreated: '2025-04-15T14:30:00Z',
  },
];

// Hàm fetch danh sách bài test (giữ nguyên)
export const fetchEmployerTests = async (employerId) => {
  console.log("Fetching tests for employer (mock):", employerId);
  await new Promise(resolve => setTimeout(resolve, 500));
  // Luôn trả về một bản sao của mảng mock hoặc mảng rỗng
  const result = mockTestsData ? [...mockTestsData].sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated)) : [];
  console.log('[fetchEmployerTests] Returning:', result); // <<< THÊM LOG NÀY
  return result; // <<< Đảm bảo luôn return array
};

// Hàm xóa bài test (giữ nguyên)
export const deleteEmployerTest = async (employerId, testId) => {
     console.log(`Deleting test (mock): Emp ${employerId}, Test ${testId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockTestsData.findIndex(t => t.testId === testId);
    if (index > -1) {
        mockTestsData.splice(index, 1); // Xóa khỏi mảng mock
        return true;
    }
     throw new Error("Test not found");
}

// Hàm tạo bài test MỚI (Đơn giản hóa)
export const createEmployerTest = async (employerId, testData) => { // testData giờ chỉ có { name, link }
    console.log(`Creating test (mock): Emp ${employerId}`, testData);
    await new Promise(resolve => setTimeout(resolve, 600));
    if(!testData.name || !testData.link) throw new Error("Missing name or link"); // Validation đơn giản
    const newTest = {
        testId: `test_${Date.now()}`,
        name: testData.name,
        link: testData.link,
        dateCreated: new Date().toISOString(),
    };
    mockTestsData.unshift(newTest);
    return newTest;
}

// Hàm cập nhật bài test (Thêm mới)
export const updateEmployerTest = async (employerId, testId, updatedData) => { // updatedData: { name, link }
     console.log(`Updating test (mock): Emp ${employerId}, Test ${testId}`, updatedData);
    await new Promise(resolve => setTimeout(resolve, 450));
    const testIndex = mockTestsData.findIndex(t => t.testId === testId);
    if (testIndex > -1) {
        if(!updatedData.name || !updatedData.link) throw new Error("Missing name or link");
        mockTestsData[testIndex] = { ...mockTestsData[testIndex], ...updatedData };
        return mockTestsData[testIndex];
    }
     throw new Error("Test not found");
}
// src/data/mockJobs.js (hoặc file tương ứng)
// === THÊM HÀM GIẢ LẬP GỬI LỜI MỜI ===
export const sendInterviewInvite = async (employerId, applicationId, inviteData) => {
    console.log(`Sending invite (mock): Emp ${employerId}, App ${applicationId}`);
    console.log(` -> Invite Data:`, inviteData);
    // API Thật: POST /api/applications/{applicationId}/invite { ...inviteData }
    await new Promise(resolve => setTimeout(resolve, 900)); // Giả lập gửi email/tạo lịch

    // Cập nhật trạng thái ứng viên thành "Mời phỏng vấn" hoặc "Mời làm bài test"
    const newStatus = inviteData.inviteType === 'Phỏng vấn' ? 'Mời phỏng vấn' : 'Mời làm bài test';
    // Gọi lại hàm update status đã có
    const updatedApp = await updateApplicantStatus(applicationId, newStatus);
    return updatedApp; // Trả về application đã cập nhật status
};
// === KẾT THÚC THÊM HÀM ===
// src/data/mockJobs.js (hoặc file data của bạn)

// ... các mock data và hàm fetch khác ...


const detailedCandidateProfileMock = {
  id: 'uv001', // ID này chỉ là ví dụ, hàm fetch sẽ trả về cái này cho mọi ID yêu cầu (trong mock)
  email: 'candidate@gmail.com',
  fullName: 'Trần Thị Bích Hằng',
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
  ],
  skills: ['ReactJS', 'Redux', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'SCSS', 'Material UI', 'Ant Design', 'Git'],
  uploadedCVs: [
    { id: 'cv1', fileName: 'TranThiBichHang_Frontend_CV_Vi.pdf', uploadDate: '2025-04-20', url: '#' },
  ]
};

// Hàm giả lập fetch chi tiết hồ sơ ứng viên cho NTD xem
export const fetchCandidateDetailsForEmployer = async (candidateId) => {
  console.log("Fetching candidate details for employer (mock):", candidateId);
  // API thật: GET /api/employer/candidates/{candidateId}/profile hoặc tương tự
  await new Promise(resolve => setTimeout(resolve, 600)); // Giả lập độ trễ
  // Luôn trả về dữ liệu mẫu cho bất kỳ ID nào trong giai đoạn mock
  // (Sau này sẽ tìm đúng candidate theo ID)
  if(candidateId) { // Chỉ trả về nếu có ID (tránh lỗi)
      return { ...detailedCandidateProfileMock, id: candidateId }; // Trả về bản sao, có thể ghi đè ID nếu cần
  }
  return null;

};
// src/data/mockJobs.js (hoặc file tương ứng)

// ... mock data và các hàm fetch khác ...

// Dữ liệu ngành nghề (có thể lấy từ mockJobs.js hoặc định nghĩa lại)
export const mockIndustriesForSelect = [
  { id: 'it-software', label: 'CNTT - Phần mềm' },
  { id: 'it-hardware', label: 'CNTT - Phần cứng / Mạng' },
  { id: 'marketing', label: 'Marketing / Truyền thông / Quảng cáo' },
  { id: 'sales', label: 'Bán hàng / Kinh doanh' },
  { id: 'hr', label: 'Nhân sự' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán' },
  { id: 'design', label: 'Thiết kế / Mỹ thuật' },
  // ... thêm ngành khác ...
];

// Quy mô công ty ví dụ
export const mockCompanySizes = ['Dưới 10 nhân viên', '10-50 nhân viên', '50-100 nhân viên', '100-500 nhân viên', 'Trên 500 nhân viên'];
// Dữ liệu giả lập chi tiết cho công ty (ID 'comp001' khớp với employer 'ntd001' trong AuthContext)
const mockCompanyProfileData = {
  id: 'comp001',
  name: 'TalentHub Corp (Test)', // Tên này nên khớp với AuthContext ban đầu
  description: 'TalentHub Corp là công ty công nghệ hàng đầu chuyên cung cấp các giải pháp tuyển dụng thông minh, kết nối hiệu quả nhà tuyển dụng và ứng viên tiềm năng. Chúng tôi luôn tìm kiếm những tài năng xuất sắc để cùng phát triển.',
  website: 'https://talenthub.example.com',
  address: 'Tòa nhà Innovation, Khu Công nghệ cao, TP. Thủ Đức, TP.HCM',
  industry: mockIndustriesForSelect.find(i => i.id === 'it-software'), // Lấy object ngành nghề từ danh sách trên
  size: '100-500 nhân viên',
  logoUrl: 'https://via.placeholder.com/150/1976d2/ffffff?text=TH', // Placeholder logo
};

// Hàm fetch chi tiết hồ sơ công ty
export const fetchCompanyProfile = async (companyId) => {
    console.log(`Fetching company profile (mock): Company ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    // Trả về dữ liệu mẫu nếu ID khớp (trong mock)
    return companyId === mockCompanyProfileData.id ? { ...mockCompanyProfileData } : null;
};

// Hàm cập nhật hồ sơ công ty (Giả lập)
export const updateCompanyProfile = async (companyId, profileData) => {
    console.log(`Updating company profile (mock): Company ${companyId}`, profileData);
    await new Promise(resolve => setTimeout(resolve, 700));
    // Cập nhật mock data (chỉ giả lập, không lưu trữ lâu dài)
    if(companyId === mockCompanyProfileData.id) {
        // Chuyển industryId thành object industry trước khi cập nhật mock (nếu API trả về ID)
        // Hoặc nếu profileData đã chứa object industry thì giữ nguyên
        let dataToUpdateInMock = { ...profileData };
        if(profileData.industryId && !profileData.industry) {
             dataToUpdateInMock.industry = mockIndustriesForSelect.find(i => i.id === profileData.industryId);
             delete dataToUpdateInMock.industryId;
        }

        Object.assign(mockCompanyProfileData, dataToUpdateInMock);
        console.log('Mock company data updated:', mockCompanyProfileData);
        return { ...mockCompanyProfileData };
    }
    throw new Error("Company not found for update");
};

// --- Kết thúc phần Company Profile ---
// Dữ liệu thống kê giả lập
const mockEmployerStatsData = {
  totalJobsPosted: 25,      // Tổng tin đã đăng
  activeJobs: 8,           // Tin đang hoạt động
  totalApplicants: 350,    // Tổng hồ sơ nhận được
  newApplicantsToday: 12,  // Hồ sơ mới trong ngày (ví dụ)
  interviewsScheduled: 28, // Lịch phỏng vấn đã đặt
  hiresThisMonth: 3,       // Số lượng tuyển được tháng này (ví dụ)
  // Thêm các số liệu khác nếu cần
};

// Hàm fetch thống kê giả lập
export const fetchEmployerStats = async (employerId) => {
    console.log(`Fetching stats for employer (mock): ${employerId}`);
    // API Thật: GET /api/employer/stats hoặc tương tự
    await new Promise(resolve => setTimeout(resolve, 300)); // Giả lập độ trễ
    // Luôn trả về dữ liệu mẫu
    return { ...mockEmployerStatsData };
};

// Hàm giả lập đổi mật khẩu employer
export const changeEmployerPassword = async (employerId, currentPassword, newPassword) => {
  console.log(`Changing password (mock): Emp ${employerId}`);
  console.log(` -> Current Pass Provided: ${currentPassword}`); // Chỉ log ở mock, không log ở production
  console.log(` -> New Pass Provided: ${newPassword}`); // Chỉ log ở mock, không log ở production
  // API Thật: POST /api/employer/change-password { currentPassword, newPassword }
  await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập độ trễ

  // Giả lập logic kiểm tra mật khẩu cũ (ví dụ đơn giản)
  if (currentPassword !== 'password') { // Giả sử mật khẩu cũ luôn là 'password' trong mock
      throw new Error("Mật khẩu hiện tại không đúng.");
  }

  // Giả lập thành công
  console.log("Password changed successfully (mock)");
  return { success: true, message: "Đổi mật khẩu thành công!" };
};

// === Kết thúc phần Employer Settings ===

// === THÊM HÀM UPDATE JOB ===
export const updateEmployerJob = async (employerId, jobId, jobData) => {
  console.log(`Updating job (mock): Emp ${employerId}, Job ${jobId}`, jobData);
  // API Thật: PUT /api/jobs/{jobId} { ...jobData }
  await new Promise(resolve => setTimeout(resolve, 750));
  const jobIndex = mockEmployerJobsData.findIndex(j => j.id === jobId);
  if (jobIndex > -1) {
      // Cập nhật mock data tại chỗ (giả lập)
      mockEmployerJobsData[jobIndex] = {
          ...mockEmployerJobsData[jobIndex], // Giữ lại các trường không đổi như id, applicantCount...
          ...jobData, // Ghi đè các trường được gửi lên
          // Cập nhật lại industry label nếu cần (dựa vào industryId gửi lên)
          industryLabel: mockIndustriesForSelect.find(i => i.id === jobData.industryId)?.label,
      };
       console.log('Mock job data updated:', mockEmployerJobsData[jobIndex]);
      return { ...mockEmployerJobsData[jobIndex] }; // Trả về data đã cập nhật
  }
  throw new Error("Job not found for update");
};
// === KẾT THÚC THÊM HÀM ===

// Hàm tạo job (createEmployerJob) sẽ được gọi khi không có jobId (chế độ tạo mới)
export const createEmployerJob = async (employerId, jobData) => {
  console.log(`Creating job (mock): Emp ${employerId}`, jobData);
  // API Thật: POST /api/jobs
  await new Promise(resolve => setTimeout(resolve, 600));
  const newJob = {
      id: `empjob_${Date.now()}`,
      originalJobId: `new_${Date.now()}`,
      companyName: 'TalentHub Corp (Test)', // Lấy từ authState sau này
      applicantCount: 0,
      status: 'Active', // Hoặc 'Draft' tùy quy trình
      datePosted: new Date().toISOString().split('T')[0], // Ngày hiện tại
      ...jobData,
      industryLabel: mockIndustriesForSelect.find(i => i.id === jobData.industryId)?.label,
  };
  mockEmployerJobsData.unshift(newJob); // Thêm vào đầu danh sách mock
  return newJob;
};
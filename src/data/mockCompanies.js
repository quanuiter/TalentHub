// src/data/mockCompanies.js

export const mockCompanies = [
  {
    id: 'fpt',
    name: 'FPT Software',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png',
    techStack: ['Java', 'C++', 'English', 'Android', 'SQL', '.NET'],
    locations: 'Hồ Chí Minh - Hà Nội - Đà Nẵng - ...',
    jobCount: 108,
    // --- THÊM DÒNG NÀY ---
    description: 'FPT Software là công ty công nghệ hàng đầu Việt Nam, cung cấp dịch vụ và giải pháp chuyển đổi số toàn diện cho khách hàng trên toàn cầu. Với đội ngũ hơn 20,000 kỹ sư tài năng, chúng tôi tập trung vào các lĩnh vực như AI, Cloud, IoT, và tự động hóa.',
    // --- KẾT THÚC ---
  },
  {
    id: 'bosch',
    name: 'Bosch Global Software',
    logoUrl: 'https://cdn.worldvectorlogo.com/logos/bosch-2.svg',
    techStack: ['Embedded', 'C language', 'C++', 'Java', '.NET', 'SAP'],
    locations: 'Hồ Chí Minh - Hà Nội',
    jobCount: 6,
    // --- THÊM DÒNG NÀY ---
    description: 'Bosch Global Software Technologies (BGSW) là trung tâm phát triển phần mềm và công nghệ lớn nhất của Bosch bên ngoài nước Đức. Chúng tôi phát triển các giải pháp sáng tạo cho ngành ô tô, công nghiệp và tiêu dùng.',
    // --- KẾT THÚC ---
  },
  {
    id: 'employment-hero',
    name: 'Employment Hero',
    logoUrl: 'https://images.squarespace-cdn.com/content/v1/6011243973acce45edf463f7/e7f11b3a-6892-430e-948a-500a5bee13aa/EH+App+Icon.png',
    techStack: ['ReactJS', 'AWS', 'Ruby on Rails', 'Python', 'Typescript', 'React Native'],
    locations: 'Hồ Chí Minh',
    jobCount: 5,
    // --- THÊM DÒNG NÀY ---
    description: 'Employment Hero là nền tảng quản lý nhân sự và tính lương hàng đầu cho các doanh nghiệp vừa và nhỏ tại Úc, New Zealand, Anh, Singapore và Malaysia. Chúng tôi giúp doanh nghiệp quản lý nhân sự hiệu quả hơn.',
    // --- KẾT THÚC ---
  },
   {
    id: 'scandinavian',
    name: 'Scandinavian Software Park',
    logoUrl: 'https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/c3f9255e31d4301ccb73b6a8e9623925.png',
    techStack: ['C#', 'Javascript', 'Java', 'PHP', 'QA QC', 'SQL'],
    locations: 'Hà Nội',
    jobCount: 3,
    // --- THÊM DÒNG NÀY ---
    description: 'Công viên Phần mềm Scandinavian (SSP) là một công ty phát triển phần mềm chuyên nghiệp, tập trung vào việc cung cấp các giải pháp chất lượng cao cho thị trường Bắc Âu.',
    // --- KẾT THÚC ---
  },
  {
    id: 'mb-bank',
    name: 'MB Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Logo_MB_new.png/1200px-Logo_MB_new.png',
    techStack: ['Java', 'JavaScript', 'Python', 'Oracle', 'AngularJS', 'ReactJS'],
    locations: 'Hà Nội',
    jobCount: 27,
    // --- THÊM DÒNG NÀY ---
    description: 'Ngân hàng TMCP Quân đội (MB) là một trong những ngân hàng thương mại hàng đầu tại Việt Nam, cung cấp đa dạng các sản phẩm, dịch vụ tài chính cho khách hàng cá nhân và doanh nghiệp.',
    // --- KẾT THÚC ---
  },
   {
    id: 'hitachi',
    name: 'Hitachi Digital Services',
    logoUrl: 'https://vutatech.vn/wp-content/uploads/2024/03/Logo-Hitachi-Vantara-Vietnam-Tach-nen.png',
    techStack: ['C++', 'Python', 'DevOps', 'Java', 'Golang', 'Japanese'],
    locations: 'Hồ Chí Minh - Hà Nội - Đà Nẵng',
    jobCount: 1,
    // --- THÊM DÒNG NÀY ---
    description: 'Hitachi Digital Services (trước đây là Hitachi Vantara Vietnam) cung cấp các giải pháp và dịch vụ kỹ thuật số toàn diện, giúp khách hàng tối ưu hóa hoạt động và đổi mới sáng tạo.',
    // --- KẾT THÚC ---
  },
  // Thêm description cho các công ty khác nếu có
];
  
  // Hàm giả lập fetch (sau này thay bằng API)
  export const fetchCompanies = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockCompanies;
  };
  
  // Hàm lấy chi tiết công ty (nếu cần)
  export const fetchCompanyById = async (companyId) => {
     await new Promise(resolve => setTimeout(resolve, 200));
    return mockCompanies.find(comp => comp.id === companyId);
  }
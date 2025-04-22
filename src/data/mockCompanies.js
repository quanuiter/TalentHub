// src/data/mockCompanies.js

export const mockCompanies = [
    {
      id: 'fpt',
      name: 'FPT Software',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png', // Thay bằng URL logo thật hoặc import
      techStack: ['Java', 'C++', 'English', 'Android', 'SQL', '.NET'],
      locations: 'Hồ Chí Minh - Hà Nội - Đà Nẵng - ...',
      jobCount: 108, // Số lượng job giả định
    },
    {
      id: 'bosch',
      name: 'Bosch Global Software',
      logoUrl: 'https://cdn.worldvectorlogo.com/logos/bosch-2.svg', // Thay bằng URL logo thật hoặc import
      techStack: ['Embedded', 'C language', 'C++', 'Java', '.NET', 'SAP'],
      locations: 'Hồ Chí Minh - Hà Nội',
      jobCount: 6,
    },
    {
      id: 'employment-hero',
      name: 'Employment Hero',
      logoUrl: 'https://images.squarespace-cdn.com/content/v1/6011243973acce45edf463f7/e7f11b3a-6892-430e-948a-500a5bee13aa/EH+App+Icon.png', // Thay bằng URL logo thật hoặc import
      techStack: ['ReactJS', 'AWS', 'Ruby on Rails', 'Python', 'Typescript', 'React Native'],
      locations: 'Hồ Chí Minh',
      jobCount: 5,
    },
     {
      id: 'scandinavian',
      name: 'Scandinavian Software Park',
      logoUrl: 'https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/c3f9255e31d4301ccb73b6a8e9623925.png', // Thay bằng URL logo thật hoặc import
      techStack: ['C#', 'Javascript', 'Java', 'PHP', 'QA QC', 'SQL'],
      locations: 'Hà Nội',
      jobCount: 3,
    },
    {
      id: 'mb-bank',
      name: 'MB Bank',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Logo_MB_new.png/1200px-Logo_MB_new.png', // Thay bằng URL logo thật hoặc import
      techStack: ['Java', 'JavaScript', 'Python', 'Oracle', 'AngularJS', 'ReactJS'],
      locations: 'Hà Nội',
      jobCount: 27,
    },
     {
      id: 'hitachi',
      name: 'Hitachi Digital Services',
      logoUrl: 'https://vutatech.vn/wp-content/uploads/2024/03/Logo-Hitachi-Vantara-Vietnam-Tach-nen.png', // Thay bằng URL logo thật hoặc import
      techStack: ['C++', 'Python', 'DevOps', 'Java', 'Golang', 'Japanese'],
      locations: 'Hồ Chí Minh - Hà Nội - Đà Nẵng',
      jobCount: 1,
    },
    // Thêm các công ty khác nếu muốn
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
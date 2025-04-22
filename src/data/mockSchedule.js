// src/data/mockSchedule.js

export const mockScheduleEvents = [
    {
      eventId: 'sched001',
      type: 'Phỏng vấn', // 'Phỏng vấn' hoặc 'Làm bài test'
      jobId: '3',
      jobTitle: 'UI/UX Designer',
      companyName: 'Creative Solutions',
      dateTime: '2025-04-25T10:00:00', // ISO 8601 format
      durationMinutes: 45, // Thời lượng (phút) - tùy chọn
      location: 'Online', // Hoặc địa chỉ cụ thể
      link: 'https://meet.google.com/xxx-xxxx-xxx', // Link meeting hoặc test
      status: 'Đã xác nhận', // 'Chờ xác nhận', 'Đã hủy', 'Đã hoàn thành'
      notes: 'Phỏng vấn vòng 1 với HR Manager.', // Ghi chú thêm (tùy chọn)
    },
    {
      eventId: 'sched002',
      type: 'Làm bài test',
      jobId: '1',
      jobTitle: 'Frontend Developer (ReactJS)',
      companyName: 'TechCorp',
      dateTime: '2025-04-28T14:00:00',
      durationMinutes: 60,
      location: 'Online',
      link: 'https://test-platform.example.com/invite/yyy',
      status: 'Chờ xác nhận',
      notes: 'Bài test kỹ năng ReactJS cơ bản.',
    },
     {
      eventId: 'sched003',
      type: 'Phỏng vấn',
      jobId: 'unknown-job-id',
      jobTitle: 'Data Analyst',
      companyName: 'Data Solutions Inc.',
      dateTime: '2025-04-23T09:30:00', // Lịch trong quá khứ (ví dụ đã hoàn thành)
      durationMinutes: 30,
      location: 'Tầng 5, Tòa nhà ABC, 123 Đường Z',
      link: null,
      status: 'Đã hoàn thành',
      notes: 'Phỏng vấn nhanh qua điện thoại.',
    },
    // Thêm các lịch hẹn khác nếu muốn
  ];
  
  // Hàm giả lập fetch schedule events
  export const fetchScheduleEvents = async (candidateId) => {
    console.log("Fetching schedule events for candidate (mock):", candidateId);
    // API thật: GET /api/candidates/{candidateId}/schedule
    await new Promise(resolve => setTimeout(resolve, 450));
    // Sắp xếp theo thời gian gần nhất trước (tùy chọn)
     const upcomingEvents = mockScheduleEvents
      .filter(event => new Date(event.dateTime) >= new Date() || ['Chờ xác nhận', 'Đã xác nhận'].includes(event.status) ) // Lọc sự kiện chưa diễn ra hoặc chờ xác nhận/đã xác nhận
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    return upcomingEvents; // Chỉ trả về các sự kiện sắp tới hoặc cần chú ý
  };
  
  // Hàm giả lập xác nhận lịch hẹn
  export const confirmSchedule = async (candidateId, eventId) => {
       console.log(`Confirming schedule (mock): Candidate ${candidateId}, Event ${eventId}`);
       // API thật: POST /api/candidates/{candidateId}/schedule/{eventId}/confirm
       await new Promise(resolve => setTimeout(resolve, 300));
       // Cập nhật mock data (tìm event và đổi status)
       const event = mockScheduleEvents.find(e => e.eventId === eventId);
       if (event) {
           event.status = 'Đã xác nhận';
       }
       return true;
  }
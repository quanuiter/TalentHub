// src/data/mockSchedule.js

export const mockScheduleEvents = [
  // ... (dữ liệu mock cũ) ...
  {
    eventId: 'sched001',
    type: 'Phỏng vấn',
    jobId: '3',
    jobTitle: 'UI/UX Designer',
    companyName: 'Creative Solutions',
    dateTime: '2025-04-28T10:00:00', // Thay đổi ngày để nó ở tương lai gần
    durationMinutes: 45,
    location: 'Online',
    link: 'https://meet.google.com/xxx-xxxx-xxx',
    status: 'Chờ xác nhận', // Đổi trạng thái để test
    notes: 'Phỏng vấn vòng 1 với HR Manager.',
  },
  {
    eventId: 'sched002',
    type: 'Làm bài test',
    jobId: '1',
    jobTitle: 'Frontend Developer (ReactJS)',
    companyName: 'TechCorp',
    dateTime: '2025-04-29T14:00:00', // Thay đổi ngày
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
    dateTime: '2025-04-26T09:30:00', // Lịch trong quá khứ
    durationMinutes: 30,
    location: 'Tầng 5, Tòa nhà ABC, 123 Đường Z',
    link: null,
    status: 'Đã hoàn thành',
    notes: 'Phỏng vấn nhanh qua điện thoại.',
  },
  // Thêm lịch đã xác nhận để xem sự khác biệt
  {
    eventId: 'sched004',
    type: 'Phỏng vấn',
    jobId: '2',
    jobTitle: 'Backend Developer (NodeJS)',
    companyName: 'InnoTech',
    dateTime: '2025-05-02T11:00:00',
    durationMinutes: 60,
    location: 'VP InnoTech, Hà Nội',
    link: null,
    status: 'chờ xác nhận',
    notes: 'Phỏng vấn chuyên môn với Tech Lead.',
  },
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
  // Hàm giả lập từ chối lịch hẹn
export const declineSchedule = async (candidateId, eventId) => {
  console.log(`Declining schedule (mock): Candidate ${candidateId}, Event ${eventId}`);
  // API thật: POST /api/candidates/{candidateId}/schedule/{eventId}/decline
  await new Promise(resolve => setTimeout(resolve, 350)); // Giả lập độ trễ
  // Cập nhật mock data
  const eventIndex = mockScheduleEvents.findIndex(e => e.eventId === eventId);
  if (eventIndex > -1) {
      mockScheduleEvents[eventIndex].status = 'Đã từ chối'; // <<< Đổi trạng thái
      return true; // Giả lập thành công
  }
  return false; // Không tìm thấy event
}
// --- KẾT THÚC THÊM HÀM ---
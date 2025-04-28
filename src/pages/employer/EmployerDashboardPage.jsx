// src/pages/employer/EmployerDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; //
// Import các hàm fetch dữ liệu giả lập
import {
    fetchEmployerStats,
    fetchEmployerJobs,
    fetchApplicantsForJob
} from '../../data/mockJobs'; //

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link'; // MUI Link
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import LoadingSpinner from '../../components/ui/LoadingSpinner'; //
import Alert from '@mui/material/Alert';

// Import Icons (Lấy một số từ StatisticsPage để dùng lại)
import WorkIcon from '@mui/icons-material/Work';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment'; // Icon thống kê
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Component thẻ thống kê nhỏ (tương tự StatisticsPage)
function StatCard({ title, value, icon, color = 'primary', linkTo }) {
    const navigate = useNavigate();
    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                cursor: linkTo ? 'pointer' : 'default', // Con trỏ nếu có link
                '&:hover': linkTo ? {
                    boxShadow: 6, // Tăng shadow khi hover nếu có link
                    backgroundColor: (theme) => theme.palette.action.hover // Thêm màu nền nhẹ
                } : {}
            }}
            onClick={() => linkTo && navigate(linkTo)} // Điều hướng khi click
        >
            <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, mr: 1.5 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {value ?? '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {title}
                </Typography>
            </Box>
        </Paper>
    );
}

// Helper lấy màu chip (từ ManageJobsPage)
const getJobStatusColor = (status) => { //
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'closed': case 'expired': return 'default';
    case 'draft': return 'warning';
    default: return 'info';
  }
};

function EmployerDashboardPage() {
  const { authState } = useAuth(); //
  const navigate = useNavigate();
  const user = authState.user;

  // State cho dữ liệu dashboard
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]); // Giả sử lấy 5 ứng viên mới nhất tổng thể
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) {
        setError("Không thể xác định thông tin nhà tuyển dụng.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Gọi API song song
        const [statsData, jobsData, allApplicantsData] = await Promise.all([
          fetchEmployerStats(user.id), //
          fetchEmployerJobs(user.id), //
          // Lấy tất cả ứng viên để lọc ra 5 người mới nhất (giả lập)
          // API thực tế nên có endpoint lấy ứng viên mới nhất
          fetchApplicantsForJob(user.id, null) // Truyền null jobId để lấy tất cả (theo logic mock data)
        ]);

        setStats(statsData);
        // Lấy 3 tin đăng gần nhất (hoặc active)
        setRecentJobs(jobsData
            .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)) // Sắp xếp mới nhất trước
            .slice(0, 3));
        // Lấy 5 ứng viên mới nhất
        setRecentApplicants(allApplicantsData
            .sort((a,b)=> new Date(b.applicationDate) - new Date(a.applicationDate))
            .slice(0, 5));

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard nhà tuyển dụng:", err);
        setError("Không thể tải dữ liệu cho bảng điều khiển.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  if (loading) {
    return <LoadingSpinner />; //
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Bảng điều khiển Nhà tuyển dụng
      </Typography>

      {/* Phần Thống kê nhanh */}
      <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center'} }>
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <StatCard title="Tin đang Active" value={stats?.activeJobs} icon={<WorkIcon />} color="success" linkTo="/employer/manage-jobs" />
        </Grid>
         <Grid item xs={6} sm={4} md={3} lg={2}>
            <StatCard title="Hồ sơ mới (nay)" value={stats?.newApplicantsToday} icon={<FiberNewIcon />} color="warning" linkTo="/employer/applicants" /> {/* Cần link đến trang quản lý tổng hợp */}
        </Grid>
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <StatCard title="Tổng hồ sơ" value={stats?.totalApplicants} icon={<PeopleAltIcon />} color="info" />
        </Grid>
         {/* Thêm thẻ thống kê khác nếu muốn */}
         <Grid item xs={6} sm={4} md={3} lg={2}>
            <StatCard title="Xem Thống kê" value={<AssessmentIcon/>} icon={<AssessmentIcon />} color="secondary" linkTo="/employer/statistics" />
         </Grid>
      </Grid>

       {/* Phần Hành động nhanh */}
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Hành động nhanh</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/employer/post-job">
                    Đăng tin tuyển dụng mới
                </Button>
                <Button variant="outlined" startIcon={<ListAltIcon />} component={RouterLink} to="/employer/manage-jobs">
                    Quản lý tin đăng
                </Button>
                 <Button variant="outlined" startIcon={<PeopleAltIcon />} component={RouterLink} to="/employer/applicants"> {/* Cần trang quản lý ứng viên tổng */}
                    Quản lý ứng viên
                </Button>
            </Stack>
        </Paper>

      {/* Phần Tin đăng & Ứng viên gần đây */}
      <Grid container spacing={3}>
        {/* Tin đăng gần đây */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Tin đăng gần đây</Typography>
                <Button size="small" component={RouterLink} to="/employer/manage-jobs" endIcon={<ArrowForwardIcon/>}>Xem tất cả</Button>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {recentJobs.length > 0 ? (
                <List dense disablePadding>
                    {recentJobs.map(job => (
                        <ListItem
                            key={job.id}
                            disableGutters
                            secondaryAction={
                                <Chip label={job.status} color={getJobStatusColor(job.status)} size="small" />
                            }
                            sx={{ '&:hover': { backgroundColor: 'action.hover' }, borderRadius: 1, mb: 0.5 }}
                        >
                            <ListItemText
                                primary={<Link component={RouterLink} to={`/employer/jobs/${job.id}/applicants`} underline="hover" sx={{fontWeight: 'medium'}}>{job.title}</Link>} // Link tới trang quản lý applicants của job đó
                                secondary={`Đăng ngày: ${new Date(job.datePosted).toLocaleDateString('vi-VN')}, ${job.applicantCount ?? 0} ứng viên`}
                            />
                        </ListItem>
                    ))}
                </List>
             ) : (
                 <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>Chưa có tin đăng nào gần đây.</Typography>
             )}
          </Paper>
        </Grid>

        {/* Ứng viên gần đây */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Ứng viên mới nhất</Typography>
                 <Button size="small" component={RouterLink} to="/employer/applicants" endIcon={<ArrowForwardIcon/>}>Xem tất cả</Button> {/* Cần trang quản lý ứng viên tổng */}
            </Box>
             <Divider sx={{ mb: 1 }} />
             {recentApplicants.length > 0 ? (
                <List dense disablePadding>
                    {recentApplicants.map(app => (
                        <ListItem key={app.applicationId} disableGutters sx={{ '&:hover': { backgroundColor: 'action.hover' }, borderRadius: 1, mb: 0.5 }}>
                            <ListItemText
                                // Nên link đến trang chi tiết ứng viên hoặc hồ sơ của job họ ứng tuyển
                                primary={<Link component={RouterLink} to={`/employer/jobs/${app.jobId}/applicants`} underline="hover" sx={{fontWeight: 'medium'}}>{app.candidateName}</Link>}
                                secondary={`Ứng tuyển vào "${app.title || '...'}" ngày ${new Date(app.applicationDate).toLocaleDateString('vi-VN')}`} // Cần lấy tên job từ jobId
                            />
                             {/* Có thể thêm nút xem nhanh CV/Profile */}
                        </ListItem>
                    ))}
                </List>
             ) : (
                  <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>Chưa có ứng viên nào gần đây.</Typography>
             )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EmployerDashboardPage;
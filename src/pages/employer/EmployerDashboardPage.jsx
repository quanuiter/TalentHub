// src/pages/employer/EmployerDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api'; // <<< SỬ DỤNG API SERVICE THẬT

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
import MuiLink from '@mui/material/Link'; // Đổi tên để tránh trùng
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import { useTheme, alpha } from '@mui/material/styles';

// Import Icons
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListItemIcon from '@mui/material/ListItemIcon';
import Snackbar from '@mui/material/Snackbar';
import snackbar from '@mui/material/Snackbar';
// Component thẻ thống kê nhỏ (giữ nguyên như bạn đã có)
function StatCard({ title, value, icon, color = 'primary', linkTo }) {
    const navigate = useNavigate();
    const theme = useTheme();
    return (
        <Paper
            elevation={3}
            sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                borderRadius: '12px',
                cursor: linkTo ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                '&:hover': linkTo ? {
                    boxShadow: `0 6px 12px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.3)}`,
                    transform: 'translateY(-3px)',
                    backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.05)
                } : {}
            }}
            onClick={() => linkTo && navigate(linkTo)}
        >
            <Avatar sx={{ bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1), color: `${color}.dark`, mr: 2, width: 48, height: 48 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: `${color}.dark` }}>
                    {value ?? '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
        </Paper>
    );
}

// Helper lấy màu chip (giữ nguyên)
const getJobStatusColor = (status) => {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'active': return 'success';
    case 'closed': return 'warning';
    case 'expired': return 'default';
    case 'draft': return 'info';
    default: return 'secondary';
  }
};

const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    try {
        return new Date(isoDateString).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return 'Ngày không hợp lệ'; }
};

function EmployerDashboardPage() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const user = authState.user;

  const [stats, setStats] = useState({ activeJobs: 0, newApplicantsToday: 0, totalApplicants: 0, totalJobsPosted: 0, interviewsScheduled: 0, hiresThisMonth: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // --- SỬA ĐỔI CHÍNH Ở HÀM NÀY ---
  const loadDashboardData = useCallback(async () => {
    if (!user?.id || !authState.isAuthenticated || authState.isLoading) {
        setLoading(false);
        if(!authState.isAuthenticated && !authState.isLoading) {
            setError("Vui lòng đăng nhập để xem bảng điều khiển.");
        }
        return;
    }
    setLoading(true);
    setError(null);
    console.log("[EmployerDashboardPage] Starting to load dashboard data...");

    try {
      // Gọi API thật sự bằng apiService
      // Giả sử bạn có một endpoint `/api/employer/dashboard-stats` hoặc tương tự
      // Nếu chưa có, bạn cần tạo nó ở backend, hoặc tạm thời dùng mock cho stats
      const statsPromise = apiService.getEmployerDashboardStats // Giả sử có hàm này trong apiService
          ? apiService.getEmployerDashboardStats()
          : Promise.resolve({ data: { activeJobs: 0, newApplicantsToday: 0, totalApplicants: 0, totalJobsPosted: 0, interviewsScheduled: 0, hiresThisMonth: 0 }}); // Fallback mock

      const jobsPromise = apiService.getEmployerJobsApi(); // API lấy jobs của employer
      const applicantsPromise = apiService.getAllApplicantsForEmployerApi(); // API lấy tất cả applicants của employer

      // Đợi tất cả các promise hoàn thành
      // Sử dụng tên biến rõ ràng khi destructuring kết quả từ Promise.all
      const [statsApiResponse, jobsApiResponse, allApplicantsApiResponse] = await Promise.all([
        statsPromise,
        jobsPromise,
        applicantsPromise
      ]);

      console.log("[EmployerDashboardPage] Stats API Response:", statsApiResponse);
      console.log("[EmployerDashboardPage] Jobs API Response:", jobsApiResponse);
      console.log("[EmployerDashboardPage] All Applicants API Response:", allApplicantsApiResponse);

      // Xử lý kết quả stats
      if (statsApiResponse && statsApiResponse.data) {
        setStats(statsApiResponse.data);
      } else {
        console.warn("Stats data is missing or invalid from API.");
        // Giữ giá trị mặc định hoặc set lỗi cụ thể cho stats nếu cần
      }

      // Xử lý kết quả jobs
      if (jobsApiResponse && Array.isArray(jobsApiResponse.data)) {
        setRecentJobs(
            [...jobsApiResponse.data] // Tạo bản sao trước khi sort
            .sort((a, b) => new Date(b.createdAt || b.datePosted) - new Date(a.createdAt || a.datePosted))
            .slice(0, 5) // Hiển thị 5 tin đăng gần nhất
        );
      } else {
        console.warn("Jobs data is not an array or missing from API.");
        setRecentJobs([]);
      }

      // Xử lý kết quả applicants
      if (allApplicantsApiResponse && Array.isArray(allApplicantsApiResponse.data)) {
        setRecentApplicants(
            [...allApplicantsApiResponse.data] // Tạo bản sao trước khi sort
            .sort((a,b)=> new Date(b.createdAt || b.applicationDate) - new Date(a.createdAt || a.applicationDate))
            .slice(0, 5) // Hiển thị 5 ứng viên mới nhất
        );
      } else {
        console.warn("Applicants data is not an array or missing from API.");
        setRecentApplicants([]);
      }

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard nhà tuyển dụng:", err);
      setError("Không thể tải dữ liệu cho bảng điều khiển. Vui lòng thử lại sau.");
      // Reset các state dữ liệu khi có lỗi
      setStats({ activeJobs: 0, newApplicantsToday: 0, totalApplicants: 0, totalJobsPosted: 0, interviewsScheduled: 0, hiresThisMonth: 0 });
      setRecentJobs([]);
      setRecentApplicants([]);
    } finally {
      setLoading(false);
      console.log("[EmployerDashboardPage] Finished loading dashboard data.");
    }
  }, [user?.id, authState.isAuthenticated, authState.isLoading]); // Dependencies cho useCallback

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // useEffect gọi hàm đã được memoized bởi useCallback

  // --- PHẦN RENDER JSX GIỮ NGUYÊN NHƯ TRƯỚC ---
  // (Bao gồm if (loading), if (error), và return JSX chính)
  if (loading || authState.isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <Box sx={{p:2}}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Bảng điều khiển Nhà tuyển dụng
            </Typography>
            <Alert severity="error" sx={{ m: 2, p:2, borderRadius: '8px' }}>{error}</Alert>
            <Button onClick={loadDashboardData} variant="outlined" sx={{ml:2}}>Thử lại</Button>
        </Box>
    );
  }

  return (
    <Box sx={{p: {xs: 1.5, sm: 2, md: 3}}}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
        Bảng điều khiển
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Tin đang Tuyển" value={stats?.activeJobs} icon={<WorkOutlineIcon />} color="success" linkTo="/employer/manage-jobs" />
        </Grid>
         <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Hồ sơ mới (Hôm nay)" value={stats?.newApplicantsToday} icon={<FiberNewOutlinedIcon />} color="warning" linkTo="/employer/applicants" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Tổng số Hồ sơ" value={stats?.totalApplicants} icon={<PeopleAltOutlinedIcon />} color="info" linkTo="/employer/applicants"/>
        </Grid>
         <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard title="Xem Thống kê Chi tiết" value={<BarChartIcon/>} icon={<BarChartIcon />} color="secondary" linkTo="/employer/statistics" />
         </Grid>
      </Grid>

        <Paper sx={{ p: 2.5, mb: 4, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 600, color: 'text.primary', mb:1.5}}>Hành động nhanh</Typography>
            <Divider sx={{ mb: 2.5 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} component={RouterLink} to="/employer/post-job" sx={{borderRadius: '8px', py: 1.2, px:2}}>
                    Đăng tin tuyển dụng
                </Button>
                <Button variant="outlined" startIcon={<ListAltOutlinedIcon />} component={RouterLink} to="/employer/manage-jobs" sx={{borderRadius: '8px', py: 1.2, px:2}}>
                    Quản lý Tin đăng
                </Button>
                 <Button variant="outlined" startIcon={<PeopleAltOutlinedIcon />} component={RouterLink} to="/employer/applicants" sx={{borderRadius: '8px', py: 1.2, px:2}}>
                    Quản lý Ứng viên
                </Button>
            </Stack>
        </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2.5, height: '100%', borderRadius: '12px', boxShadow: theme.shadows[2] }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{fontWeight: 600, color: 'text.primary'}}>Tin đăng gần đây</Typography>
                <Button size="small" component={RouterLink} to="/employer/manage-jobs" endIcon={<ArrowForwardIcon/>} sx={{textTransform: 'none', fontWeight: 500}}>Xem tất cả</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentJobs.length > 0 ? (
                <List dense disablePadding>
                    {recentJobs.map(job => (
                        <ListItem
                            key={job._id || job.id}
                            disableGutters
                            secondaryAction={
                                <Chip label={job.status} color={getJobStatusColor(job.status)} size="small" sx={{fontWeight: 500, borderRadius: '6px'}} />
                            }
                            sx={{ py: 1, '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.04) }, borderRadius: '8px', mb: 0.5 }}
                            button
                            onClick={() => navigate(`/employer/jobs/${job._id || job.id}/applicants`)}
                        >
                            <ListItemIcon sx={{minWidth: 36}}><WorkOutlineIcon color="primary"/></ListItemIcon>
                            <ListItemText
                                primary={<Typography variant="subtitle1" sx={{fontWeight: 500, color: 'text.primary'}} noWrap>{job.title}</Typography>}
                                secondary={`Đăng ngày: ${formatDisplayDate(job.createdAt || job.datePosted)}, ${job.applicantCount ?? 0} ứng viên`}
                            />
                        </ListItem>
                    ))}
                </List>
             ) : (
                 <Typography variant="body2" color="text.secondary" sx={{mt: 3, textAlign: 'center', fontStyle: 'italic'}}>Chưa có tin đăng nào gần đây.</Typography>
             )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2.5, height: '100%', borderRadius: '12px', boxShadow: theme.shadows[2] }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{fontWeight: 600, color: 'text.primary'}}>Ứng viên mới nhất</Typography>
                 <Button size="small" component={RouterLink} to="/employer/applicants" endIcon={<ArrowForwardIcon/>} sx={{textTransform: 'none', fontWeight: 500}}>Xem tất cả</Button>
            </Box>
             <Divider sx={{ mb: 2 }} />
             {recentApplicants.length > 0 ? (
                <List dense disablePadding>
                    {recentApplicants.map(app => (
                        <ListItem key={app._id || app.applicationId} disableGutters sx={{ py: 1, '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.04) }, borderRadius: '8px', mb: 0.5 }}
                            button
                            onClick={() => navigate(`/employer/jobs/${app.jobId?._id || app.jobId}/applicants`)} // Nên có appId để highlight
                        >
                             <ListItemIcon sx={{minWidth: 36}}>
                                <Avatar sx={{width: 32, height: 32, bgcolor: alpha(theme.palette.info.main, 0.15), color: 'info.dark'}}>
                                    {app.candidateId?.fullName ? app.candidateId.fullName.charAt(0).toUpperCase() : <PeopleAltOutlinedIcon fontSize="small"/>}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography variant="subtitle1" sx={{fontWeight: 500, color: 'text.primary'}} noWrap>{app.candidateId?.fullName || 'Ẩn danh'}</Typography>}
                                secondary={`Ứng tuyển vào "${app.jobId?.title || '...'}" ngày ${formatDisplayDate(app.createdAt || app.applicationDate)}`}
                            />
                             <Chip label={app.status} color={getJobStatusColor(app.status)} size="small" sx={{fontWeight: 500, borderRadius: '6px', ml:1}} />
                        </ListItem>
                    ))}
                </List>
             ) : (
                  <Typography variant="body2" color="text.secondary" sx={{mt: 3, textAlign: 'center', fontStyle: 'italic'}}>Chưa có ứng viên nào gần đây.</Typography>
             )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployerDashboardPage;

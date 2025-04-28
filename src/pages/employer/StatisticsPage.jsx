// src/pages/employer/StatisticsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchEmployerStats } from '../../data/mockJobs'; // Đảm bảo đúng đường dẫn

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar'; // Dùng Avatar để chứa Icon
import Stack from '@mui/material/Stack';

// Import Icons cho các thẻ thống kê
import WorkIcon from '@mui/icons-material/Work'; // Tổng tin đăng
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; // Tin đang active
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // Tổng ứng viên
import FiberNewIcon from '@mui/icons-material/FiberNew'; // Ứng viên mới
import EventBusyIcon from '@mui/icons-material/EventBusy'; // Lịch hẹn (ví dụ)
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Tuyển dụng thành công

// Component nhỏ cho từng thẻ thống kê
function StatCard({ title, value, icon, color = 'primary' }) {
    return (
        <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {value ?? '-'} {/* Hiển thị '-' nếu value là null/undefined */}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
        </Paper>
    );
}

function StatisticsPage() {
  const { authState } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!authState.user?.id) {
          setError("Không thể xác định nhà tuyển dụng.");
          setLoading(false);
          return;
      }
      setLoading(true); setError(null);
      try {
        const data = await fetchEmployerStats(authState.user.id);
        if (data) { setStats(data); }
        else { setError("Không tải được dữ liệu thống kê."); setStats(null); }
      } catch (err) { console.error("Lỗi tải thống kê:", err); setError("Lỗi kết nối khi tải thống kê."); setStats(null); }
      finally { setLoading(false); }
    };
    loadStats();
  }, [authState.user?.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error" sx={{m:2}}>{error}</Alert>;
  if (!stats) return <Typography sx={{m:2}}>Không có dữ liệu thống kê.</Typography>;

  return (
    <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Thống kê & Báo cáo
        </Typography>

        {/* Khu vực hiển thị các thẻ số liệu nhanh */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}> {/* Chia layout, ví dụ 6 cột trên lg */}
                <StatCard title="Tổng tin đăng" value={stats.totalJobsPosted} icon={<WorkIcon />} color="primary" />
            </Grid>
             <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard title="Tin đang Active" value={stats.activeJobs} icon={<WorkOutlineIcon />} color="success" />
            </Grid>
             <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard title="Tổng hồ sơ" value={stats.totalApplicants} icon={<PeopleAltIcon />} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard title="Hồ sơ mới (hôm nay)" value={stats.newApplicantsToday} icon={<FiberNewIcon />} color="warning" />
            </Grid>
             <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard title="Lịch hẹn" value={stats.interviewsScheduled} icon={<EventBusyIcon />} color="secondary" />
            </Grid>
             <Grid item xs={12} sm={6} md={4} lg={2}>
                <StatCard title="Tuyển được (tháng này)" value={stats.hiresThisMonth} icon={<CheckCircleOutlineIcon />} color="success" />
            </Grid>
        </Grid>

        {/* Khu vực Placeholder cho Biểu đồ */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Biểu đồ (Sẽ cập nhật sau)
        </Typography>
         <Grid container spacing={3}>
             <Grid item xs={12} md={6}>
                 <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                    <Typography variant='subtitle1' color='text.secondary'>Biểu đồ Tỉ lệ Ứng viên theo Trạng thái</Typography>
                    <Typography variant='caption'>(Placeholder for Chart)</Typography>
                 </Paper>
             </Grid>
             <Grid item xs={12} md={6}>
                 <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                     <Typography variant='subtitle1' color='text.secondary'>Biểu đồ Nguồn ứng viên</Typography>
                     <Typography variant='caption'>(Placeholder for Chart)</Typography>
                 </Paper>
             </Grid>
         </Grid>

    </Box>
  );
}

// Thêm PropTypes cho StatCard nếu muốn
// import PropTypes from 'prop-types';
// StatCard.propTypes = { ... }

export default StatisticsPage;
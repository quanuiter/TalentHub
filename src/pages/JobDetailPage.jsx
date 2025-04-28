// src/pages/JobDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom'; // Import Link
import { fetchJobById } from '../data/mockJobs'; // Hàm lấy dữ liệu giả
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ApplyJobDialog from '../components/candidate/ApplyJobDialog'; // Import dialog mới
import { useAuth } from '../contexts/AuthContext'; // Import useAuth để kiểm tra đăng nhập
import { useNavigate } from 'react-router-dom'; // Để điều hướng
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert'; // Để hiển thị lỗi
import Snackbar from '@mui/material/Snackbar'; // Để hiển thị snackbar thông báo
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business'; // Icon công ty
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Icon ngày đăng
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; // Icon loại hình cv
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon cho requirements/benefits

function JobDetailPage() {
  // Lấy jobId từ URL
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate(); // Lấy navigate 
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleOpenApplyDialog = () => {
    if (!authState.isAuthenticated) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang login và yêu cầu redirect về trang này sau khi login
        navigate(`/login?redirect=/jobs/${jobId}`);
    } else if (authState.user?.role !== 'candidate') {
         // Nếu là employer hoặc role khác, thông báo không thể ứng tuyển
         setSnackbar({ open: true, message: 'Chỉ ứng viên mới có thể ứng tuyển.', severity: 'warning' });
    }
     else {
         // Nếu là candidate đã đăng nhập, mở dialog
        setOpenApplyDialog(true);
    }
  };

  const handleCloseApplyDialog = () => {
    setOpenApplyDialog(false);
    // Có thể thêm logic refetch trạng thái ứng tuyển ở đây nếu cần
    // Ví dụ: kiểm tra xem user đã ứng tuyển job này chưa để disable nút
  };

   const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  useEffect(() => {
    const loadJobDetails = async () => {
      setLoading(true);
      setError(null); // Reset lỗi trước khi fetch
      try {
        const fetchedJob = await fetchJobById(jobId);
        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          setError(`Không tìm thấy công việc với ID: ${jobId}`);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết công việc:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu công việc.");
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId]); // Chạy lại useEffect khi jobId thay đổi

  // --- Render Logic ---

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to="/jobs" sx={{ mt: 2 }}>
          Quay lại danh sách việc làm
        </Button>
      </Container>
    );
  }

  // Nếu không loading, không lỗi, nhưng không có job (trường hợp hiếm)
  if (!job) {
     return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Không tìm thấy thông tin công việc.</Typography>
         <Button component={RouterLink} to="/jobs" sx={{ mt: 2 }}>
          Quay lại danh sách việc làm
        </Button>
      </Container>
     )
  }

  // Render chi tiết công việc nếu có dữ liệu job
  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}> {/* Giảm mt một chút */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}> {/* p: padding, responsive */}
        {/* Header: Title, Company, Apply Button */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
              <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="h6">{job.companyName}</Typography>
            </Box>
          </Grid>
            <Grid item xs={12} md={4}sx={{display: 'flex',justifyContent: 'flex-end', gap: 1, mt: { xs: 2, md: 0 }, ml: 'auto'}}>
            <Button variant="contained" color="secondary" onClick={handleOpenApplyDialog}>Ứng tuyển ngay</Button>
            <Button variant="outlined">Lưu tin</Button>
            </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Thông tin cơ bản: Location, Salary, Type, Date Posted */}
        <Grid container spacing={2} sx={{ mb: 3, color: 'text.secondary' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{job.location}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{job.salary || 'Thương lượng'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="body1">{job.type}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
             <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1 }} />
              <Typography variant="body1">Đăng ngày: {new Date(job.datePosted).toLocaleDateString('vi-VN')}</Typography> {/* Format lại ngày */}
            </Box>
          </Grid>
        </Grid>


        {/* Mô tả công việc */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Mô tả công việc</Typography>
          {/* Giả sử description là một chuỗi, có thể chứa xuống dòng */}
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
             {job.description}
          </Typography>
        </Box>

        {/* Yêu cầu ứng viên */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Yêu cầu ứng viên</Typography>
          {job.requirements && job.requirements.length > 0 ? (
            job.requirements.map((req, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                 <CheckCircleOutlineIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }}/>
                 <Typography variant="body1">{req}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">Chưa cập nhật.</Typography>
          )}
        </Box>

        {/* Quyền lợi */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Quyền lợi</Typography>
           {job.benefits && job.benefits.length > 0 ? (
            job.benefits.map((benefit, index) => (
               <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                 <CheckCircleOutlineIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }}/>
                 <Typography variant="body1">{benefit}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">Chưa cập nhật.</Typography>
          )}
        </Box>

        <Divider sx={{ mb: 3 }}/>

       {/* THÊM DIALOG VÀO ĐÂY */}
    {job && ( // Chỉ render dialog khi có thông tin job
       <ApplyJobDialog
          open={openApplyDialog}
          onClose={handleCloseApplyDialog}
          jobTitle={job.title}
          jobId={job.id}
       />
    )}

     {/* THÊM SNACKBAR */}
     <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
    </Snackbar>

      </Paper>
    </Container>
  );
}

export default JobDetailPage;
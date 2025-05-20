// src/pages/JobDetailPage.jsx
"use client" // Giữ lại nếu bạn có lý do cụ thể

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ApplyJobDialog from '../components/candidate/ApplyJobDialog';
import { useAuth } from '../contexts/AuthContext';

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Link from '@mui/material/Link'; // MUI Link
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar'; // For company logo
import { useTheme, alpha } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined'; // Icon cho nút đã lưu

// Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'; // Icon công ty tổng quát
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined'; // Icon Lưu tin
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'; // Icon Ứng tuyển
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ApartmentIcon from '@mui/icons-material/Apartment'; // Icon cho company name
import EventBusyIcon from '@mui/icons-material/EventBusy'; // Icon cho hạn nộp hồ sơ
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CardMembershipIcon from '@mui/icons-material/CardMembership'; // Icon cho quyền lợi
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'; // Icon cho kỹ năng yêu cầu
import SendIcon from '@mui/icons-material/Send'; // Icon cho nút Ứng tuyển

function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState, handleToggleSaveJob } = useAuth();
  const [isSavingJob, setIsSavingJob] = useState(false); 
  const navigate = useNavigate();
  const theme = useTheme();
  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const isJobCurrentlySaved = authState.isAuthenticated && authState.user?.role === 'candidate' && Array.isArray(authState.savedJobs)
    ? authState.savedJobs.includes(jobId)
    : false;

  useEffect(() => {
    const loadJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getJobDetailsApi(jobId);
        // API getJobDetailsApi nên populate companyId thành object { _id, name, logoUrl }
        const fetchedJob = response.data?.data || response.data; // Handle if data is nested or direct

        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          setError(`Không tìm thấy công việc với ID: ${jobId}`);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết công việc:", err);
        setError(err.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu công việc.");
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId]);
  const onToggleSaveJob = async () => {
    if (!authState.isAuthenticated || authState.user?.role !== 'candidate') {
        setSnackbar({ open: true, message: 'Vui lòng đăng nhập với tư cách ứng viên để lưu công việc.', severity: 'info' });
        if (!authState.isAuthenticated) navigate(`/login?redirect=/jobs/${jobId}`);
        return;
    }
    if (!job || !job._id) return;

    setIsSavingJob(true);
    setSnackbar({ ...snackbar, open: false });
    try {
        const result = await handleToggleSaveJob(job._id); // Gọi hàm từ AuthContext
        setSnackbar({ open: true, message: result.message, severity: 'success' });
        // AuthContext sẽ tự cập nhật authState.savedJobs, component này sẽ re-render
    } catch (err) {
        setSnackbar({ open: true, message: err.response?.data?.message || err.message || 'Lỗi! Không thể thực hiện thao tác.', severity: 'error' });
    } finally {
        setIsSavingJob(false);
    }
  };
  const handleOpenApplyDialog = () => {
    if (!authState.isAuthenticated) {
      navigate(`/login?redirect=/jobs/${jobId}`);
    } else if (authState.user?.role !== 'candidate') {
      setSnackbar({ open: true, message: 'Chỉ ứng viên mới có thể ứng tuyển vị trí này.', severity: 'warning' });
    } else {
      setOpenApplyDialog(true);
    }
  };

  const handleCloseApplyDialog = (applicationSuccess) => {
    setOpenApplyDialog(false);
    if (applicationSuccess) {
        setSnackbar({ open: true, message: 'Nộp hồ sơ ứng tuyển thành công!', severity: 'success' });
        // Optionally, update UI to show "Đã ứng tuyển"
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Placeholder for save job functionality
  const handleSaveJob = () => {
    setSnackbar({ open: true, message: 'Chức năng lưu tin sẽ được cập nhật sau!', severity: 'info' });
  };

  const renderListSection = (title, itemsString, icon) => {
    if (!itemsString || typeof itemsString !== 'string' || itemsString.trim().length === 0) {
      return (
        <Box sx={{ mb: 3.5 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            {icon && React.cloneElement(icon, { color: "primary", sx: { fontSize: '1.6rem' } })}
            <Typography variant="h6" fontWeight={500} color="text.primary">{title}</Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>Chưa cập nhật thông tin.</Typography>
        </Box>
      );
    }
    const itemsArray = itemsString.split('\n').map(line => line.trim()).filter(line => line !== '');
    return (
      <Box sx={{ mb: 3.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
           {icon && React.cloneElement(icon, { color: "primary", sx: { fontSize: '1.6rem' } })}
           <Typography variant="h6" fontWeight={500} color="text.primary">{title}</Typography>
        </Stack>
        <Stack spacing={1}>
          {itemsArray.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: '1.25rem', mt: '3px' }} />
              <Typography variant="body1" color="text.secondary" sx={{lineHeight: 1.6}}>{item}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };


  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{mb:2, borderRadius: '8px', p:2}}>{error}</Alert>
        <Button component={RouterLink} to="/jobs" variant="outlined" startIcon={<ArrowBackIcon />}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">Không tìm thấy thông tin công việc.</Typography>
        <Button component={RouterLink} to="/jobs" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
          Quay lại danh sách
        </Button>
      </Container>
    )
  }

  const companyName = job.companyId?.name || job.companyName || 'Công ty chưa cập nhật';
  const companyLogo = job.companyId?.logoUrl || null; // Assuming logoUrl is available
  const companyPageLink = job.companyId?._id ? `/companies/${job.companyId._id}` : null;


  return (
    <Container maxWidth="lg" sx={{ py: {xs: 2, md: 4} }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm:3, md: 4 }, borderRadius: '16px', boxShadow: theme.shadows[2] }}>
        {/* Header Section */}
        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" fontWeight="bold" color="primary.dark" sx={{fontSize: {xs: '2rem', sm: '2.5rem', md: '2.8rem'}}}>
              {job.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={1} mb={2}>
                <ApartmentIcon color="action" fontSize="small"/>
                {companyPageLink ? (
                    <Link component={RouterLink} to={companyPageLink} underline="hover" variant="h6" color="text.secondary" sx={{fontWeight: 500, '&:hover': {color: 'primary.main'}}}>
                        {companyName}
                    </Link>
                ) : (
                    <Typography variant="h6" color="text.secondary" sx={{fontWeight: 500}}>{companyName}</Typography>
                )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.grey[500], 0.3) }} />

        {/* Job Info Bar */}
        <Paper elevation={0} sx={{p:2, mb:3.5, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.light, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`}}>
            <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3} width={'100%'}>
                <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOnOutlinedIcon color="action" />
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Địa điểm</Typography>
                    <Typography variant="body1" fontWeight="500">{job.location}</Typography>
                </Box>
                </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3} width={'20%'}>
                <Stack direction="row" alignItems="center" spacing={1}>
                <AttachMoneyOutlinedIcon color="action" />
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Mức lương</Typography>
                    <Typography variant="body1" fontWeight="500">{job.salary || 'Thương lượng'}</Typography>
                </Box>
                </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3} width={'24%'}>
                <Stack direction="row" alignItems="center" spacing={1}>
                <WorkOutlineOutlinedIcon color="action" />
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Loại hình</Typography>
                    <Typography variant="body1" fontWeight="500">{job.type}</Typography>
                </Box>
                </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3} width={'24%'}>
                <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarTodayOutlinedIcon color="action" />
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Ngày đăng</Typography>
                    <Typography variant="body1" fontWeight="500">{job.datePosted ? new Date(job.datePosted).toLocaleDateString('vi-VN') : 'N/A'}</Typography>
                </Box>
                </Stack>
            </Grid>
            {job.applicationDeadline && (
                 <Grid item xs={12} sm={6} md={3} width={'24%'}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                    <EventBusyIcon color="error" /> {/* Icon for deadline */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Hạn nộp hồ sơ</Typography>
                        <Typography variant="body1" fontWeight="500" color="error.dark">{new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}</Typography>
                    </Box>
                    </Stack>
                </Grid>
            )}
            </Grid>
        </Paper>

        {/* Main Content Sections */}
        <Grid container spacing={4} >
            <Grid item xs={12} md={companyLogo || (job.companyId && job.companyId.name) ? 8 : 12}> {/* Adjust width if company info is shown */}
                {renderListSection("Mô tả công việc", job.description, <DescriptionOutlinedIcon />)}
                {renderListSection("Yêu cầu ứng viên", job.requirements, <CheckCircleOutlineIcon />)}
                {renderListSection("Quyền lợi", job.benefits, <CardMembershipIcon />)}

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                <Box sx={{ mb: 3.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                        <BuildOutlinedIcon color="primary" sx={{ fontSize: '1.6rem' }} />
                        <Typography variant="h6" fontWeight={500} color="text.primary">Kỹ năng yêu cầu</Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.requiredSkills.map((skill, index) => (
                        <Chip key={index} label={skill} variant="outlined" color="primary" sx={{borderRadius: '8px', fontWeight: 500}}/>
                    ))}
                    </Box>
                </Box>
                )}
            </Grid>

            {/* Company Info Sidebar (Optional) */}

        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box 
  sx={{
    display: 'flex',
    justifyContent: { xs: 'center', sm: 'flex-end' }, // căn giữa trên màn nhỏ, phải trên màn lớn
    gap: 2,
    flexWrap: 'wrap'
  }}
>
  <Button
    variant="contained"
    color="primary"
    size="large"
    startIcon={<SendOutlinedIcon />}
    onClick={handleOpenApplyDialog}
    sx={{ borderRadius: '8px', fontWeight: 600, px: 3, py: 1.2 }}
  >
    Ứng tuyển ngay
  </Button>
  {authState.user?.role === 'candidate' && (
                <Button
                    variant={isJobCurrentlySaved ? "contained" : "outlined"}
                    color="secondary"
                    size="large"
                    startIcon={
                        isSavingJob ? <CircularProgress size={20} color="inherit"/> :
                        isJobCurrentlySaved ? <BookmarkAddedOutlinedIcon /> : <BookmarkBorderOutlinedIcon />
                    }
                    onClick={onToggleSaveJob}
                    disabled={isSavingJob}
                    sx={{ borderRadius: '8px', fontWeight: 500, px:3, py:1.2 }}
                >
                    {isSavingJob ? (isJobCurrentlySaved ? "Đang bỏ lưu..." : "Đang lưu...") : (isJobCurrentlySaved ? 'Đã lưu tin' : 'Lưu tin')}
                </Button>
            )}
</Box>


        {job && (
            <ApplyJobDialog
                open={openApplyDialog}
                onClose={handleCloseApplyDialog}
                jobTitle={job.title}
                jobId={job._id || job.id} // Use _id from MongoDB
            />
        )}

        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '8px', boxShadow: theme.shadows[4] }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default JobDetailPage;

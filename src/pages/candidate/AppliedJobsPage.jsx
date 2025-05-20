// src/pages/candidate/AppliedJobsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link'; // MUI Link
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button'; // For "Find Jobs" button
import { useTheme, alpha } from '@mui/material/styles'; // Import useTheme and alpha

// Import Icons
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'; // For empty state
import Snackbar from '@mui/material/Snackbar';
import snackbar from '@mui/material/Snackbar';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined'; // Alternative for empty state


// Hàm helper để lấy màu và kiểu cho Chip trạng thái
const getStatusChipProps = (status, theme) => {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'mời phỏng vấn':
    case 'mời làm bài test':
    case 'trúng tuyển':
      return { color: 'success', variant: 'filled', sx: { color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main } };
    case 'đang xét duyệt':
      return { color: 'warning', variant: 'outlined', sx: { borderColor: theme.palette.warning.main, color: theme.palette.warning.dark } };
    case 'từ chối':
      return { color: 'error', variant: 'outlined', sx: { borderColor: theme.palette.error.main, color: theme.palette.error.dark } };
    case 'đã nộp':
    default:
      return { color: 'info', variant: 'outlined', sx: { borderColor: theme.palette.info.main, color: theme.palette.info.dark } };
  }
};

const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    try {
        return new Date(isoDateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return 'Ngày không hợp lệ';
    }
};


function AppliedJobsPage() {
  const { authState } = useAuth();
  const theme = useTheme(); // Get theme object
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppliedJobs = useCallback(async () => {
    if (!authState.user?.id || !authState.isAuthenticated || authState.isLoading) {
        setLoading(false);
        if (!authState.isAuthenticated && !authState.isLoading) {
            setError("Vui lòng đăng nhập để xem các việc làm đã ứng tuyển.");
        }
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCandidateApplicationsApi();
      if (response && Array.isArray(response.data)) {
           // Sắp xếp theo ngày ứng tuyển mới nhất (createdAt của Application)
           response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
           setAppliedJobs(response.data);
      } else {
        console.error("Applied jobs API response is not an array or data is missing:", response);
        setAppliedJobs([]);
        setError("Dữ liệu việc làm đã ứng tuyển trả về không hợp lệ.");
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách việc làm đã ứng tuyển:", err);
      const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách việc làm đã ứng tuyển.";
      setError(errorMsg);
      setAppliedJobs([]);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id, authState.isAuthenticated, authState.isLoading]);

  useEffect(() => {
    loadAppliedJobs();
  }, [loadAppliedJobs]);

  if (loading || authState.isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <Box sx={{p:2}}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Việc làm đã ứng tuyển
            </Typography>
            <Alert severity="error" sx={{ mb: 2, p:2, borderRadius: '8px' }}>{error}</Alert>
            <Button onClick={loadAppliedJobs} variant="outlined">Thử lại</Button>
        </Box>
    );
  }

  return (
    <Box sx={{p: {xs: 1.5, sm: 2, md: 3}}}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
        Việc làm đã ứng tuyển
      </Typography>

      {appliedJobs.length > 0 ? (
        <Paper sx={{ borderRadius: '12px', boxShadow: theme.shadows[2], overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="Applied jobs table">
              <TableHead sx={{ bgcolor: alpha(theme.palette.grey[200], 0.4) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5 }}>Chức danh</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5 }}>Công ty</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary', py: 1.5 }}>Ngày ứng tuyển</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary', py: 1.5 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appliedJobs.map((app) => {
                    const jobInfo = app.jobId || {}; // jobId is populated from backend
                    const appKey = app._id || app.applicationId;
                    const statusProps = getStatusChipProps(app.status, theme);

                    return (
                        <TableRow
                            key={appKey}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {jobInfo && jobInfo._id ? (
                                    <Link component={RouterLink} to={`/jobs/${jobInfo._id}`} underline="hover" sx={{fontWeight: 500, color: 'primary.main'}}>
                                        {jobInfo.title || 'N/A'}
                                    </Link>
                                ) : (
                                    <Typography variant="body1" color="text.secondary">{jobInfo.title || 'Thông tin việc làm không có'}</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                    {jobInfo.companyName || 'N/A'}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="body2" color="text.secondary">
                                    {formatDisplayDate(app.createdAt)}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={app.status}
                                    color={statusProps.color}
                                    variant={statusProps.variant}
                                    size="small"
                                    sx={{fontWeight: 500, borderRadius: '8px', minWidth: '110px', ...statusProps.sx}}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{p: {xs:3, sm:5}, textAlign:'center', mt:2, borderRadius: '16px', background: alpha(theme.palette.grey[100], 0.5)}}>
            <FindInPageOutlinedIcon sx={{fontSize: 72, color: 'text.disabled', mb: 2.5, opacity: 0.6}}/>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{fontWeight: 500}}>
            Bạn chưa ứng tuyển vào vị trí nào
            </Typography>
            <Typography color="text.secondary" sx={{mb: 3, maxWidth: 400, mx: 'auto'}}>
                Hãy bắt đầu hành trình tìm kiếm việc làm mơ ước của bạn ngay hôm nay!
            </Typography>
            <Button component={RouterLink} to="/jobs" variant="contained" size="large" sx={{borderRadius: '8px', px:3, py: 1.2}}>
                Tìm việc làm ngay
            </Button>
        </Paper>
      )}
       <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default AppliedJobsPage;

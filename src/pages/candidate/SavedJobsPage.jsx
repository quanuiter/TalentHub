// src/pages/candidate/SavedJobsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import JobCard from '../../components/jobs/JobCard'; // Tái sử dụng JobCard
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog'; // Để xác nhận bỏ lưu

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useTheme, alpha } from '@mui/material/styles';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined'; // Icon cho nút bỏ lưu
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import Divider from '@mui/material/Divider';


function SavedJobsPage() {
  const { authState, handleToggleSaveJob } = useAuth(); // Lấy hàm toggle từ context
  const navigate = useNavigate();
  const theme = useTheme();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // State cho dialog xác nhận bỏ lưu
  const [showUnsaveConfirm, setShowUnsaveConfirm] = useState(false);
  const [unsavingJobId, setUnsavingJobId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);


  const loadSavedJobs = useCallback(async () => {
    if (!authState.isAuthenticated || authState.isLoading) {
        if (!authState.isAuthenticated && !authState.isLoading) setError("Vui lòng đăng nhập để xem việc làm đã lưu.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getSavedJobsApi();
      if (response && response.data && Array.isArray(response.data.data)) {
        setSavedJobs(response.data.data); // API trả về {status, data: [jobs]}
      } else {
        console.warn("Saved jobs API response is not in expected format:", response.data);
        setSavedJobs([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách việc làm đã lưu:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách việc làm đã lưu.");
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated, authState.isLoading]);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  const handleOpenUnsaveDialog = (jobId) => {
    setUnsavingJobId(jobId);
    setShowUnsaveConfirm(true);
  };

  const handleCloseUnsaveDialog = () => {
    setShowUnsaveConfirm(false);
    setUnsavingJobId(null);
  };

  const handleConfirmUnsave = async () => {
    if (!unsavingJobId) return;
    setActionLoading(true);
    try {
        await handleToggleSaveJob(unsavingJobId); // Gọi hàm từ context
        setSavedJobs(prevJobs => prevJobs.filter(job => job._id !== unsavingJobId));
        setSnackbar({ open: true, message: 'Đã bỏ lưu công việc thành công!', severity: 'success' });
    } catch (err) {
        setSnackbar({ open: true, message: err.message || 'Lỗi khi bỏ lưu công việc.', severity: 'error' });
    } finally {
        setActionLoading(false);
        handleCloseUnsaveDialog();
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };


  if (loading || authState.isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <Box sx={{p:2, textAlign: 'center'}}>
            <Alert severity="error" sx={{mb:2, borderRadius: '8px'}}>{error}</Alert>
            <Button onClick={loadSavedJobs} variant="outlined">Thử lại</Button>
        </Box>
    );
  }
  if (!authState.isAuthenticated) {
     return (
        <Box sx={{p:3, textAlign: 'center'}}>
            <Alert severity="warning" sx={{mb:2, borderRadius: '8px'}}>Vui lòng đăng nhập để xem việc làm đã lưu.</Alert>
            <Button component={RouterLink} to="/login" variant="contained" sx={{borderRadius: '8px'}}>Đăng nhập</Button>
        </Box>
     );
  }


  return (
    <Box sx={{p: {xs: 1.5, sm: 2, md: 3}}}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
        Việc làm đã lưu
      </Typography>

      {savedJobs.length > 0 ? (
        <Grid container spacing={3}>
          {savedJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={job._id}>
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', boxShadow: theme.shadows[2], '&:hover': { boxShadow: theme.shadows[5]} }}>
                <JobCard job={job} sx={{flexGrow: 1}} /> {/* JobCard cần có prop sx để nhận style */}
                <Divider />
                <Box sx={{p:1.5, textAlign: 'right'}}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<BookmarkRemoveOutlinedIcon />}
                        onClick={() => handleOpenUnsaveDialog(job._id)}
                        sx={{borderRadius: '8px', textTransform: 'none'}}
                    >
                        Bỏ lưu
                    </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{p: {xs:3, sm:5}, textAlign:'center', mt:2, borderRadius: '16px', background: alpha(theme.palette.grey[100], 0.5)}}>
            <FindInPageOutlinedIcon sx={{fontSize: 72, color: 'text.disabled', mb: 2.5, opacity: 0.6}}/>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{fontWeight: 500}}>
            Bạn chưa lưu việc làm nào
            </Typography>
            <Typography color="text.secondary" sx={{mb: 3, maxWidth: 400, mx: 'auto'}}>
                Hãy khám phá và lưu lại những cơ hội việc làm bạn quan tâm!
            </Typography>
            <Button component={RouterLink} to="/jobs" variant="contained" size="large" sx={{borderRadius: '8px', px:3, py: 1.2}}>
                Tìm việc làm ngay
            </Button>
        </Paper>
      )}

      <ConfirmDialog
        open={showUnsaveConfirm}
        onClose={handleCloseUnsaveDialog}
        onConfirm={handleConfirmUnsave}
        title="Xác nhận bỏ lưu"
        contentText={`Bạn có chắc chắn muốn bỏ lưu công việc "${savedJobs.find(j => j._id === unsavingJobId)?.title || 'này'}" không?`}
        confirmText="Bỏ lưu"
        isActionLoading={actionLoading}
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default SavedJobsPage;

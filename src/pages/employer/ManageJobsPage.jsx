// src/pages/employer/ManageJobsPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles'; // Added useTheme and alpha

// Import Icons
import EditIcon from '@mui/icons-material/EditOutlined'; // Using Outlined versions
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Changed AddIcon
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'; // Icon for no jobs

// Helper lấy màu Chip cho trạng thái tin đăng
const getJobStatusColor = (status) => {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'active': return 'success';
    case 'closed': return 'warning'; // Changed to warning for better visibility
    case 'expired': return 'default';
    case 'draft': return 'info'; // Changed to info
    default: return 'secondary';
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

function ManageJobsPage() {
  const { authState } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const theme = useTheme(); // Initialize useTheme

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const loadJobs = useCallback(async () => {
    if (!authState.user?.id || !authState.isAuthenticated || authState.isLoading) {
        setLoading(false); // Stop loading if auth is not ready
        if (!authState.isAuthenticated && !authState.isLoading) {
            setError("Vui lòng đăng nhập để quản lý tin đăng.");
        }
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getEmployerJobsApi();
      if (response && Array.isArray(response.data)) {
           response.data.sort((a, b) => new Date(b.createdAt || b.datePosted) - new Date(a.createdAt || a.datePosted));
           setJobs(response.data);
      } else {
           console.error("Employer jobs API response is not an array or data is missing:", response);
           setJobs([]);
           setError("Dữ liệu tin đăng trả về không hợp lệ hoặc không có.");
      }
    } catch (err) {
      console.error("[ManageJobsPage] Error loading employer jobs:", err);
      const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách tin đăng.";
      setError(errorMsg);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id, authState.isAuthenticated, authState.isLoading]); // Added dependencies

  useEffect(() => {
    loadJobs();
  }, [loadJobs]); // useEffect now depends on the memoized loadJobs

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    if (actionLoading.id) return;
    const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    setActionLoading({type: 'toggle', id: jobId});
    setSnackbar({ ...snackbar, open: false });
    try {
        const response = await apiService.updateJobApi(jobId, { status: newStatus });
        // Backend should return the updated job with populated fields if needed by other parts of UI
        // For this page, we only need to update the status locally or refetch.
        setJobs(prevJobs => prevJobs.map(job =>
            (job._id || job.id) === jobId ? { ...job, status: newStatus } : job
        ));
        setSnackbar({ open: true, message: response.data?.message || `Đã ${newStatus === 'Active' ? 'mở lại' : 'đóng'} tin!`, severity: 'success' });
    } catch(err) {
         console.error("Lỗi khi đổi trạng thái:", err);
         const errorMsg = err.response?.data?.message || 'Lỗi! Không thể đổi trạng thái tin.';
         setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
        setActionLoading({type: null, id: null});
    }
  };

  const handleDeleteClick = (jobId) => {
      setDeletingJobId(jobId);
      setShowDeleteConfirm(true);
  };

   const handleCloseDeleteDialog = () => {
      setShowDeleteConfirm(false);
      setDeletingJobId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingJobId || actionLoading.id) return;
    const jobIdToDelete = deletingJobId;
    handleCloseDeleteDialog(); // Close dialog first
    setActionLoading({type: 'delete', id: jobIdToDelete});
    setSnackbar({ ...snackbar, open: false });
    try {
        const response = await apiService.deleteJobApi(jobIdToDelete);
        setJobs(prevJobs => prevJobs.filter(job => (job._id || job.id) !== jobIdToDelete));
        setSnackbar({ open: true, message: response.data?.message || 'Đã xóa tin tuyển dụng thành công!', severity: 'success' });
    } catch(err) {
         console.error("Lỗi khi xóa tin:", err);
         const errorMsg = err.response?.data?.message || err.message || 'Lỗi! Không thể xóa tin tuyển dụng.';
         setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
         setActionLoading({type: null, id: null});
    }
  };

  if (loading || authState.isLoading) { // Check authState.isLoading as well
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <Box sx={{p:2}}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Quản lý tin đăng</Typography>
            <Alert severity="error" sx={{ mb: 2, p:2, borderRadius: '8px' }}>{error}</Alert>
            <Button onClick={loadJobs} variant="outlined">Thử lại</Button>
        </Box>
    );
  }

  return (
    <Box sx={{p: {xs: 1.5, sm: 2, md: 3}}}> {/* Responsive padding */}
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                Quản lý tin đăng
            </Typography>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                component={RouterLink}
                to="/employer/post-job"
                sx={{ borderRadius: '8px', fontWeight: 600, px: 2.5, py: 1.2 }}
            >
                Đăng tin mới
            </Button>
       </Box>

        <Paper sx={{ borderRadius: '12px', boxShadow: theme.shadows[3], overflow: 'hidden' }}>
            <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-label="Manage jobs table">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.light, 0.1) }}>
                <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.dark', py: 1.5 }}>Chức danh</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.dark', py: 1.5 }}>Ngày đăng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.dark', py: 1.5 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.dark', py: 1.5 }}>Ứng viên</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.dark', py: 1.5, width: '220px' }}>Hành động</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {jobs.length > 0 ? (
                    jobs.map((job) => {
                    const currentJobId = job._id || job.id; // Use _id from MongoDB
                    const isActionLoading = actionLoading.id === currentJobId;

                    return (
                        <TableRow key={currentJobId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                            <Link component={RouterLink} to={`/employer/jobs/${currentJobId}/applicants`} underline="hover" sx={{fontWeight: 500, color: 'text.primary'}}>
                                {job.title || 'Chưa có tiêu đề'}
                            </Link>
                            <Typography variant="caption" display="block" color="text.secondary">
                                ID: {currentJobId}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            {formatDisplayDate(job.createdAt || job.datePosted)}
                            {job.applicationDeadline && (
                            <Typography variant="caption" display="block" color="text.secondary">
                                Hạn: {formatDisplayDate(job.applicationDeadline)}
                            </Typography>
                            )}
                        </TableCell>
                        <TableCell align="center">
                            <Chip
                            label={job.status || 'N/A'}
                            color={getJobStatusColor(job.status)}
                            size="small"
                            sx={{fontWeight: 500, borderRadius: '8px', px: 1}}
                            />
                        </TableCell>
                        <TableCell align="center">
                            <Link component={RouterLink} to={`/employer/jobs/${currentJobId}/applicants`} underline="hover" sx={{fontWeight: 500}}>
                            {job.applicantCount ?? 0}
                            </Link>
                        </TableCell>
                        <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Sửa tin">
                                <span>
                                <IconButton size="small" component={RouterLink} to={`/employer/edit-job/${currentJobId}`} disabled={isActionLoading}>
                                    <EditIcon fontSize='small'/>
                                </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Xem ứng viên">
                            <span>
                                <IconButton size="small" component={RouterLink} to={`/employer/jobs/${currentJobId}/applicants`} disabled={isActionLoading}>
                                    <VisibilityOutlinedIcon fontSize='small'/>
                                </IconButton>
                            </span>
                            </Tooltip>
                            <Tooltip title={job.status === 'Active' ? 'Đóng tin' : 'Mở lại tin'}>
                                <span>
                                <IconButton
                                    size="small"
                                    onClick={() => handleToggleStatus(currentJobId, job.status)}
                                    disabled={isActionLoading || job.status === 'Draft'} // Cannot toggle Draft status directly
                                    color={job.status === 'Active' ? 'warning' : 'success'}
                                >
                                    {actionLoading.type === 'toggle' && isActionLoading ? <CircularProgress size={18} color="inherit"/> : (job.status === 'Active' ? <ToggleOffOutlinedIcon fontSize='small'/> : <ToggleOnOutlinedIcon fontSize='small'/>)}
                                </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Xóa tin">
                                <span>
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(currentJobId)} disabled={isActionLoading}>
                                    {actionLoading.type === 'delete' && isActionLoading ? <CircularProgress size={18} color="inherit"/> : <DeleteOutlineIcon fontSize='small'/>}
                                </IconButton>
                                </span>
                            </Tooltip>
                            </Stack>
                        </TableCell>
                        </TableRow>
                    );
                    })
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} align="center" sx={{py:4}}>
                        <Stack alignItems="center" spacing={1} sx={{color: 'text.secondary'}}>
                            <PlaylistPlayIcon sx={{fontSize: 48, opacity: 0.7}}/>
                            <Typography>Bạn chưa đăng tin tuyển dụng nào.</Typography>
                            <Button variant="text" component={RouterLink} to="/employer/post-job" startIcon={<AddCircleOutlineIcon/>}>
                                Đăng tin ngay
                            </Button>
                        </Stack>
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </TableContainer>
        </Paper>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tin đăng"
        contentText={`Bạn có chắc chắn muốn xóa tin tuyển dụng "${jobs.find(j => (j._id || j.id) === deletingJobId)?.title || 'này'}" không? Hành động này không thể hoàn tác.`}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default ManageJobsPage;

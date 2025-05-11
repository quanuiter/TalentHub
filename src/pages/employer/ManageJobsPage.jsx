// src/pages/employer/ManageJobsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
// Import hàm fetch/action mới
import { fetchEmployerJobs, toggleJobStatus, deleteEmployerJob } from '../../data/mockJobs'; // Giả sử bạn lưu vào file riêng
import ConfirmDialog from '../../components/common/ConfirmDialog'; // Dùng lại ConfirmDialog

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
import Link from '@mui/material/Link'; // MUI Link
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack'; // Dùng cho Actions

// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Xem ứng viên
import ToggleOnIcon from '@mui/icons-material/ToggleOn'; // Mở lại tin
import ToggleOffIcon from '@mui/icons-material/ToggleOff'; // Đóng tin
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
// Helper lấy màu Chip cho trạng thái tin đăng
const getJobStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'closed':
    case 'expired':
        return 'default'; // Hoặc 'secondary'
    case 'draft': return 'warning';
    default: return 'info';
  }
};


function ManageJobsPage() {
  const { authState } = useAuth();
  //const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null }); // State loading cho từng hành động
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const loadJobs = async () => {
    // Bỏ log không cần thiết
    // console.log('[ManageJobsPage] loadJobs called. User ID:', authState.user?.id);
    // Không cần kiểm tra user ID nữa vì API sẽ kiểm tra token
    setLoading(true);
    setError(null);
    try {
      // console.log('[ManageJobsPage] Calling getEmployerJobsApi...'); // Có thể giữ lại log nếu muốn debug
      // Gọi API mới để lấy jobs của employer hiện tại
      const response = await apiService.getEmployerJobsApi();
      // console.log('[ManageJobsPage] API success. Data received:', response.data);

      if (response && Array.isArray(response.data)) {
           // Sắp xếp mới nhất lên đầu (ví dụ)
           response.data.sort((a, b) => new Date(b.createdAt || b.datePosted) - new Date(a.createdAt || a.datePosted));
           setJobs(response.data);
      } else {
           console.error("Employer jobs API response is not an array:", response);
           setJobs([]);
           setError("Dữ liệu tin đăng trả về không hợp lệ.");
      }
    } catch (err) {
      console.error("[ManageJobsPage] Error loading employer jobs:", err);
      // Hiển thị lỗi từ API nếu có, nếu không hiển thị lỗi chung
      const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách tin đăng.";
      setError(errorMsg);
      setJobs([]); // Đảm bảo jobs rỗng khi lỗi
    } finally {
      // console.log('[ManageJobsPage] Reached finally block. Setting loading to false.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.user?.id]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Mock Handlers for Actions ---
  const handleEditJob = (jobId) => {
    console.log("Navigating to edit job with ID:", jobId); // Kiểm tra xem jobId có phải undefined không
    if (jobId) { // Chỉ điều hướng nếu có jobId
       navigate(`/employer/edit-job/${jobId}`);
    } else {
       console.error("Cannot navigate to edit page: Job ID is undefined!");
       // Có thể hiển thị thông báo lỗi cho người dùng
    }
};

  const handleViewApplicants = (jobId) => {
    console.log("View applicants for job:", jobId);
    // navigate(`/employer/manage-jobs/${jobId}/applicants`); // Điều hướng đến trang xem ứng viên
    setSnackbar({ open: true, message: `Chức năng xem ứng viên cho ${jobId} sẽ được làm sau!`, severity: 'info' });
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    if (actionLoading.id) return;
    const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    setActionLoading({type: 'toggle', id: jobId});
    setSnackbar({ ...snackbar, open: false });
    try {
        // <<< GỌI API CẬP NHẬT (chỉ cập nhật status) >>>
        // Dùng lại API update nhưng chỉ gửi trường status
        const response = await apiService.updateJobApi(jobId, { status: newStatus });

         // Cập nhật UI
         setJobs(prevJobs => prevJobs.map(job =>
             (job._id || job._id) === jobId ? { ...job, status: newStatus } : job
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
    if (!deletingJobId || actionLoading.id) return; // Thêm kiểm tra actionLoading.id
    const jobIdToDelete = deletingJobId;
    handleCloseDeleteDialog();
    setActionLoading({type: 'delete', id: jobIdToDelete});
    setSnackbar({ ...snackbar, open: false });
    try {
        // Gọi API xóa job thật
        const response = await apiService.deleteJobApi(jobIdToDelete);

        // Cập nhật lại danh sách jobs trên UI sau khi xóa thành công
        setJobs(prevJobs => prevJobs.filter(job => (job._id || job._id) !== jobIdToDelete)); // Dùng _id hoặc id tùy backend trả về

        setSnackbar({ open: true, message: response.data?.message || 'Đã xóa tin tuyển dụng thành công!', severity: 'success' });
    } catch(err) {
         console.error("Lỗi khi xóa tin:", err);
         const errorMsg = err.response?.data?.message || err.message || 'Lỗi! Không thể xóa tin tuyển dụng.';
         setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
         setActionLoading({type: null, id: null});
    }
  };


  return (
    <Box>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
                Quản lý tin đăng
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/employer/post-job" // Link đến trang đăng tin mới
            >
                Đăng tin mới
            </Button>
       </Box>


      {loading && <LoadingSpinner />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Manage jobs table">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Chức danh</TableCell>
                <TableCell>Ngày đăng</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Ứng viên</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow key={job._id} hover> {/* Thêm hover effect */}
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle2">{job.title}</Typography>
                       {/* Có thể thêm link đến trang job gốc nếu cần */}
                       {/* <Link component={RouterLink} to={`/jobs/${job.originalJobId || job._id}`} variant="caption">Xem tin gốc</Link> */}
                    </TableCell>
                    <TableCell>
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '-'}
                      {job.applicationDeadline && (
                        <Typography variant="caption" display="block">
                            Hạn: {new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={job.status || 'N/A'}
                        color={getJobStatusColor(job.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                         {/* Link đến trang xem ứng viên */}
                        <Link component={RouterLink} to={`#`} /* to={`/employer/manage-jobs/${job._id}/applicants`} */ underline="hover">
                            {job.applicantCount ?? 0}
                        </Link>
                    </TableCell>
                    <TableCell align="center">
                        {/* Stack để các icon/button gần nhau hơn */}
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Sửa tin">
                              <IconButton
                                size="small"
                                disabled={actionLoading.id === job._id}
                                component={RouterLink} // <<< Dùng RouterLink
                                to={`/employer/edit-job/${job._id}`} // <<< Trỏ đến route edit
                              >
                                <EditIcon fontSize='small'/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Xem ứng viên">
                            <IconButton
                                        size="small"
                                        // Bỏ onClick nếu có
                                        // onClick={() => handleViewApplicants(job._id)}
                                        disabled={actionLoading.id === job._id}
                                        component={RouterLink} // <<< Thêm component RouterLink
                                        to={`/employer/jobs/${job._id}/applicants`} // <<< Trỏ đến route mới với job._id
                                    >
                                <VisibilityIcon fontSize='small'/>
                                </IconButton>
                            </Tooltip>
                            {/* Nút Đóng/Mở tin */}
                            <Tooltip title={job.status === 'Active' ? 'Đóng tin' : 'Mở lại tin'}>
                                <span> {/* Thêm span để Tooltip hoạt động khi disabled */}
                                    <IconButton
                                        size="small"
                                        onClick={() => handleToggleStatus(job._id, job.status)}
                                        disabled={actionLoading.id === job._id || job.status === 'Draft'} // Không toggle tin Nháp
                                        color={job.status === 'Active' ? 'warning' : 'success'}
                                    >
                                        {actionLoading.type === 'toggle' && actionLoading.id === job._id
                                            ? <CircularProgress size={18} color="inherit"/>
                                            : (job.status === 'Active' ? <ToggleOffIcon fontSize='small'/> : <ToggleOnIcon fontSize='small'/>)
                                        }
                                    </IconButton>
                                </span>
                            </Tooltip>
                             <Tooltip title="Xóa tin">
                                 <span>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteClick(job._id)}
                                        disabled={actionLoading.id === job._id}
                                    >
                                         {actionLoading.type === 'delete' && actionLoading.id === job._id
                                            ? <CircularProgress size={18} color="inherit"/>
                                            : <DeleteIcon fontSize='small'/>
                                        }
                                    </IconButton>
                                 </span>
                            </Tooltip>
                        </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Bạn chưa đăng tin tuyển dụng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

       {/* Dialog Xác nhận Xóa */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tin đăng"
        contentText="Bạn có chắc chắn muốn xóa tin tuyển dụng này không? Hành động này không thể hoàn tác."
      />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>

    </Box>
  );
}

export default ManageJobsPage;
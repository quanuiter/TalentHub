// src/pages/admin/AdminApproveJobsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api'; // Bạn cần thêm các hàm API cho admin vào đây

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Container from '@mui/material/Container';
import { useTheme, alpha } from '@mui/material/styles';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';


// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';


function AdminApproveJobsPage() {
    const theme = useTheme();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [selectedJobIds, setSelectedJobIds] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalJobs, setTotalJobs] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterApprovalStatus, setFilterApprovalStatus] = useState('Pending'); // Mặc định xem job 'Pending'

    // State cho dialog từ chối
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [jobsToReject, setJobsToReject] = useState([]);


    const fetchJobsToApprove = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search: searchTerm || undefined,
                approvalStatus: filterApprovalStatus || undefined, // Gửi trạng thái lọc
                sort: filterApprovalStatus === 'Pending' ? 'createdAt' : '-approvedAt', // Ưu tiên job cũ nhất chờ duyệt
            };
            // Giả sử bạn đã thêm hàm adminGetAllJobsForAdmin hoặc adminGetPendingJobs
            const response = await apiService.adminGetAllJobsForAdmin(params); 
            if (response && response.data && response.data.success) {
                setJobs(response.data.data || []);
                setTotalJobs(response.data.totalJobs || 0);
            } else {
                throw new Error(response.data?.message || 'Không thể tải danh sách công việc.');
            }
        } catch (err) {
            console.error("Lỗi tải công việc (admin):", err);
            setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
            setJobs([]);
            setTotalJobs(0);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchTerm, filterApprovalStatus]);

    useEffect(() => {
        fetchJobsToApprove();
    }, [fetchJobsToApprove]);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelectedIds = jobs.map((job) => job._id);
            setSelectedJobIds(newSelectedIds);
            return;
        }
        setSelectedJobIds([]);
    };

    const handleSelectOneClick = (event, id) => {
        const selectedIndex = selectedJobIds.indexOf(id);
        let newSelectedJobIds = [];

        if (selectedIndex === -1) {
            newSelectedJobIds = newSelectedJobIds.concat(selectedJobIds, id);
        } else if (selectedIndex === 0) {
            newSelectedJobIds = newSelectedJobIds.concat(selectedJobIds.slice(1));
        } else if (selectedIndex === selectedJobIds.length - 1) {
            newSelectedJobIds = newSelectedJobIds.concat(selectedJobIds.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelectedJobIds = newSelectedJobIds.concat(
                selectedJobIds.slice(0, selectedIndex),
                selectedJobIds.slice(selectedIndex + 1),
            );
        }
        setSelectedJobIds(newSelectedJobIds);
    };

    const isSelected = (id) => selectedJobIds.indexOf(id) !== -1;

    const handleApproveSelectedJobs = async () => {
        if (selectedJobIds.length === 0) {
            setSnackbar({ open: true, message: 'Vui lòng chọn ít nhất một công việc để phê duyệt.', severity: 'warning' });
            return;
        }
        setActionLoading(true);
        try {
            // Giả sử bạn đã thêm hàm adminApproveJobs vào apiService
            await apiService.adminApproveJobs(selectedJobIds);
            setSnackbar({ open: true, message: 'Các công việc đã chọn được phê duyệt thành công!', severity: 'success' });
            setSelectedJobIds([]);
            fetchJobsToApprove(); // Tải lại danh sách
        } catch (err) {
            console.error("Lỗi phê duyệt công việc:", err);
            setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể phê duyệt công việc.', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenRejectDialog = () => {
        if (selectedJobIds.length === 0) {
            setSnackbar({ open: true, message: 'Vui lòng chọn ít nhất một công việc để từ chối.', severity: 'warning' });
            return;
        }
        setJobsToReject(selectedJobIds);
        setRejectDialogOpen(true);
    };

    const handleCloseRejectDialog = () => {
        setRejectDialogOpen(false);
        setRejectionReason('');
        setJobsToReject([]);
    };

    const handleRejectSelectedJobs = async () => {
        setActionLoading(true);
        try {
            // Giả sử bạn đã thêm hàm adminRejectJobs vào apiService
            await apiService.adminRejectJobs({ jobIds: jobsToReject, rejectionReason });
            setSnackbar({ open: true, message: 'Các công việc đã chọn bị từ chối thành công!', severity: 'success' });
            setSelectedJobIds([]); // Xóa các job đã chọn sau khi từ chối
            handleCloseRejectDialog();
            fetchJobsToApprove(); // Tải lại danh sách
        } catch (err) {
            console.error("Lỗi từ chối công việc:", err);
            setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể từ chối công việc.', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleFilterStatusChange = (event) => {
        setFilterApprovalStatus(event.target.value);
        setPage(0);
    };

    const getApprovalStatusChip = (status) => {
        switch (status) {
            case 'Approved':
                return <Chip label="Đã duyệt" color="success" size="small" icon={<CheckCircleOutlineIcon />} sx={{borderRadius:'6px'}}/>;
            case 'Pending':
                return <Chip label="Chờ duyệt" color="warning" size="small" icon={<HourglassEmptyIcon />} sx={{borderRadius:'6px'}}/>;
            case 'Rejected':
                return <Chip label="Bị từ chối" color="error" size="small" icon={<CancelOutlinedIcon />} sx={{borderRadius:'6px'}}/>;
            default:
                return <Chip label={status || "Không rõ"} size="small" sx={{borderRadius:'6px'}}/>;
        }
    };


    return (
        <Container maxWidth="xl" sx={{ py: 3 }}> {/* Sử dụng xl để bảng rộng hơn */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark', display:'flex', alignItems:'center', gap:1 }}>
               <FactCheckOutlinedIcon fontSize="large"/> Phê duyệt Công việc
            </Typography>

            <Paper sx={{ p: {xs:2, md:3}, mb: 3, borderRadius: '12px', boxShadow: theme.shadows[3] }}>
                 <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="Tìm kiếm (Tên công việc, Công ty)"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ flexGrow: 1, minWidth: '250px', bgcolor: alpha(theme.palette.grey[50], 0.9) }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200, bgcolor: alpha(theme.palette.grey[50], 0.9) }}>
                        <InputLabel>Trạng thái phê duyệt</InputLabel>
                        <Select
                            value={filterApprovalStatus}
                            onChange={handleFilterStatusChange}
                            label="Trạng thái phê duyệt"
                        >
                            <MenuItem value=""><em>Tất cả trạng thái</em></MenuItem>
                            <MenuItem value="Pending">Chờ duyệt</MenuItem>
                            <MenuItem value="Approved">Đã duyệt</MenuItem>
                            <MenuItem value="Rejected">Bị từ chối</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={handleApproveSelectedJobs}
                        disabled={selectedJobIds.length === 0 || actionLoading || filterApprovalStatus !== 'Pending'}
                        startIcon={actionLoading ? <CircularProgress size={18} color="inherit"/> : <ThumbUpOutlinedIcon />}
                        sx={{textTransform: 'none', borderRadius: '8px'}}
                    >
                        Phê duyệt ({selectedJobIds.length})
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={handleOpenRejectDialog}
                        disabled={selectedJobIds.length === 0 || actionLoading || filterApprovalStatus !== 'Pending'}
                        startIcon={actionLoading ? <CircularProgress size={18} color="inherit"/> : <ThumbDownOutlinedIcon />}
                        sx={{textTransform: 'none', borderRadius: '8px'}}
                    >
                        Từ chối ({selectedJobIds.length})
                    </Button>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && !loading && (
                    <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                )}
                {!loading && !error && (
                    <>
                        <TableContainer sx={{maxHeight: 600}}>
                            <Table stickyHeader aria-label="job approval table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox" sx={{bgcolor: alpha(theme.palette.primary.light, 0.1)}}>
                                            <Checkbox
                                                color="primary"
                                                indeterminate={selectedJobIds.length > 0 && selectedJobIds.length < jobs.length}
                                                checked={jobs.length > 0 && selectedJobIds.length === jobs.length}
                                                onChange={handleSelectAllClick}
                                                inputProps={{ 'aria-label': 'select all jobs' }}
                                                disabled={filterApprovalStatus !== 'Pending'}
                                            />
                                        </TableCell>
                                        <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Tên công việc</TableCell>
                                        <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Công ty</TableCell>
                                        <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Người đăng</TableCell>
                                        <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Ngày đăng</TableCell>
                                        <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Trạng thái duyệt</TableCell>
                                        <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Chi tiết</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.length > 0 ? jobs.map((job) => {
                                        const isItemSelected = isSelected(job._id);
                                        return (
                                            <TableRow
                                                hover
                                                onClick={(event) => job.approvalStatus === 'Pending' && handleSelectOneClick(event, job._id)}
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={job._id}
                                                selected={isItemSelected}
                                                sx={{ cursor: job.approvalStatus === 'Pending' ? 'pointer' : 'default', '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        inputProps={{ 'aria-labelledby': `job-checkbox-${job._id}` }}
                                                        disabled={job.approvalStatus !== 'Pending'}
                                                    />
                                                </TableCell>
                                                <TableCell component="th" id={`job-checkbox-${job._id}`} scope="row">
                                                    <Typography variant="body1" fontWeight="500" color="text.primary">
                                                        {job.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{job.companyName || (job.companyId?.name) || 'N/A'}</TableCell>
                                                <TableCell>{job.postedBy?.fullName || job.postedBy?.email || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </TableCell>
                                                <TableCell>{getApprovalStatusChip(job.approvalStatus)}</TableCell>
                                                <TableCell>
                                                    <Button 
                                                        component={RouterLink} 
                                                        to={`/jobs/${job._id}`} // Link đến trang chi tiết job
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{textTransform: 'none', borderRadius: '6px'}}
                                                    >
                                                        Xem
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                         <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{py:3}}>
                                                <Typography color="text.secondary" fontStyle="italic">
                                                    {filterApprovalStatus === 'Pending' ? 'Không có công việc nào đang chờ phê duyệt.' : 'Không tìm thấy công việc nào phù hợp.'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={totalJobs}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số dòng mỗi trang:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
                        />
                    </>
                )}
            </Paper>

            {/* Dialog để nhập lý do từ chối */}
            <Dialog open={rejectDialogOpen} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{fontWeight:600}}>Từ chối Công việc ({jobsToReject.length} mục)</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb:2}}>
                        Bạn có chắc chắn muốn từ chối các công việc đã chọn không?
                        Vui lòng nhập lý do từ chối (không bắt buộc).
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="rejectionReason"
                        label="Lý do từ chối"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{px:3, pb:2}}>
                    <Button onClick={handleCloseRejectDialog} color="inherit" sx={{borderRadius: '8px'}}>Hủy</Button>
                    <Button onClick={handleRejectSelectedJobs} variant="contained" color="error" disabled={actionLoading} sx={{borderRadius: '8px'}}>
                        {actionLoading ? <CircularProgress size={20} color="inherit"/> : "Xác nhận Từ chối"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity || 'info'} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default AdminApproveJobsPage;

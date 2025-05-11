// src/pages/candidate/AppliedJobsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Để lấy candidateId (nếu cần)
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

// Hàm helper để lấy màu cho Chip trạng thái
const getStatusChipColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'mời phỏng vấn':
    case 'mời làm bài test':
    case 'trúng tuyển':
      return 'success';
    case 'đang xét duyệt':
      return 'warning';
    case 'từ chối':
      return 'error';
    case 'đã nộp':
    default:
      return 'info';
  }
};

function AppliedJobsPage() {
  const { authState } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAppliedJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // <<< GỌI API THẬT >>>
        const response = await apiService.getCandidateApplicationsApi();

        if (response && Array.isArray(response.data)) {
           setAppliedJobs(response.data);
        } else {
            console.error("Applied jobs API response is not an array:", response);
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
    };

    loadAppliedJobs();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}> Việc làm đã ứng tuyển </Typography>

      {loading && <LoadingSpinner />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="Applied jobs table">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Chức danh</TableCell>
                <TableCell>Công ty</TableCell>
                <TableCell align="center">Ngày ứng tuyển</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                            {appliedJobs.length > 0 ? (
                                appliedJobs.map((app) => {
                                    // Lấy object Job đã được populate
                                    const jobInfo = app.jobId;
                                    // Lấy ID của Application để làm key
                                    const appKey = app._id || app.applicationId; // Dùng _id nếu có

                                    return (
                                        <TableRow
                                            key={appKey} // <<< Dùng ID của Application làm key
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            {/* Cột Chức danh: Lấy title từ jobInfo */}
                                            <TableCell component="th" scope="row">
                                                {jobInfo ? (
                                                    // Link đến trang chi tiết job bằng ID của job
                                                    <Link component={RouterLink} to={`/jobs/${jobInfo._id || jobInfo.id}`} underline="hover">
                                                        {jobInfo.title || 'N/A'}
                                                    </Link>
                                                ) : ('Thông tin việc làm không có')}
                                            </TableCell>
                                            {/* Cột Công ty: Lấy companyName từ jobInfo */}
                                            <TableCell>{jobInfo?.companyName || 'N/A'}</TableCell>
                                            {/* Cột Ngày ứng tuyển: Lấy createdAt từ Application */}
                                            <TableCell align="center">
                                                {app.createdAt ? new Date(app.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                            </TableCell>
                                            {/* Cột Trạng thái: Giữ nguyên, lấy status từ Application */}
                                            <TableCell align="center">
                                                <Chip
                                                    label={app.status}
                                                    color={getStatusChipColor(app.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Bạn chưa ứng tuyển vào vị trí nào.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AppliedJobsPage;
// src/pages/employer/ApplicantsPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Import Dialogs
import EvaluateApplicantDialog from '../../components/employer/EvaluateApplicantDialog';
import InviteDialog from '../../components/employer/InviteDialog';
import ViewProfileDialog from '../../components/employer/ViewProfileDialog';
import ViewCoverLetterDialog from '../../components/employer/ViewCoverLetterDialog';

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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
// import Dialog from '@mui/material/Dialog'; // Không cần thiết nếu chỉ dùng Dialog chuyên biệt
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
// import FormLabel from '@mui/material/FormLabel';
// import RadioGroup from '@mui/material/RadioGroup';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Radio from '@mui/material/Radio';
// import Button from '@mui/material/Button'; // Button được dùng trong các Dialog con

// Import Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import RateReviewIcon from '@mui/icons-material/RateReview';
// import LinkIcon from '@mui/icons-material/Link'; // Không thấy dùng trực tiếp ở đây
import AssignmentIcon from '@mui/icons-material/Assignment'; // Icon cho gửi bài test

const applicantStatuses = [
    'Đã nộp', 'Đã xem', 'Phù hợp', 'Mời phỏng vấn', 'Trúng tuyển', 'Từ chối', 'Đã gửi bài test'
];

const getApplicantStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
        case 'mời phỏng vấn':
        case 'trúng tuyển':
        case 'phù hợp':
            return 'success';
        case 'đã xem':
            return 'info';
        case 'từ chối':
            return 'error';
        case 'đã gửi bài test':
            return 'secondary';
        case 'đã nộp':
        default:
            return 'primary';
    }
};

const formatShortDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Ngày giờ không hợp lệ';
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
               date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Lỗi ngày giờ';
    }
};

// API_DOMAIN có thể không cần thiết nếu bạn không xây dựng URL thủ công nữa
// const API_DOMAIN = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5001';

function ApplicantsPage() {
  const { jobId } = useParams(); // ID của job cụ thể (nếu có từ URL)
  const { authState } = useAuth();
  const navigate = useNavigate(); // Thêm navigate

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDetailsForTitle, setJobDetailsForTitle] = useState(null); // Lưu chi tiết job để hiển thị title
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingStatusId, setUpdatingStatusId] = useState(null); // ID của application đang được cập nhật status

  // States for Dialogs
  const [openViewProfileDialog, setOpenViewProfileDialog] = useState(false);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState(null); // Lưu trữ object candidateId đã populate
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedApplicantForInvite, setSelectedApplicantForInvite] = useState(null); // Lưu trữ toàn bộ object application

  const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  const [selectedApplicantForEvaluation, setSelectedApplicantForEvaluation] = useState(null); // Lưu trữ toàn bộ object application
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  const [openViewCoverLetterDialog, setOpenViewCoverLetterDialog] = useState(false);
  const [selectedApplicantForCoverLetter, setSelectedApplicantForCoverLetter] = useState(null); // Lưu trữ toàn bộ object application

  // States cho việc gửi bài test (sử dụng chung InviteDialog)
  const [availableTests, setAvailableTests] = useState([]); // Danh sách tất cả bài test của NTD
  const [loadingTests, setLoadingTests] = useState(true); // Đổi tên từ false để thể hiện đúng trạng thái ban đầu

  // --- useEffect: Tải danh sách bài test của Nhà tuyển dụng ---
  useEffect(() => {
    const loadEmployerTests = async () => {
        if (authState.user?.id) {
            console.log("[ApplicantsPage] Attempting to load employer tests...");
            setLoadingTests(true);
            try {
                const response = await apiService.getMyTestsApi();
                console.log("[ApplicantsPage] Raw response from getMyTestsApi:", response);
                if (response && Array.isArray(response.data)) {
                    console.log("[ApplicantsPage] Employer tests fetched successfully:", response.data);
                    setAvailableTests(response.data);
                } else {
                    console.warn("[ApplicantsPage] No tests data or invalid format from getMyTestsApi. Response data:", response.data);
                    setAvailableTests([]);
                }
            } catch (err) {
                console.error("[ApplicantsPage] Error loading employer tests:", err.response?.data || err.message || err);
                setSnackbar({ open: true, message: 'Lỗi: Không thể tải danh sách bài test của bạn.', severity: 'error' });
                setAvailableTests([]);
            } finally {
                console.log("[ApplicantsPage] Finished loading employer tests, setLoadingTests(false).");
                setLoadingTests(false);
            }
        } else {
            console.log("[ApplicantsPage] User not available or not authenticated for loading tests.");
            setAvailableTests([]);
            setLoadingTests(false);
        }
    };

    if (authState.isAuthenticated && !authState.isLoading) {
        loadEmployerTests();
    }
  }, [authState.user?.id, authState.isAuthenticated, authState.isLoading]);

  // --- useEffect: Tải danh sách ứng viên và chi tiết công việc (nếu có jobId) ---
  useEffect(() => {
    const loadData = async () => {
      console.log(`[ApplicantsPage] Initiating data load. JobId: ${jobId}, User ID: ${authState.user?.id}`);
      setLoading(true);
      setError(null);
      setApplicants([]);
      setJobDetailsForTitle(null);
      // Không reset jobAssociatedTests ở đây vì nó được fetch riêng hoặc đã có từ jobDetailRes

      try {
        if (jobId) { // Nếu có jobId, nghĩa là xem ứng viên cho một job cụ thể
          console.log(`[ApplicantsPage] Fetching data for specific job ID: ${jobId}`);
          const [jobDetailRes, appsRes] = await Promise.all([
            apiService.getJobDetailsApi(jobId), // API này cần trả về cả associatedTests đã populate
            apiService.getApplicantsForJobApi(jobId) // API này cần trả về applications với candidateId và jobId đã populate
          ]);

          if (jobDetailRes?.data) {
            setJobDetailsForTitle(jobDetailRes.data);
            // Lấy associatedTests từ chi tiết job nếu có (backend cần populate trường này)
            // if (jobDetailRes.data.associatedTests && Array.isArray(jobDetailRes.data.associatedTests)) {
            //    setJobAssociatedTests(jobDetailRes.data.associatedTests.filter(t => t && t._id && t.name && t.link));
            // } else {
            //    setJobAssociatedTests([]);
            // }
            console.log("[ApplicantsPage] Job details fetched (including associated tests if any):", jobDetailRes.data);
          } else {
            console.warn(`[ApplicantsPage] No job details found for Job ID: ${jobId}`);
            setError(`Không tìm thấy thông tin cho Job ID: ${jobId}. Có thể tin đã bị xóa hoặc không tồn tại.`);
          }

          if (appsRes && Array.isArray(appsRes.data)) {
            setApplicants(appsRes.data);
            console.log("[ApplicantsPage] Applicants for specific job fetched:", appsRes.data.length);
          } else {
            console.warn("[ApplicantsPage] No applicants data or invalid format for specific job.");
            setApplicants([]); // Đảm bảo là mảng rỗng
            // Không nên setError ở đây nếu jobDetail đã có lỗi, tránh ghi đè
            if (!jobDetailRes?.data) {
                setError(prevError => prevError ? `${prevError} Và không có dữ liệu ứng viên.` : "Không có dữ liệu ứng viên hoặc định dạng không hợp lệ.");
            }
          }
        } else { // Nếu không có jobId, xem tất cả ứng viên của employer
          console.log("[ApplicantsPage] Fetching all applicants for employer.");
          const appsRes = await apiService.getAllApplicantsForEmployerApi(); // API này cần trả về applications với candidateId và jobId đã populate
          if (appsRes && Array.isArray(appsRes.data)) {
            setApplicants(appsRes.data);
            console.log("[ApplicantsPage] All applicants fetched:", appsRes.data.length);
          } else {
            console.warn("[ApplicantsPage] No applicants data or invalid format for all applicants.");
            setApplicants([]);
            setError("Không có dữ liệu ứng viên hoặc định dạng không hợp lệ.");
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải dữ liệu ứng viên.";
        console.error("[ApplicantsPage] Error loading data:", errorMsg, err);
        setError(errorMsg);
        setApplicants([]); // Đảm bảo là mảng rỗng khi lỗi
      } finally {
        console.log("[ApplicantsPage] Data loading process finished. Setting loading to false.");
        setLoading(false);
      }
    };

    if (!authState.isLoading && authState.isAuthenticated && authState.user?.id) {
      loadData();
    } else if (!authState.isLoading && !authState.isAuthenticated) {
      setError("Vui lòng đăng nhập để xem danh sách ứng viên.");
      setLoading(false);
    }
  }, [jobId, authState.isAuthenticated, authState.isLoading, authState.user?.id]);


  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- CÁC HÀM HANDLER CHO ACTIONS ---
  const handleStatusChange = async (applicationId, newStatus) => {
     if (!applicationId) return;
     setUpdatingStatusId(applicationId);
     try {
         // Backend cần trả về application đã populate candidateId và jobId
         const response = await apiService.updateApplicationStatusApi(applicationId, { status: newStatus });
         const updatedAppFromServer = response.data?.application;
         if (updatedAppFromServer) {
            setApplicants(prevApps => prevApps.map(app =>
                (app._id || app.applicationId) === applicationId ? updatedAppFromServer : app
            ));
            setSnackbar({open: true, message: response.data?.message || 'Cập nhật trạng thái thành công!', severity: 'success'});
         } else {
            throw new Error("Dữ liệu trả về không hợp lệ sau khi cập nhật trạng thái.");
         }
     } catch(err) {
          const errorMsg = err.response?.data?.message || 'Lỗi! Không thể cập nhật trạng thái.';
          setSnackbar({open: true, message: errorMsg, severity: 'error'});
     } finally {
         setUpdatingStatusId(null);
     }
  };

  const handleOpenViewProfileDialog = (candidateObject) => { // Truyền cả object candidateId
    if (!candidateObject || !candidateObject._id) {
        setSnackbar({ open: true, message: 'Không có thông tin ID ứng viên.', severity: 'warning'});
        return;
    }
    // Không cần fetch lại nếu candidateObject đã đầy đủ thông tin
    setSelectedCandidateProfile(candidateObject);
    setOpenViewProfileDialog(true);
    // setLoadingProfile(true) // Chỉ set true nếu bạn fetch lại
    // try {
    //     // const appData = applicants.find(app => (app.candidateId?._id || app.candidateId?.id) === candidateId);
    //     // if (appData && appData.candidateId) {
    //     //     setSelectedCandidateProfile(appData.candidateId);
    //     // } else { ... }
    // } catch (err) { ... }
    // finally { setLoadingProfile(false); }
  };
  const handleCloseViewProfileDialog = () => {
      setOpenViewProfileDialog(false);
      setTimeout(() => setSelectedCandidateProfile(null), 300);
  };

  const handleOpenInviteDialog = (applicant) => { // applicant là nguyên object application
    if (!applicant || !applicant.candidateId?._id) { // Kiểm tra candidateId._id
        setSnackbar({ open: true, message: 'Không đủ thông tin ứng viên (thiếu ID).', severity: 'warning'});
        setSelectedApplicantForInvite(null);
        return;
    }
    setSelectedApplicantForInvite(applicant);
    setOpenInviteDialog(true);
  };
  const handleCloseInviteDialog = () => {
    setOpenInviteDialog(false);
    setTimeout(() => setSelectedApplicantForInvite(null), 300);
  };

  const handleInviteSubmit = async (dataFromDialog) => {
    if (!selectedApplicantForInvite || !selectedApplicantForInvite._id) {
        setSnackbar({ open: true, message: 'Chưa chọn ứng viên hoặc ứng viên không hợp lệ.', severity: 'error' });
        return Promise.reject(new Error("No valid applicant selected"));
    }

    const appId = selectedApplicantForInvite._id;
    const candidateName = selectedApplicantForInvite.candidateId?.fullName || 'Ứng viên này';

    try {
        let response;
        let successMessagePrefix = '';

        if (dataFromDialog.inviteType === 'Phỏng vấn') {
            successMessagePrefix = 'Đã lên lịch phỏng vấn';
            const schedulePayload = {
                interviewDate: dataFromDialog.dateTime,
                interviewType: dataFromDialog.inviteType,
                location: dataFromDialog.location,
                link: dataFromDialog.link,
                notes: dataFromDialog.notes
            };
            response = await apiService.scheduleInterviewApi(appId, schedulePayload);
        } else if (dataFromDialog.inviteType === 'Test') {
            successMessagePrefix = 'Đã gửi bài test';
            const testAssignmentPayload = {
                testId: dataFromDialog.selectedTestId,
                deadline: dataFromDialog.testDeadline || undefined,
                notesForCandidate: dataFromDialog.notesForTest || undefined
            };
            response = await apiService.assignTestToApplicantApi(appId, testAssignmentPayload);
        } else {
            throw new Error("Loại lời mời không hợp lệ.");
        }

        const updatedAppFromServer = response.data?.application; // Backend phải trả về application đã populate

        if (updatedAppFromServer) {
            setApplicants(prevApps => prevApps.map(app =>
                (app._id || app.applicationId) === appId ? updatedAppFromServer : app
            ));
            setSnackbar({ open: true, message: response.data.message || `${successMessagePrefix} cho ${candidateName}.`, severity: 'success' });
            handleCloseInviteDialog();
            return Promise.resolve(response.data);
        } else {
            throw new Error(`Phản hồi không hợp lệ sau khi ${dataFromDialog.inviteType.toLowerCase()}.`);
        }
    } catch (err) {
      // >>> LOG LỖI CHI TIẾT HƠN Ở ĐÂY <<<
        console.error(`[ApplicantsPage] Error processing invite (Type: ${dataFromDialog.inviteType}):`, err);
        if (err.response) {
            // Lỗi từ server (ví dụ: 4xx, 5xx)
            console.error("[ApplicantsPage] Server responded with error:", err.response.data);
            console.error("[ApplicantsPage] Status code:", err.response.status);
        } else if (err.request) {
            // Request đã được gửi nhưng không nhận được response (lỗi mạng, server không chạy)
            console.error("[ApplicantsPage] No response received from server:", err.request);
        } else {
            // Lỗi xảy ra trong quá trình thiết lập request
            console.error("[ApplicantsPage] Error setting up request:", err.message);
        }
        // >>> KẾT THÚC LOG LỖI CHI TIẾT <<<
        const errorMsg = err.response?.data?.message || `Lỗi! Không thể ${dataFromDialog.inviteType.toLowerCase()}.`;
        setSnackbar({ open: true, message: errorMsg, severity: 'error'});
        return Promise.reject(err);
    }
  };

  const handleOpenEvaluateDialog = (applicant) => {
    if (!applicant || !applicant.candidateId?._id) {
        setSnackbar({ open: true, message: 'Không đủ thông tin ứng viên để đánh giá.', severity: 'warning'});
        return;
    }
    setSelectedApplicantForEvaluation({
        ...applicant,
        currentEvaluation: applicant.evaluation || null
    });
    setOpenEvaluateDialog(true);
  };
  const handleCloseEvaluateDialog = () => {
    setOpenEvaluateDialog(false);
    setTimeout(() => setSelectedApplicantForEvaluation(null), 300);
  };

  const handleEvaluateSubmit = async (evaluationData) => {
    if (!selectedApplicantForEvaluation || !selectedApplicantForEvaluation._id) return;
    setEvaluationLoading(true);
    const appId = selectedApplicantForEvaluation._id;
    const candidateName = selectedApplicantForEvaluation.candidateId?.fullName || 'Ứng viên';
    try {
        // Backend cần trả về application đã populate candidateId và jobId
        const response = await apiService.evaluateApplicationApi(appId, evaluationData);
        if (response.data && response.data.application) {
            const updatedAppFromServer = response.data.application;
            setApplicants(prevApps => prevApps.map(app =>
                app._id === appId ? updatedAppFromServer : app
            ));
            setSnackbar({ open: true, message: response.data.message || `Đã lưu đánh giá cho ${candidateName}.`, severity: 'success'});
            handleCloseEvaluateDialog();
        } else {
            throw new Error("Dữ liệu trả về không hợp lệ sau khi lưu đánh giá.");
        }
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Lỗi! Không thể lưu đánh giá.';
        setSnackbar({ open: true, message: errorMsg, severity: 'error'});
    } finally {
        setEvaluationLoading(false);
    }
  };

  const handleViewCV = (cvRelativeUrl, cvFileName) => {
    if (cvRelativeUrl && cvRelativeUrl !== '#') {
        // Giả sử cvRelativeUrl đã là đường dẫn đầy đủ hoặc apiClient đã cấu hình baseURL
        // Nếu cvRelativeUrl là đường dẫn tương đối từ domain API, ví dụ: /uploads/cvs/file.pdf
        // và API_DOMAIN của bạn là http://localhost:5001
        // thì fullCvUrl sẽ là http://localhost:5001/uploads/cvs/file.pdf
        const fullCvUrl = cvRelativeUrl.startsWith('http') ? cvRelativeUrl : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5001'}${cvRelativeUrl}`;
        window.open(fullCvUrl, '_blank', 'noopener,noreferrer');
    } else {
        setSnackbar({open: true, message: `Không thể mở CV: ${cvFileName || 'Không có link'}.`, severity: 'warning'});
    }
  };

  const handleOpenViewCoverLetterDialog = (applicant) => {
    if (!applicant) return;
    setSelectedApplicantForCoverLetter(applicant);
    setOpenViewCoverLetterDialog(true);
  };
  const handleCloseViewCoverLetterDialog = () => {
    setOpenViewCoverLetterDialog(false);
    setTimeout(() => setSelectedApplicantForCoverLetter(null), 300);
  };

  // Bỏ các hàm liên quan đến SendTestDialog riêng biệt vì đã gộp vào InviteDialog
  // const handleOpenSendTestDialog = (...) => { ... };
  // const handleCloseSendTestDialog = (...) => { ... };
  // const handleSelectTestRadioChange = (...) => { ... };
  // const handleSendTestSubmit = (...) => { ... };


  const renderPageTitle = () => {
    if (jobId && jobDetailsForTitle) {
      return (
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2 }}> {/* component="h1" cho ngữ nghĩa */}
          Ứng viên cho vị trí: <Link component={RouterLink} to={`/jobs/${jobId}`} underline="hover" sx={{fontWeight: 600, color: 'primary.main'}}>{jobDetailsForTitle.title}</Link>
        </Typography>
      );
    }
    if (!jobId) {
        return <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>Tất cả ứng viên</Typography>;
    }
    return null;
  };

  if (loading || authState.isLoading) { // Thêm kiểm tra authState.isLoading
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <Box sx={{p:2}}>
            {renderPageTitle()}
            <Alert severity="error" sx={{ mb: 2, p:2, borderRadius: '8px' }}>{error}</Alert>
            {jobId && <Button onClick={() => navigate('/employer/manage-jobs')}>Quay lại Quản lý Tin đăng</Button>}
        </Box>
    );
  }

  return (
    <Box sx={{p: {xs: 1, sm: 2}}}> {/* Responsive padding */}
      {renderPageTitle()}
      {!jobId && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}> {/* Tăng mb */}
          Danh sách tất cả ứng viên đã ứng tuyển vào các vị trí của bạn.
        </Typography>
      )}

      <TableContainer component={Paper} sx={{boxShadow: 3, borderRadius: 2}}> {/* Thêm style cho TableContainer */}
        <Table sx={{ minWidth: 750 }} aria-label="Applicants table">
          <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}> {/* Màu nền nhẹ hơn */}
            <TableRow>
              <TableCell sx={{width: '20%', fontWeight: 'bold'}}>Ứng viên</TableCell>
              {!jobId && (
                <TableCell sx={{width: '20%', fontWeight: 'bold'}}>Vị trí ứng tuyển</TableCell>
              )}
              <TableCell sx={{width: jobId ? '15%' : '12%', fontWeight: 'bold'}}>Ngày ứng tuyển</TableCell>
              <TableCell align="center" sx={{width: jobId ? '18%' : '15%', fontWeight: 'bold'}}>Trạng thái</TableCell>
              <TableCell align="center" sx={{width: '8%', fontWeight: 'bold'}}>CV</TableCell>
              <TableCell align="center" sx={{width: jobId ? '27%' : '25%', fontWeight: 'bold'}}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.length > 0 ? (
              applicants.map((app) => {
                  const currentAppId = app._id || app.applicationId;
                  const candidateInfo = app.candidateId; // Đây nên là object đã populate
                  const jobInfoForApplicant = app.jobId; // Đây nên là object đã populate
                  const isCurrentActionLoading = updatingStatusId === currentAppId;

                  return (
                      <TableRow key={currentAppId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell component="th" scope="row">
                              <Typography variant="subtitle2" fontWeight="500" color="primary.dark">
                                {candidateInfo?.fullName || 'N/A'}
                              </Typography>
                              {candidateInfo?.email && <Typography variant="caption" display="block" color="text.secondary">{candidateInfo.email}</Typography>}
                          </TableCell>

                          {!jobId && (
                              <TableCell>
                                {jobInfoForApplicant ? (
                                  <Link component={RouterLink} to={`/jobs/${jobInfoForApplicant._id}`} underline="hover" sx={{fontWeight: 500}}>
                                    {jobInfoForApplicant.title}
                                  </Link>
                                ) : ('N/A')}
                                {jobInfoForApplicant?.companyName && <Typography variant="caption" display="block" color="text.secondary">{jobInfoForApplicant.companyName}</Typography>}
                              </TableCell>
                          )}

                          <TableCell>{formatShortDateTime(app.createdAt)}</TableCell>
                          <TableCell align="center">
                              <FormControl variant="outlined" size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-input': { py: '6.5px' } }}> {/* Sử dụng outlined và custom padding */}
                                  <Select
                                      value={app.status}
                                      onChange={(e) => handleStatusChange(currentAppId, e.target.value)}
                                      disabled={isCurrentActionLoading}
                                      renderValue={(selectedValue) => (
                                          isCurrentActionLoading ?
                                          <CircularProgress size={18} sx={{mx: 'auto', display:'block'}}/> :
                                          <Chip label={selectedValue} color={getApplicantStatusColor(selectedValue)} size="small" sx={{width: '100%'}} />
                                      )}
                                      sx={{ borderRadius: '8px', '.MuiSelect-select': { p: '8px 12px', fontSize: '0.875rem' } , '.MuiSelect-select:focus': { backgroundColor: 'transparent' } }}
                                  >
                                      {applicantStatuses.map(statusOption => (
                                          <MenuItem key={statusOption} value={statusOption}>
                                               <Chip label={statusOption} color={getApplicantStatusColor(statusOption)} size="small" sx={{width: '100%'}} />
                                          </MenuItem>
                                      ))}
                                  </Select>
                              </FormControl>
                          </TableCell>
                           <TableCell align="center">
                               <Tooltip title={app.cvFileName || "Xem CV"}>
                                   <span>
                                      <IconButton size="small" onClick={() => handleViewCV(app.cvUrl, app.cvFileName)} disabled={!app.cvUrl || app.cvUrl === '#'}>
                                          <ArticleIcon fontSize='small'/>
                                      </IconButton>
                                   </span>
                               </Tooltip>
                           </TableCell>
                          <TableCell align="center">
                              <Stack direction="row" spacing={0.1} justifyContent="center" flexWrap="wrap"> {/* Giảm spacing */}
                                  <Tooltip title="Xem hồ sơ">
                                      <IconButton size="small" onClick={() => handleOpenViewProfileDialog(candidateInfo)} disabled={!candidateInfo?._id || isCurrentActionLoading} >
                                          <VisibilityIcon fontSize='small'/>
                                      </IconButton>
                                  </Tooltip>
                                  <Tooltip title={app.coverLetter ? "Xem Thư giới thiệu" : "Không có thư giới thiệu"}>
                                      <span>
                                          <IconButton
                                              size="small"
                                              color="info"
                                              onClick={() => handleOpenViewCoverLetterDialog(app)}
                                              disabled={isCurrentActionLoading || !app.coverLetter}
                                          >
                                              <DescriptionIcon fontSize='small'/>
                                          </IconButton>
                                      </span>
                                  </Tooltip>
                                  {/* Nút Gửi Lời Mời (chung cho Phỏng vấn/Test) */}
                                  <Tooltip title={`Mời / Gửi bài test cho ${candidateInfo?.fullName || 'Ứng viên'}`}>
                                      <IconButton size="small" color="primary" onClick={() => handleOpenInviteDialog(app)} disabled={isCurrentActionLoading}>
                                          <MailOutlineIcon fontSize='small'/>
                                      </IconButton>
                                  </Tooltip>
                                  <Tooltip title={`Đánh giá ${candidateInfo?.fullName || 'Ứng viên'}`}>
                                    <IconButton size="small" sx={{color: (theme) => theme.palette.secondary.main }} onClick={() => handleOpenEvaluateDialog(app)} disabled={isCurrentActionLoading}>
                                       <RateReviewIcon fontSize='small'/>
                                    </IconButton>
                                  </Tooltip>
                              </Stack>
                          </TableCell>
                      </TableRow>
                  );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={jobId ? 5 : 6} align="center" sx={{py:3}}>
                  <Typography color="text.secondary">
                    {jobId ? 'Chưa có ứng viên nào cho vị trí này.' : 'Chưa có ứng viên nào ứng tuyển vào các vị trí của bạn.'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      {selectedCandidateProfile && (
        <ViewProfileDialog
            open={openViewProfileDialog}
            onClose={handleCloseViewProfileDialog}
            candidateData={selectedCandidateProfile}
            loading={loadingProfile} // Nên là loadingProfile, không phải loading chung của trang
       />
      )}
      {selectedApplicantForInvite && ( // Kiểm tra selectedApplicantForInvite thay vì selectedApplicantForInvite.candidateId
        <InviteDialog
            open={openInviteDialog}
            onClose={handleCloseInviteDialog}
            onSubmit={handleInviteSubmit}
            applicantName={selectedApplicantForInvite.candidateId?.fullName}
            availableTests={availableTests}
            loadingTests={loadingTests}
        />
      )}
      {selectedApplicantForEvaluation && ( // Kiểm tra selectedApplicantForEvaluation
        <EvaluateApplicantDialog
            open={openEvaluateDialog}
            onClose={handleCloseEvaluateDialog}
            onSubmit={handleEvaluateSubmit}
            applicantName={selectedApplicantForEvaluation.candidateId?.fullName}
            currentEvaluation={selectedApplicantForEvaluation.currentEvaluation}
            loading={evaluationLoading} // Loading riêng cho dialog đánh giá
        />
      )}
      {selectedApplicantForCoverLetter && (
        <ViewCoverLetterDialog
            open={openViewCoverLetterDialog}
            onClose={handleCloseViewCoverLetterDialog}
            applicantName={selectedApplicantForCoverLetter.candidateId?.fullName}
            coverLetterContent={selectedApplicantForCoverLetter.coverLetter}
        />
      )}
      {/* Bỏ SendTestDialog riêng biệt vì đã gộp vào InviteDialog */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApplicantsPage;
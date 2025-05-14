// src/pages/employer/ApplicantsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';

// Import Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentIcon from '@mui/icons-material/Assignment';

const applicantStatuses = [
    'Đã nộp', 'Đã xem', 'Phù hợp', 'Mời phỏng vấn', 'Trúng tuyển', 'Từ chối', 'Đã gửi bài test'
];

const getApplicantStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'mời phỏng vấn': case 'trúng tuyển': case 'phù hợp': return 'success';
    case 'đã xem': return 'info';
    case 'từ chối': return 'error';
    case 'đã gửi bài test': return 'secondary';
    case 'đã nộp': default: return 'primary';
  }
};

const formatShortDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
           date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const API_DOMAIN = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5001';

function ApplicantsPage() {
  const { jobId } = useParams();
  const { authState } = useAuth();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(null);
  const [jobDetailsForTitle, setJobDetailsForTitle] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // States for Dialogs
  const [openViewProfileDialog, setOpenViewProfileDialog] = useState(false);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedApplicantForInvite, setSelectedApplicantForInvite] = useState(null);
  const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  const [selectedApplicantForEvaluation, setSelectedApplicantForEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [openViewCoverLetterDialog, setOpenViewCoverLetterDialog] = useState(false);
  const [selectedApplicantForCoverLetter, setSelectedApplicantForCoverLetter] = useState(null);
  const [jobAssociatedTests, setJobAssociatedTests] = useState([]);
  const [openSendTestDialog, setOpenSendTestDialog] = useState(false);
  const [selectedApplicantForTest, setSelectedApplicantForTest] = useState(null);
  const [selectedTestToSend, setSelectedTestToSend] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      console.log(`[ApplicantsPage] Initiating data load. JobId: ${jobId}, User ID: ${authState.user?.id}`);
      setLoading(true); // Set loading to true at the beginning of data fetching
      setError(null);
      setApplicants([]);
      setJobDetailsForTitle(null);
      setJobAssociatedTests([]);

      try {
        if (jobId) {
          console.log(`[ApplicantsPage] Fetching data for specific job ID: ${jobId}`);
          const [jobDetailRes, appsRes] = await Promise.all([
            apiService.getJobDetailsApi(jobId),
            apiService.getApplicantsForJobApi(jobId)
          ]);

          if (jobDetailRes?.data) {
            setJobDetailsForTitle(jobDetailRes.data);
            if (jobDetailRes.data.associatedTests && Array.isArray(jobDetailRes.data.associatedTests)) {
              setJobAssociatedTests(jobDetailRes.data.associatedTests.filter(t => t && (t._id || t.testId) && t.name && t.link));
            }
            console.log("[ApplicantsPage] Job details fetched:", jobDetailRes.data);
          } else {
            console.warn(`[ApplicantsPage] No job details found for Job ID: ${jobId}`);
            setError(`Không tìm thấy thông tin cho Job ID: ${jobId}`);
          }

          if (appsRes && Array.isArray(appsRes.data)) {
            setApplicants(appsRes.data);
            console.log("[ApplicantsPage] Applicants for specific job fetched:", appsRes.data.length);
          } else {
            console.warn("[ApplicantsPage] No applicants data or invalid format for specific job.");
            setError(prevError => prevError ? `${prevError} Và không có dữ liệu ứng viên.` : "Không có dữ liệu ứng viên hoặc định dạng không hợp lệ.");
          }
        } else {
          console.log("[ApplicantsPage] Fetching all applicants for employer.");
          const appsRes = await apiService.getAllApplicantsForEmployerApi();
          if (appsRes && Array.isArray(appsRes.data)) {
            setApplicants(appsRes.data);
            console.log("[ApplicantsPage] All applicants fetched:", appsRes.data.length);
          } else {
            console.warn("[ApplicantsPage] No applicants data or invalid format for all applicants.");
            setError("Không có dữ liệu ứng viên hoặc định dạng không hợp lệ.");
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải dữ liệu ứng viên.";
        console.error("[ApplicantsPage] Error loading data:", errorMsg, err);
        setError(errorMsg);
      } finally {
        console.log("[ApplicantsPage] Data loading process finished. Setting loading to false.");
        setLoading(false); // Crucial: Ensure loading is set to false in all cases
      }
    };

    // Only load data if authentication is complete and user is available
    if (!authState.isLoading && authState.isAuthenticated && authState.user?.id) {
      loadData();
    } else if (!authState.isLoading && !authState.isAuthenticated) {
      setError("Vui lòng đăng nhập để xem danh sách ứng viên.");
      setLoading(false); // Also set loading to false if not authenticated
    }
    // If authState.isLoading is true, loading spinner will be shown due to initial state of `loading`
  }, [jobId, authState.isAuthenticated, authState.isLoading, authState.user?.id]);


  // --- Các hàm handlers (handleCloseSnackbar, handleStatusChange, v.v...) ---
  // Giữ nguyên các hàm handlers này như bạn đã có, chúng không ảnh hưởng trực tiếp đến lỗi "loading mãi"
  // trừ khi một trong số chúng set `loading` thành true và không bao giờ set lại false.
  // Tuy nhiên, các hàm này thường quản lý state loading riêng của chúng (ví dụ: `updatingStatusId`, `evaluationLoading`).

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleStatusChange = async (applicationId, newStatus) => {
     if (!applicationId) return;
     setUpdatingStatusId(applicationId);
     try {
         const response = await apiService.updateApplicationStatusApi(applicationId, { status: newStatus });
         const updatedAppFromServer = response.data?.application;
         setApplicants(prevApps => prevApps.map(app =>
             (app._id || app.applicationId) === applicationId ? { ...app, status: updatedAppFromServer.status } : app
         ));
         setSnackbar({open: true, message: response.data?.message || 'Cập nhật trạng thái thành công!', severity: 'success'});
     } catch(err) {
          const errorMsg = err.response?.data?.message || 'Lỗi! Không thể cập nhật trạng thái.';
          setSnackbar({open: true, message: errorMsg, severity: 'error'});
     } finally {
         setUpdatingStatusId(null);
     }
  };

  const handleOpenViewProfileDialog = async (candidateId) => {
    if (!candidateId) {
        setSnackbar({ open: true, message: 'Không có thông tin ID ứng viên.', severity: 'warning'});
        return;
    }
    setOpenViewProfileDialog(true);
    setLoadingProfile(true);
    try {
        const appData = applicants.find(app => (app.candidateId?._id || app.candidateId?.id) === candidateId);
        if (appData && appData.candidateId) {
            setSelectedCandidateProfile(appData.candidateId);
        } else {
            setSnackbar({ open: true, message: 'Không tìm thấy thông tin chi tiết ứng viên.', severity: 'warning'});
            handleCloseViewProfileDialog();
        }
    } catch (err) {
        setSnackbar({ open: true, message: 'Lỗi! Không thể tải hồ sơ chi tiết.', severity: 'error'});
        handleCloseViewProfileDialog();
    }
    finally { setLoadingProfile(false); }
  };
  const handleCloseViewProfileDialog = () => {
      setOpenViewProfileDialog(false);
      setTimeout(() => setSelectedCandidateProfile(null), 300);
  };

  const handleOpenInviteDialog = (applicant) => {
    if (!applicant || !applicant.candidateId) {
        setSnackbar({ open: true, message: 'Không đủ thông tin ứng viên để mời.', severity: 'warning'});
        return;
    }
    setSelectedApplicantForInvite(applicant);
    setOpenInviteDialog(true);
  };
  const handleCloseInviteDialog = () => {
    setOpenInviteDialog(false);
    setTimeout(() => setSelectedApplicantForInvite(null), 300);
  };
  const handleInviteSubmit = async (inviteDataFromDialog) => {
    console.log("[ApplicantsPage] handleInviteSubmit called with data:", inviteDataFromDialog);
    console.log("[ApplicantsPage] Current selectedApplicantForInvite:", selectedApplicantForInvite);

    if (!selectedApplicantForInvite || !selectedApplicantForInvite._id) {
        setSnackbar({ open: true, message: 'Chưa chọn ứng viên hoặc ứng viên không hợp lệ.', severity: 'error' });
        return Promise.reject("No valid applicant selected");
    }

    const appId = selectedApplicantForInvite._id; // Lấy _id từ MongoDB
    const candidateName = selectedApplicantForInvite.candidateId?.fullName || 'Ứng viên này'; // Lấy tên ứng viên

    if (inviteDataFromDialog.inviteType === 'Phỏng vấn') {
        // Chuẩn bị payload cho API
        const schedulePayload = {
            // interviewDate: new Date(inviteDataFromDialog.dateTime).toISOString(), // Chuyển thành ISO string nếu backend cần
            interviewDate: inviteDataFromDialog.dateTime, // Hoặc để backend tự xử lý datetime-local string
            interviewType: inviteDataFromDialog.inviteType, // "Phỏng vấn"
            location: inviteDataFromDialog.location,
            link: inviteDataFromDialog.link,
            notes: inviteDataFromDialog.notes
        };
        console.log(`[ApplicantsPage] Scheduling interview for app ${appId} with payload:`, schedulePayload);

        // Gọi API mới
        try {
            // setIsSubmitting(true); // Bạn đang quản lý isSubmitting trong InviteDialog, có thể không cần ở đây
            const response = await apiService.scheduleInterviewApi(appId, schedulePayload);
            const updatedAppFromServer = response.data?.application;
            console.log("[ApplicantsPage] API scheduleInterviewApi response:", response.data);

            if (updatedAppFromServer) {
                // Cập nhật lại danh sách applicants trên UI
                setApplicants(prevApps => prevApps.map(app =>
                    (app._id || app.applicationId) === appId ? { ...app, ...updatedAppFromServer } : app
                ));
                setSnackbar({ open: true, message: response.data.message || `Đã lên lịch phỏng vấn cho ${candidateName}.`, severity: 'success' });
                handleCloseInviteDialog(); // Đóng dialog
                return Promise.resolve(response.data);
            } else {
                throw new Error("Phản hồi từ server không hợp lệ sau khi lên lịch.");
            }

        } catch (err) {
            console.error("[ApplicantsPage] Error scheduling interview:", err.response?.data || err.message || err);
            const errorMsg = err.response?.data?.message || `Lỗi! Không thể lên lịch phỏng vấn cho ${candidateName}.`;
            setSnackbar({ open: true, message: errorMsg, severity: 'error' });
            return Promise.reject(err);
        } finally {
            // setIsSubmitting(false);
        }
    } else if (inviteDataFromDialog.inviteType === 'Test') {
        // Logic gửi test (như hiện tại hoặc bạn sẽ điều chỉnh sau)
        console.log(`[ApplicantsPage] Sending test for app ${appId}`);
        try {
            // Giả sử bạn vẫn cập nhật status khi gửi test
            await apiService.updateApplicationStatusApi(appId, { status: 'Đã gửi bài test' });
            setApplicants(prevApps => prevApps.map(app =>
                (app._id || app.applicationId) === appId ? { ...app, status: 'Đã gửi bài test' } : app
            ));
            setSnackbar({ open: true, message: `Đã cập nhật trạng thái "Đã gửi bài test" cho ${candidateName}.`, severity: 'success'});
            handleCloseInviteDialog();
            return Promise.resolve(true);
        } catch (err) {
            console.error("[ApplicantsPage] Error updating status for test:", err.response?.data || err.message || err);
            const errorMsg = err.response?.data?.message || `Lỗi! Không thể cập nhật trạng thái gửi test.`;
            setSnackbar({ open: true, message: errorMsg, severity: 'error'});
            return Promise.reject(err);
        }
    }
};

  const handleOpenEvaluateDialog = (applicant) => {
    if (!applicant || !applicant.candidateId) {
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
        const response = await apiService.evaluateApplicationApi(appId, evaluationData);
        if (response.data && response.data.application) {
            const updatedAppFromServer = response.data.application;
            setApplicants(prevApps => prevApps.map(app =>
                app._id === appId ? { ...app, evaluation: updatedAppFromServer.evaluation, status: updatedAppFromServer.status } : app
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
        const fullCvUrl = cvRelativeUrl.startsWith('http') ? cvRelativeUrl : `${API_DOMAIN}${cvRelativeUrl}`;
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

  const handleOpenSendTestDialog = (applicant) => {
    if (!jobId || jobAssociatedTests.length === 0) {
        setSnackbar({ open: true, message: 'Chức năng gửi test chỉ khả dụng khi xem ứng viên của một vị trí cụ thể đã được gán bài test.', severity: 'info' });
        return;
    }
    if (!applicant || !applicant.candidateId) {
        setSnackbar({ open: true, message: 'Không đủ thông tin ứng viên để gửi test.', severity: 'warning'});
        return;
    }
    setSelectedApplicantForTest(applicant);
    setSelectedTestToSend(jobAssociatedTests[0]?._id || jobAssociatedTests[0]?.testId || '');
    setOpenSendTestDialog(true);
  };
  const handleCloseSendTestDialog = () => {
    setOpenSendTestDialog(false);
    setTimeout(() => { setSelectedApplicantForTest(null); setSelectedTestToSend(''); }, 300);
  };
  const handleSelectTestRadioChange = (event) => { setSelectedTestToSend(event.target.value); };
  const handleSendTestSubmit = async () => {
    if (!selectedTestToSend || !selectedApplicantForTest || !selectedApplicantForTest.candidateId) return;
    const selectedTestObject = jobAssociatedTests.find(t => (t._id || t.testId) === selectedTestToSend);
    if (!selectedTestObject) {
        setSnackbar({ open: true, message: 'Lỗi: Bài test đã chọn không hợp lệ.', severity: 'error'});
        return;
    }
    const appId = selectedApplicantForTest._id || selectedApplicantForTest.applicationId;
    const candidateName = selectedApplicantForTest.candidateId.fullName;

    setSendingTest(true);
    try {
        console.warn("handleSendTestSubmit: Cần API để gửi bài test cho ứng viên.");
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        handleStatusChange(appId, 'Đã gửi bài test');
        setSnackbar({ open: true, message: `Đã gửi bài test "${selectedTestObject.name}" cho ${candidateName}.`, severity: 'success'});
        handleCloseSendTestDialog();
    } catch (err) {
        setSnackbar({ open: true, message: `Lỗi! Không thể gửi bài test. (${err.message || ''})`, severity: 'error'});
    } finally {
        setSendingTest(false);
    }
  };
  // --- Kết thúc các hàm handlers ---

  const renderPageTitle = () => {
    if (jobId && jobDetailsForTitle) {
      return (
        <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
          Ứng viên cho vị trí: <Link component={RouterLink} to={`/jobs/${jobId}`} underline="hover">{jobDetailsForTitle.title}</Link>
        </Typography>
      );
    }
    if (!jobId) {
        return <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>Tất cả ứng viên</Typography>;
    }
    // Nếu đang loading ban đầu hoặc có lỗi khi có jobId, không hiển thị tiêu đề này vội
    // (LoadingSpinner hoặc Alert sẽ được hiển thị bởi logic render chính)
    return null; 
  };

  // --- Phần Render chính ---
  if (loading) { // Hiển thị spinner nếu loading là true
    return <LoadingSpinner />;
  }

  if (error) { // Hiển thị lỗi nếu có lỗi và không còn loading
    return (
        <Box>
            {renderPageTitle()} {/* Vẫn hiển thị tiêu đề nếu có thể */}
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </Box>
    );
  }

  return (
    <Box>
      {renderPageTitle()}
      {!jobId && ( // Chỉ hiển thị mô tả này khi xem tất cả ứng viên
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Danh sách tất cả ứng viên đã ứng tuyển vào các vị trí của bạn.
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 750 }} aria-label="Applicants table">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{width: '20%'}}>Ứng viên</TableCell>
              {!jobId && (
                <TableCell sx={{width: '20%'}}>Vị trí ứng tuyển</TableCell>
              )}
              <TableCell sx={{width: jobId ? '15%' : '10%'}}>Ngày ứng tuyển</TableCell>
              <TableCell align="center" sx={{width: jobId ? '20%' : '15%'}}>Trạng thái</TableCell>
              <TableCell align="center" sx={{width: '10%'}}>CV</TableCell>
              <TableCell align="center" sx={{width: jobId ? '30%' : '25%'}}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.length > 0 ? (
              applicants.map((app) => {
                  const currentAppId = app._id || app.applicationId;
                  const candidateInfo = app.candidateId;
                  const jobInfoForApplicant = app.jobId;
                  const isCurrentActionLoading = updatingStatusId === currentAppId;

                  return (
                      <TableRow key={currentAppId} hover>
                          <TableCell component="th" scope="row">
                              {candidateInfo?.fullName || 'N/A'}
                              {candidateInfo?.email && <Typography variant="caption" display="block" color="text.secondary">{candidateInfo.email}</Typography>}
                          </TableCell>

                          {!jobId && (
                              <TableCell>
                                {jobInfoForApplicant ? (
                                  <Link component={RouterLink} to={`/jobs/${jobInfoForApplicant._id}`} underline="hover">
                                    {jobInfoForApplicant.title}
                                  </Link>
                                ) : ('N/A')}
                                {jobInfoForApplicant?.companyName && <Typography variant="caption" display="block" color="text.secondary">{jobInfoForApplicant.companyName}</Typography>}
                              </TableCell>
                          )}

                          <TableCell>{formatShortDateTime(app.createdAt)}</TableCell>
                          <TableCell align="center">
                              <FormControl variant="standard" size="small" sx={{ minWidth: 140 }}>
                                  <Select
                                      value={app.status}
                                      onChange={(e) => handleStatusChange(currentAppId, e.target.value)}
                                      disabled={isCurrentActionLoading}
                                      renderValue={(selectedValue) => (
                                          isCurrentActionLoading ?
                                          <CircularProgress size={20} sx={{mx: 'auto', display:'block'}}/> :
                                          <Chip label={selectedValue} color={getApplicantStatusColor(selectedValue)} size="small" sx={{width: '100%'}} />
                                      )}
                                      sx={{ '.MuiSelect-select': { p: 0.5, fontSize: '0.875rem' } , '.MuiSelect-select:focus': { backgroundColor: 'transparent' } }}
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
                              <Stack direction="row" spacing={0.2} justifyContent="center" flexWrap="wrap">
                                  <Tooltip title="Xem hồ sơ">
                                      <IconButton size="small" onClick={() => handleOpenViewProfileDialog(candidateInfo?._id)} disabled={!candidateInfo || isCurrentActionLoading} >
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
                                  {jobId && jobAssociatedTests.length > 0 && (
                                      <Tooltip title="Gửi bài test">
                                          <span>
                                              <IconButton size="small" color="secondary" onClick={() => handleOpenSendTestDialog(app)} disabled={isCurrentActionLoading} >
                                                  <AssignmentIcon fontSize='small'/>
                                              </IconButton>
                                          </span>
                                      </Tooltip>
                                  )}
                                  <Tooltip title={`Đánh giá ${candidateInfo?.fullName || 'Ứng viên'}`}>
                                    <IconButton size="small" sx={{color: '#673ab7'}} onClick={() => handleOpenEvaluateDialog(app)} disabled={isCurrentActionLoading}>
                                       <RateReviewIcon fontSize='small'/>
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={`Mời ${candidateInfo?.fullName || 'Ứng viên'}`}>
                                      <IconButton size="small" color="primary" onClick={() => handleOpenInviteDialog(app)} disabled={isCurrentActionLoading} >
                                          <MailOutlineIcon fontSize='small'/>
                                      </IconButton>
                                  </Tooltip>
                              </Stack>
                          </TableCell>
                      </TableRow>
                  );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={jobId ? 5 : 6} align="center">
                  {jobId ? 'Chưa có ứng viên nào cho vị trí này.' : 'Chưa có ứng viên nào ứng tuyển vào các vị trí của bạn.'}
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
            loading={loadingProfile}
       />
      )}
      {selectedApplicantForInvite && selectedApplicantForInvite.candidateId && (
        <InviteDialog
            open={openInviteDialog}
            onClose={handleCloseInviteDialog}
            onSubmit={handleInviteSubmit}
            applicantName={selectedApplicantForInvite.candidateId.fullName}
        />
      )}
      {selectedApplicantForEvaluation && selectedApplicantForEvaluation.candidateId && (
        <EvaluateApplicantDialog
            open={openEvaluateDialog}
            onClose={handleCloseEvaluateDialog}
            onSubmit={handleEvaluateSubmit}
            applicantName={selectedApplicantForEvaluation.candidateId.fullName}
            currentEvaluation={selectedApplicantForEvaluation.currentEvaluation}
            loading={evaluationLoading}
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
      {jobId && selectedApplicantForTest && selectedApplicantForTest.candidateId && (
        <Dialog open={openSendTestDialog} onClose={handleCloseSendTestDialog} maxWidth="xs" fullWidth>
            <DialogTitle>Gửi bài test cho {selectedApplicantForTest.candidateId.fullName}</DialogTitle>
            <DialogContent>
                {jobAssociatedTests.length === 0 ? ( <Typography color="text.secondary" sx={{mt: 2}}>Công việc này chưa được gán bài test nào.</Typography> )
                : (
                    <FormControl component="fieldset" sx={{mt: 1, width: '100%'}}>
                        <FormLabel component="legend">Chọn bài test để gửi:</FormLabel>
                        <RadioGroup value={selectedTestToSend} onChange={handleSelectTestRadioChange} >
                            {jobAssociatedTests.map((test) => (
                                <FormControlLabel
                                    key={test.testId || test._id}
                                    value={test.testId || test._id}
                                    control={<Radio size="small"/>}
                                    label={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                            {test.name}
                                            {test.link && (
                                                <Tooltip title={`Mở link test: ${test.link}`} sx={{ml: 0.5}}>
                                                    <Link href={test.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                        <LinkIcon sx={{fontSize: '1rem', verticalAlign:'middle', color:'text.secondary'}}/>
                                                    </Link>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    }
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions sx={{pb: 2, pr: 2}}>
                <Button onClick={handleCloseSendTestDialog} color="inherit" disabled={sendingTest}>Hủy</Button>
                <Button onClick={handleSendTestSubmit} variant="contained" disabled={!selectedTestToSend || sendingTest || jobAssociatedTests.length === 0} startIcon={sendingTest ? <CircularProgress size={16} color="inherit"/> : null} >
                    Gửi
                </Button>
            </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApplicantsPage;

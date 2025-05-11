// src/pages/employer/ApplicantsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom'; // useParams sẽ dùng sau
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import EvaluateApplicantDialog from '../../components/employer/EvaluateApplicantDialog';
// Đảm bảo đường dẫn này đúng với nơi bạn lưu mock data và hàm fetch
import {
  fetchApplicantsForJob,
  updateApplicantStatus,
  fetchEmployerJobDetail,
  fetchEmployerTests,
  sendTestToApplicant,
  sendInterviewInvite,
  fetchCandidateDetailsForEmployer   // Hàm này có trong file data không?
} from '../../data/mockJobs';
import InviteDialog from '../../components/employer/InviteDialog';
import ViewProfileDialog from '../../components/employer/ViewProfileDialog';

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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress'; // Thêm import này
import Stack from '@mui/material/Stack'; // <<< THÊM DÒNG NÀY
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import { Dialog } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
// Import Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LinkIcon from '@mui/icons-material/Link'; // Thêm icon link
import RateReviewIcon from '@mui/icons-material/RateReview';

// Trạng thái ứng viên (ví dụ)
const applicantStatuses = ['Mới', 'Đã xem', 'Phù hợp', 'Không phù hợp', 'Mời phỏng vấn', 'Từ chối','Đã gửi bài test'];

// Helper lấy màu Chip cho trạng thái ứng viên
const getApplicantStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'mời phỏng vấn': return 'success';
    case 'phù hợp': return 'primary';
    case 'không phù hợp': case 'từ chối': return 'error';
    case 'đã xem': return 'warning';
    case 'mới': default: return 'info';
    case 'đã gửi bài test': return 'secondary';
  }
};

// Hàm format ngày giờ đơn giản (có thể import từ file utils)
const formatShortDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
           date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};


function ApplicantsPage() {
  const { jobId } = useParams(); // Sẽ dùng khi tích hợp route động
  const { authState } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null); // <<< THÊM STATE NÀY
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingStatusId, setUpdatingStatusId] = useState(null); // ID của application đang đổi status
    // === State cho việc gửi test ===
    const [jobAssociatedTests, setJobAssociatedTests] = useState([]); // Danh sách các object test
    const [loadingAssociatedTests, setLoadingAssociatedTests] = useState(false);
    const [openSendTestDialog, setOpenSendTestDialog] = useState(false);
    const [selectedApplicantForTest, setSelectedApplicantForTest] = useState(null);
    const [selectedTestToSend, setSelectedTestToSend] = useState(''); // Lưu testId
    const [sendingTest, setSendingTest] = useState(false); // Loading cho nút gửi trong Dialog
    // === Kết thúc State ===
  // === State mới cho Dialog Mời ===
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedApplicantForInvite, setSelectedApplicantForInvite] = useState(null);
  // === Kết thúc State mới ===
    // === State mới cho Dialog Xem Profile ===
    const [openViewProfileDialog, setOpenViewProfileDialog] = useState(false);
    const [selectedCandidateProfile, setSelectedCandidateProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false); // Loading riêng cho profile dialog
    // === Kết thúc State mới ===
      // --- STATE MỚI CHO DIALOG ĐÁNH GIÁ ---
  const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  const [selectedApplicantForEvaluation, setSelectedApplicantForEvaluation] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false); // Loading riêng cho việc lưu đánh giá
  // --- KẾT THÚC STATE MỚI ---
  useEffect(() => {
    const loadData = async () => {
      if (!jobId) {
          setError("Không có ID công việc để tải ứng viên.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
          // Gọi song song API lấy chi tiết job và danh sách ứng viên
          const [jobDetailRes, applicantsRes] = await Promise.all([
              apiService.getJobDetailsApi(jobId), // Lấy chi tiết job để hiển thị tên job
              apiService.getApplicantsForJobApi(jobId) // Lấy danh sách ứng viên
          ]);

          if (jobDetailRes?.data) {
               setJobDetails(jobDetailRes.data);
          } else {
               console.warn(`Không tìm thấy chi tiết job ID: ${jobId}`);
               setJobDetails(null); // Hoặc set một object mặc định
          }

          if (applicantsRes && Array.isArray(applicantsRes.data)) {
              setApplicants(applicantsRes.data);
          } else {
              console.error("Applicant API response is not an array:", applicantsRes);
              setApplicants([]);
              setError("Dữ liệu ứng viên trả về không hợp lệ.");
          }

      } catch (err) {
         console.error("Lỗi khi tải dữ liệu trang ứng viên:", err);
         const errorMsg = err.response?.data?.message || err.message || "Không thể tải dữ liệu trang ứng viên.";
         setError(errorMsg);
         setApplicants([]);
         setJobDetails(null);
      } finally {
          setLoading(false);
      }
    };
    loadData();
  }, [jobId]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Xử lý thay đổi trạng thái ứng viên
  const handleStatusChange = async (applicationId, newStatus) => {
    if (!applicationId) return;
    setUpdatingStatusId(applicationId);
    setSnackbar({ ...snackbar, open: false });
    try {
        // <<< GỌI API UPDATE STATUS >>>
        const response = await apiService.updateApplicationStatusApi(applicationId, { status: newStatus });
        const updatedApp = response.data?.application;

        // Cập nhật state applicants
        setApplicants(prevApps => prevApps.map(app =>
            (app._id || app.applicationId) === applicationId ? { ...app, status: updatedApp.status } : app // Cập nhật status từ response
        ));
        setSnackbar({open: true, message: response.data?.message || 'Cập nhật trạng thái thành công!', severity: 'success'});

    } catch(err) {
         console.error("Lỗi khi cập nhật trạng thái:", err);
         const errorMsg = err.response?.data?.message || 'Lỗi! Không thể cập nhật trạng thái.';
         setSnackbar({open: true, message: errorMsg, severity: 'error'});
    } finally {
        setUpdatingStatusId(null);
    }
 };
    // === Handlers cho Dialog Gửi Test ===
    const handleOpenSendTestDialog = (applicant) => {
      setSelectedApplicantForTest(applicant);
      setSelectedTestToSend('');
      setOpenSendTestDialog(true);
      setSnackbar({...snackbar, open: false});
    };
    const handleCloseSendTestDialog = () => {
      setOpenSendTestDialog(false);
      setTimeout(() => setSelectedApplicantForTest(null), 300); // Reset sau khi dialog đóng hẳn
    };
    const handleSelectTestRadioChange = (event) => { setSelectedTestToSend(event.target.value); };
    const handleSendTestSubmit = async () => {
      if (!selectedTestToSend || !selectedApplicantForTest) return;
      const selectedTestObject = jobAssociatedTests.find(t => t.testId === selectedTestToSend);
      if (!selectedTestObject) { setSnackbar({ open: true, message: 'Lỗi: Test không hợp lệ.', severity: 'error'}); return; }
  
      setSendingTest(true); setSnackbar({...snackbar, open: false});
      try {
          const updatedApp = await sendTestToApplicant(
              authState.user.id, selectedApplicantForTest.applicationId,
              selectedTestObject.testId, selectedTestObject.link,
              selectedTestObject.name, selectedApplicantForTest.candidateName
          );
          setApplicants(prevApps => prevApps.map(app => app.applicationId === selectedApplicantForTest.applicationId ? updatedApp : app ));
          setSnackbar({ open: true, message: `Đã gửi bài test "${selectedTestObject.name}" cho ${selectedApplicantForTest.candidateName}.`, severity: 'success'});
          handleCloseSendTestDialog();
      } catch (err) { /* ... Set Snackbar Lỗi ... */ }
      finally { setSendingTest(false); }
    };
   // === Kết thúc Handlers Dialog ===
  // --- Các handler cho nút actions (placeholder) ---
  /*const handleViewProfile = (candidateId, profileUrl) => {
      console.log("View profile:", candidateId, profileUrl);
      setSnackbar({open: true, message: `Chức năng xem profile ${candidateId} sẽ làm sau.`, severity: 'info'});
  };*/
  const handleViewCV = (cvUrl) => {
       console.log("View CV:", cvUrl);
       if (cvUrl && cvUrl !== '#') window.open(cvUrl, '_blank');
       else setSnackbar({open: true, message: 'Không có link CV.', severity: 'warning'});
  };
   const handleInvite = (applicationId, candidateName) => {
       console.log("Invite:", applicationId, candidateName);
       setSnackbar({open: true, message: `Chức năng mời ${candidateName} sẽ làm sau.`, severity: 'info'});
   };
  // === Handlers mới cho Dialog Mời ===
  const handleOpenInviteDialog = (applicant) => {
    setSelectedApplicantForInvite(applicant);
    setOpenInviteDialog(true);
    setSnackbar({...snackbar, open: false});
  };

  const handleCloseInviteDialog = () => {
    setOpenInviteDialog(false);
     // Reset sau khi dialog đóng để tránh lỗi khi title đang render
    setTimeout(() => setSelectedApplicantForInvite(null), 300);
  };

  // Hàm này được truyền vào onSubmit của InviteDialog
  const handleInviteSubmit = async (inviteData) => {
    if (!selectedApplicantForInvite) return Promise.reject("No applicant selected"); // Thêm Promise.reject để finally chạy

    console.log("Submitting Invite:", inviteData);
    // Không cần setLoading riêng vì Dialog đã có isSubmitting
    setSnackbar({...snackbar, open: false});

    try {
        const updatedApp = await sendInterviewInvite(
            authState.user.id,
            selectedApplicantForInvite.applicationId,
            inviteData
        );
        // Cập nhật trạng thái ứng viên trong state applicants
        setApplicants(prevApps => prevApps.map(app =>
            app.applicationId === selectedApplicantForInvite.applicationId ? updatedApp : app
        ));
        setSnackbar({ open: true, message: `Đã gửi lời mời ${inviteData.inviteType.toLowerCase()} cho ${selectedApplicantForInvite.candidateName}.`, severity: 'success'});
        handleCloseInviteDialog(); // Đóng dialog
        return Promise.resolve(true); // Trả về resolve để finally trong dialog chạy đúng
    } catch (err) {
         console.error("Lỗi khi gửi lời mời:", err);
         setSnackbar({ open: true, message: `Lỗi! Không thể gửi lời mời. (${err.message})`, severity: 'error'});
         // Không đóng dialog khi lỗi để người dùng thử lại hoặc hủy
         return Promise.reject(err); // Trả về reject để finally chạy đúng
    }
    // finally trong dialog sẽ tự set submitting thành false
  };
  // === Kết thúc Handlers Dialog Mời ===
// === Handlers mới cho Dialog Xem Profile ===
const handleOpenViewProfileDialog = async (candidateId) => {
  if (!candidateId) return;
  setSnackbar({...snackbar, open: false}); // Đóng snackbar cũ
  setSelectedCandidateProfile(null); // Xóa data cũ
  setOpenViewProfileDialog(true);
  setLoadingProfile(true);
  try {
      // Gọi hàm fetch chi tiết ứng viên giả lập
      const profileData = await fetchCandidateDetailsForEmployer(candidateId);
      if (profileData) {
          setSelectedCandidateProfile(profileData);
      } else {
          setSnackbar({ open: true, message: 'Không tìm thấy hồ sơ chi tiết cho ứng viên này.', severity: 'warning'});
          handleCloseViewProfileDialog(); // Đóng dialog nếu không có data
      }
  } catch (err) {
      console.error("Lỗi khi tải chi tiết hồ sơ:", err);
      setSnackbar({ open: true, message: 'Lỗi! Không thể tải chi tiết hồ sơ.', severity: 'error'});
      handleCloseViewProfileDialog(); // Đóng dialog khi lỗi
  } finally {
      setLoadingProfile(false);
  }
};

const handleCloseViewProfileDialog = () => {
  setOpenViewProfileDialog(false);
   // Có thể reset selectedCandidateProfile sau khi đóng hẳn
   // setTimeout(() => setSelectedCandidateProfile(null), 300);
};
// === Kết thúc Handlers mới ===
// --- HANDLERS MỚI CHO DIALOG ĐÁNH GIÁ ---
const handleOpenEvaluateDialog = (applicant) => {
  // Giả sử applicant object có chứa thông tin đánh giá hiện tại (nếu đã có)
  // Ví dụ: applicant.evaluation = { rating: 4, notes: 'Good candidate' }
  // Nếu chưa có API, bạn có thể tạm để currentEvaluation là null
  setSelectedApplicantForEvaluation({
      ...applicant,
      // Lấy đánh giá hiện tại từ applicant object nếu có, nếu không thì null
      // currentEvaluation: applicant.evaluation || null
      currentEvaluation: null // Tạm thời để null vì chưa có API/mock data
  });
  setOpenEvaluateDialog(true);
  setSnackbar({...snackbar, open: false}); // Đóng snackbar cũ
};

const handleCloseEvaluateDialog = () => {
  setOpenEvaluateDialog(false);
  // Reset sau khi dialog đóng để tránh lỗi title
  setTimeout(() => setSelectedApplicantForEvaluation(null), 300);
};

const handleEvaluateSubmit = async (evaluationData) => {
  if (!selectedApplicantForEvaluation) return;

  console.log("Submitting Evaluation:", selectedApplicantForEvaluation.applicationId, evaluationData);
  setEvaluationLoading(true);
  setSnackbar({...snackbar, open: false});

  // --- Gọi API Backend để lưu đánh giá (Placeholder) ---
  // Ví dụ: await api.submitEvaluation(selectedApplicantForEvaluation.applicationId, evaluationData);
  // Thay thế bằng hàm mock data nếu cần:
  // const success = await submitApplicantEvaluationMock(selectedApplicantForEvaluation.applicationId, evaluationData);

  // Giả lập thành công sau 1 giây
  await new Promise(resolve => setTimeout(resolve, 1000));
  const success = true; // Đặt là true để giả lập thành công

  if (success) {
       // Cập nhật state applicants nếu cần (ví dụ: thêm icon đã đánh giá)
       // setApplicants(prevApps => prevApps.map(app => ...));
       setSnackbar({ open: true, message: `Đã lưu đánh giá cho ${selectedApplicantForEvaluation.candidateName}.`, severity: 'success'});
       handleCloseEvaluateDialog(); // Đóng dialog
  } else {
       setSnackbar({ open: true, message: `Lỗi! Không thể lưu đánh giá.`, severity: 'error'});
       // Không đóng dialog khi lỗi
  }
  setEvaluationLoading(false);
};
// --- KẾT THÚC HANDLERS MỚI ---
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
        Quản lý ứng viên
      </Typography>
      {/* SỬA LẠI CÁCH HIỂN THỊ TITLE */}
      {jobDetails ? (
         <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Cho vị trí: {jobDetails.title} {/* <<< Lấy title từ state jobDetails */}
         </Typography>
      ) : !loading && ( // Chỉ hiển thị khi không loading và không tìm thấy job
          <Typography variant="subtitle1" color={error ? "error" : "text.secondary"} sx={{ mb: 3 }}>
            {error || `Đang tải thông tin job ID: ${jobId}...`}
         </Typography>
      )}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 750 }} aria-label="Applicants table"> {/* Tăng minWidth */}
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{width: '25%'}}>Ứng viên</TableCell> {/* Chia độ rộng cột */}
                <TableCell sx={{width: '20%'}}>Ngày ứng tuyển</TableCell>
                <TableCell align="center" sx={{width: '20%'}}>Trạng thái</TableCell>
                <TableCell align="center" sx={{width: '10%'}}>CV</TableCell>
                <TableCell align="center" sx={{width: '25%'}}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            {/* === BẮT ĐẦU SỬA TỪ ĐÂY === */}
              <TableBody>
                            {applicants.length > 0 ? (
                                applicants.map((app) => {
                                    // Lấy ID của Application (_id) làm key
                                    const currentAppId = app._id || app.applicationId;
                                    // Lấy object thông tin candidate đã được populate
                                    const candidateInfo = app.candidateId;
                                    // Kiểm tra xem có đang loading action cho dòng này không
                                    const isCurrentActionLoading = updatingStatusId === currentAppId; // Hoặc dùng actionLoading state nếu có

                                    return (
                                        <TableRow key={currentAppId} hover>
                                            {/* Cột Ứng viên: Truy cập qua candidateInfo */}
                                            <TableCell component="th" scope="row">
                                                {candidateInfo?.fullName || 'N/A'}
                                                {/* Có thể thêm email/phone nếu muốn và nếu đã populate */}
                                                {/* <Typography variant="caption" display="block">{candidateInfo?.email}</Typography> */}
                                            </TableCell>
                                            {/* Cột Ngày ứng tuyển: Dùng createdAt của Application */}
                                            <TableCell>
                                                {app.createdAt ? formatShortDateTime(app.createdAt) : 'N/A'}
                                            </TableCell>
                                            {/* Cột Trạng thái: Giữ nguyên logic Select, truyền currentAppId */}
                                            <TableCell align="center">
                                                <FormControl variant="standard" size="small" sx={{ minWidth: 130 }}>
                                                    <Select
                                                        value={app.status}
                                                        onChange={(e) => handleStatusChange(currentAppId, e.target.value)}
                                                        disabled={isCurrentActionLoading} // Dùng isCurrentActionLoading
                                                        renderValue={(selectedValue) => (
                                                            isCurrentActionLoading ?
                                                            <CircularProgress size={20} sx={{mx: 'auto', display:'block'}}/> :
                                                            <Chip label={selectedValue} color={getApplicantStatusColor(selectedValue)} size="small" sx={{width: '100%'}} />
                                                        )}
                                                        sx={{ '.MuiSelect-select': { p: 0.5 } , '.MuiSelect-select:focus': { backgroundColor: 'transparent' } }}
                                                    >
                                                        {applicantStatuses.map(statusOption => (
                                                            <MenuItem key={statusOption} value={statusOption}>
                                                                 <Chip label={statusOption} color={getApplicantStatusColor(statusOption)} size="small" sx={{width: '100%'}} />
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            {/* Cột CV: Dùng cvFileName và cvUrl từ Application */}
                                            <TableCell align="center">
                                                 <Tooltip title={app.cvFileName || "Xem CV"}>
                                                     <span>
                                                        <IconButton size="small" onClick={() => handleViewCV(app.cvUrl)} disabled={!app.cvUrl || app.cvUrl === '#'}>
                                                            <ArticleIcon fontSize='small'/>
                                                        </IconButton>
                                                     </span>
                                                 </Tooltip>
                                             </TableCell>
                                            {/* Cột Hành động: Truyền ID/object đúng vào các handler */}
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Xem hồ sơ tóm tắt">
                                                        {/* Truyền ID của Candidate */}
                                                        <IconButton size="small" onClick={() => handleOpenViewProfileDialog(candidateInfo?._id || candidateInfo?.id)} disabled={!candidateInfo} >
                                                            <VisibilityIcon fontSize='small'/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Gửi bài test">
                                                        <span>
                                                            {/* Truyền cả object 'app' vì dialog cần cả Application ID và Candidate Name */}
                                                            <IconButton size="small" color="secondary" onClick={() => handleOpenSendTestDialog(app)} disabled={isCurrentActionLoading /* || logic khác */} >
                                                                <AssignmentIcon fontSize='small'/>
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title={`Đánh giá ${candidateInfo?.fullName || 'Ứng viên'}`}>
                                                      {/* Truyền cả object 'app' */}
                                                      <IconButton size="small" color="info" onClick={() => handleOpenEvaluateDialog(app)} disabled={isCurrentActionLoading}>
                                                         <RateReviewIcon fontSize='small'/>
                                                      </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={`Mời ${candidateInfo?.fullName || 'Ứng viên'} phỏng vấn/test`}>
                                                        {/* Truyền cả object 'app' */}
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
                                    <TableCell colSpan={5} align="center"> {/* Cập nhật colSpan */}
                                        Chưa có ứng viên nào cho vị trí này.
                                    </TableCell>
                                </TableRow>
                            )}
              </TableBody>
                      {/* === KẾT THÚC SỬA === */}
          </Table>
        </TableContainer>
      )}
 {/* === THÊM DIALOG GỬI TEST === */}
 <Dialog open={openSendTestDialog} onClose={handleCloseSendTestDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Gửi bài test cho {selectedApplicantForTest?.candidateName}</DialogTitle>
        <DialogContent>
            {loadingAssociatedTests ? (
                <LoadingSpinner/>
            ) : jobAssociatedTests.length === 0 ? (
                 <Typography color="text.secondary" sx={{mt: 2}}>Tin tuyển dụng này chưa được gắn bài test nào.</Typography>
            ) : (
                <FormControl component="fieldset" sx={{mt: 1, width: '100%'}}>
                    <FormLabel component="legend">Chọn bài test để gửi:</FormLabel>
                    <RadioGroup
                        aria-label="select-test"
                        name="select-test-radio-group"
                        value={selectedTestToSend}
                        onChange={handleSelectTestRadioChange}
                    >
                        {jobAssociatedTests.map((test) => (
                             <FormControlLabel
                                key={test.testId}
                                value={test.testId} // Value là ID của test
                                control={<Radio size="small"/>}
                                // Label hiển thị tên và có icon link nhỏ
                                label={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                        {test.name}
                                        <Tooltip title={`Mở link test: ${test.link}`} sx={{ml: 0.5}}>
                                            <Link href={test.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <LinkIcon sx={{fontSize: '1rem', verticalAlign:'middle', color:'text.secondary'}}/>
                                            </Link>
                                        </Tooltip>
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
             <Button
                onClick={handleSendTestSubmit}
                variant="contained"
                disabled={!selectedTestToSend || loadingAssociatedTests || sendingTest}
                startIcon={sendingTest ? <CircularProgress size={16} color="inherit"/> : null}
             >
                Gửi
             </Button>
        </DialogActions>
      </Dialog>
      {/* === KẾT THÚC DIALOG === */}
      {/* === THÊM DIALOG MỜI PHỎNG VẤN/TEST === */}
      <InviteDialog
          open={openInviteDialog}
          onClose={handleCloseInviteDialog}
          onSubmit={handleInviteSubmit}
          applicantName={selectedApplicantForInvite?.candidateName}
      />
      {/* === KẾT THÚC DIALOG MỜI === */}
      {/* Snackbar */}
            {/* === THÊM DIALOG XEM PROFILE === */}
            <ViewProfileDialog
            open={openViewProfileDialog}
            onClose={handleCloseViewProfileDialog}
            candidateData={selectedCandidateProfile}
            loading={loadingProfile}
       />
      {/* === KẾT THÚC DIALOG XEM PROFILE === */}
       {/* === THÊM DIALOG ĐÁNH GIÁ === */}
  {selectedApplicantForEvaluation && ( // Render dialog chỉ khi có applicant được chọn
    <EvaluateApplicantDialog
        open={openEvaluateDialog}
        onClose={handleCloseEvaluateDialog}
        onSubmit={handleEvaluateSubmit}
        applicantName={selectedApplicantForEvaluation?.candidateName}
        // Truyền đánh giá hiện tại nếu có (lấy từ selectedApplicantForEvaluation)
        currentEvaluation={selectedApplicantForEvaluation?.currentEvaluation || null}
        loading={evaluationLoading} // Truyền trạng thái loading
    />
  )}
  {/* === KẾT THÚC DIALOG ĐÁNH GIÁ === */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Box>
  );
}

export default ApplicantsPage;
// src/pages/employer/ApplicantsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom'; // useParams sẽ dùng sau
import { useAuth } from '../../contexts/AuthContext';
import EvaluateApplicantDialog from '../../components/employer/EvaluateApplicantDialog'; // <<< THÊM IMPORT NÀY
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
        if (!authState.user?.id || !jobId) { setLoading(false); setError("..."); return; };
        setLoading(true); setError(null); setJobAssociatedTests([]);
        try {
          const [jobData, applicantData] = await Promise.all([
              fetchEmployerJobDetail(authState.user.id, jobId),
              fetchApplicantsForJob(authState.user.id, jobId)
          ]);
  
          if (jobData) {
              setJobDetails(jobData);
              // Fetch chi tiết các bài test được gắn vào job này
              if (jobData.associatedTestIds && jobData.associatedTestIds.length > 0) {
                  setLoadingAssociatedTests(true);
                  try {
                      const allTests = await fetchEmployerTests(authState.user.id); // Fetch all tests
                      const associatedTestsDetails = allTests.filter(test =>
                          jobData.associatedTestIds.includes(test.testId) // Lọc ra các test được gắn
                      );
                      setJobAssociatedTests(associatedTestsDetails);
                  } catch (testErr) { console.error("Lỗi tải chi tiết bài test:", testErr); }
                   finally { setLoadingAssociatedTests(false); }
              }
          } else { console.warn(`Không tìm thấy job ID: ${jobId}`); }
          setApplicants(Array.isArray(applicantData) ? applicantData : []);
        } catch (err) { /* ... */ setError("..."); }
        finally { setLoading(false); }
      };
      loadData();
    }, [authState.user?.id, jobId]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Xử lý thay đổi trạng thái ứng viên
  const handleStatusChange = async (applicationId, newStatus) => {
     setUpdatingStatusId(applicationId);
     setSnackbar({ ...snackbar, open: false });
     try {
         const updatedApp = await updateApplicantStatus(applicationId, newStatus);
         setApplicants(prevApps => prevApps.map(app =>
             app.applicationId === applicationId ? updatedApp : app
         ));
         setSnackbar({open: true, message: 'Cập nhật trạng thái thành công!', severity: 'success'});
     } catch(err) {
          console.error("Lỗi khi cập nhật trạng thái:", err);
          setSnackbar({open: true, message: 'Lỗi! Không thể cập nhật trạng thái.', severity: 'error'});
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
            <TableBody>
              {applicants.length > 0 ? (
                applicants.map((app) => (
                  <TableRow key={app.applicationId} hover>
                    <TableCell component="th" scope="row">
                      {app.candidateName}
                    </TableCell>
                    <TableCell>
                      {formatShortDateTime(app.applicationDate)}
                    </TableCell>
                    <TableCell align="center">
                        <FormControl variant="standard" size="small" sx={{ minWidth: 130 }}> {/* Tăng minWidth */}
                            <Select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                                disabled={updatingStatusId === app.applicationId}
                                renderValue={(selectedValue) => (
                                     updatingStatusId === app.applicationId ?
                                     <CircularProgress size={20} sx={{mx: 'auto', display:'block'}}/> : // Hiển thị loading khi đang đổi
                                    <Chip label={selectedValue} color={getApplicantStatusColor(selectedValue)} size="small" sx={{width: '100%'}} />
                                )}
                                sx={{ '.MuiSelect-select': { p: 0.5 } , '.MuiSelect-select:focus': { backgroundColor: 'transparent' } }} // Style lại Select
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
                         <Tooltip title="Xem CV">
                             <span>
                                <IconButton size="small" onClick={() => handleViewCV(app.cvUrl)} disabled={!app.cvUrl || app.cvUrl === '#'}>
                                    <ArticleIcon fontSize='small'/>
                                </IconButton>
                             </span>
                         </Tooltip>
                     </TableCell>
                    {/* === Cập nhật Cột Hành động === */}
                    <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Xem hồ sơ tóm tắt">
                                {/* Gọi handler mới khi bấm nút */}
                                <IconButton size="small" onClick={() => handleOpenViewProfileDialog(app.candidateId)} >
                                    <VisibilityIcon fontSize='small'/>
                                </IconButton>
                            </Tooltip>                           {/* THÊM NÚT GỬI TEST */}
                            <Tooltip title="Gửi bài test">
                                <span>
                                    <IconButton
                                        size="small"
                                        color="secondary" // Màu khác cho nổi bật
                                        onClick={() => handleOpenSendTestDialog(app)}
                                        // Disable nếu job này ko có test, hoặc ứng viên đã bị từ chối/đã gửi test/đã mời PV...
                                        disabled={loadingAssociatedTests || jobAssociatedTests.length === 0 || ['Từ chối', 'Đã gửi bài test', 'Mời phỏng vấn'].includes(app.status)}
                                    >
                                        <AssignmentIcon fontSize='small'/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                            {/* --- NÚT ĐÁNH GIÁ MỚI --- */}
                            <Tooltip title={`Đánh giá ${app.candidateName}`}>
                              <IconButton
                                size="small"
                                color="info" // Hoặc màu khác
                                onClick={() => handleOpenEvaluateDialog(app)} // <<< GỌI HÀM MỞ DIALOG ĐÁNH GIÁ
                                // Có thể disable nếu chưa qua vòng phỏng vấn/test ?
                              >
                              <RateReviewIcon fontSize='small'/> {/* Hoặc GradingIcon */}
                              </IconButton>
                            </Tooltip>
                            {/* --- KẾT THÚC NÚT ĐÁNH GIÁ MỚI --- */}
                            <Tooltip title={`Mời ${app.candidateName} phỏng vấn/test`}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenInviteDialog(app)} // <<< Gọi handler mở dialog mời
                                // Có thể thêm disabled dựa trên status nếu cần
                                // disabled={['Từ chối', 'Mời phỏng vấn', 'Đã gửi bài test'].includes(app.status)}
                            >
                                <MailOutlineIcon fontSize='small'/>
                            </IconButton>
                        </Tooltip>
                        </Stack>
                    </TableCell>
                     {/* === Kết thúc Cập nhật === */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center"> {/* Cập nhật colSpan */}
                    Chưa có ứng viên nào cho vị trí này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
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
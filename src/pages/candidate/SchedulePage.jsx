// src/pages/candidate/SchedulePage.jsx
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';

// Import Icons
import EventIcon from '@mui/icons-material/Event';
import InterviewIcon from '@mui/icons-material/PeopleOutline';
import TestIcon from '@mui/icons-material/Grading';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTimeOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import NotesIcon from '@mui/icons-material/NotesOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import LaunchIcon from '@mui/icons-material/Launch';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Cho deadline/ngày gửi test


// Helper để format ngày giờ
const formatDateTime = (isoString) => {
    if (!isoString) return 'Chưa xác định';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            // console.warn("[formatDateTime] Invalid date string received:", isoString);
            return 'Ngày giờ không hợp lệ';
        }
        const optionsDate = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };
        const formattedDate = new Intl.DateTimeFormat('vi-VN', optionsDate).format(date);
        const formattedTime = new Intl.DateTimeFormat('vi-VN', optionsTime).format(date);
        return `${formattedTime} - ${formattedDate}`;
    } catch (e) {
        // console.error("[formatDateTime] Error formatting date:", isoString, e);
        return 'Lỗi định dạng ngày giờ';
    }
};

// Helper lấy icon và màu cho status
const getStatusInfo = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
        case 'mời phỏng vấn':
            return { icon: <HelpOutlineIcon />, color: 'warning', label: 'Chờ xác nhận' };
        case 'đã xác nhận (candidate)':
            return { icon: <CheckCircleIcon />, color: 'success', label: 'Bạn đã xác nhận' };
        case 'đã từ chối (candidate)':
            return { icon: <CancelIcon />, color: 'error', label: 'Bạn đã từ chối' };
        case 'đã xác nhận':
            return { icon: <CheckCircleIcon />, color: 'success', label: 'Đã xác nhận' };
        case 'đã từ chối':
            return { icon: <CancelIcon />, color: 'error', label: 'Đã từ chối' };
        case 'đã hủy':
            return { icon: <CancelIcon />, color: 'error', label: 'Đã hủy bởi NTD' };
        case 'đã hoàn thành':
            return { icon: <CheckCircleIcon color="action" />, color: 'default', label: 'Đã hoàn thành' };
        case 'đã gửi bài test':
            return { icon: <TestIcon />, color: 'info', label: 'Đã nhận bài test'}; // Label rõ ràng hơn
        default:
            return { icon: <EventIcon />, color: 'default', label: status || 'Chưa rõ' };
    }
};

function CandidateSchedulePage() {
  const { authState } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const loadEvents = useCallback(async () => {
    if (!authState.user?.id) {
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCandidateScheduledInterviewsApi();
      // console.log("[SchedulePage] Raw API response for scheduled items:", JSON.stringify(response.data, null, 2));

      if (response && Array.isArray(response.data)) {
        const formattedEvents = response.data.map(app => {
            // console.log("[SchedulePage] Processing app from API (inside map):", JSON.stringify(app, null, 2));
            const jobInfo = app.jobId || {};
            const interviewInfo = app.interviewDetails || {};
            const testInfo = app.assignedTestDetails || {};

            let eventItem = {
                eventId: app._id,
                jobId: jobInfo._id,
                jobTitle: jobInfo.title || 'N/A',
                companyName: jobInfo.companyName || 'N/A',
                companyId: jobInfo.companyId,
                status: app.status,
                type: '',
                dateTime: null, // Sẽ được gán cụ thể bên dưới
                deadline: null, // Thêm trường deadline riêng cho test
                sentDate: null, // Thêm trường ngày gửi riêng cho test
                location: 'N/A',
                link: null,
                notes: null,
                isTest: false,
                testName: null,
            };

            if (app.status?.toLowerCase() === 'mời phỏng vấn' && interviewInfo.interviewDate) {
                eventItem.type = interviewInfo.interviewType || 'Phỏng vấn';
                eventItem.dateTime = interviewInfo.interviewDate; // Đây là ngày giờ phỏng vấn
                eventItem.location = interviewInfo.location || 'N/A';
                eventItem.link = interviewInfo.link;
                eventItem.notes = interviewInfo.notes;
                eventItem.isTest = false;
            } else if (app.status?.toLowerCase() === 'đã gửi bài test' && testInfo.testId) {
                // console.log(`[SchedulePage] App ID ${app._id} IS A TEST. Raw testInfo:`, JSON.stringify(testInfo, null, 2));
                eventItem.type = 'Làm bài test';
                eventItem.testName = testInfo.testName || 'Bài Test'; // Lấy tên test
                // jobTitle vẫn giữ nguyên để biết test cho job nào
                eventItem.deadline = testInfo.deadline; // Lưu deadline riêng
                eventItem.sentDate = testInfo.sentDate;   // Lưu ngày gửi riêng
                // dateTime sẽ được quyết định khi render (ưu tiên deadline)
                eventItem.dateTime = testInfo.deadline || testInfo.sentDate;
                eventItem.location = 'Online'; // Test mặc định là online
                eventItem.link = testInfo.testLink;
                eventItem.notes = testInfo.notesForCandidate;
                eventItem.isTest = true;
            } else {
                eventItem.type = app.status || 'Hoạt động khác';
                eventItem.dateTime = app.updatedAt || app.createdAt;
            }
            // console.log(`[SchedulePage] Mapped eventItem for app ${app._id}:`, JSON.stringify(eventItem, null, 2));
            return eventItem;
        });
        setEvents(formattedEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải lịch hẹn của bạn.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id && !authState.isLoading) {
        loadEvents();
    } else if (!authState.isLoading && !authState.isAuthenticated) {
        setError("Vui lòng đăng nhập để xem lịch hẹn.");
        setLoading(false);
    }
  }, [authState.isAuthenticated, authState.user?.id, authState.isLoading, loadEvents]);


  const handleCandidateResponse = async (eventId, candidateResponseStatus) => {
      if (!authState.user?.id || !eventId) return;
      let currentLoadingSetter;
      if (candidateResponseStatus === 'Đã xác nhận (candidate)') {
          setConfirmingId(eventId);
          currentLoadingSetter = setConfirmingId;
      } else if (candidateResponseStatus === 'Đã từ chối (candidate)') {
          setDecliningId(eventId);
          currentLoadingSetter = setDecliningId;
      } else { return; }
      setSnackbarMessage('');
      try {
          // TODO: Gọi API backend mới để gửi phản hồi của candidate
          // Ví dụ: await apiService.respondToInterviewApi(eventId, { response: candidateResponseStatus.includes('xác nhận') ? 'confirmed' : 'declined' });
          // API này nên trả về application đã được cập nhật (bao gồm status mới và thông tin candidateId, jobId đã populate)
          console.log(`Mock: Candidate responding to event ${eventId} with status: ${candidateResponseStatus}`);
          await new Promise(resolve => setTimeout(resolve, 700));

          // Giả sử API thành công, cập nhật UI
          setSnackbarMessage(`Bạn đã ${candidateResponseStatus.toLowerCase().includes('xác nhận') ? 'xác nhận' : 'từ chối'} lịch hẹn.`);
          setEvents(prevEvents => prevEvents.map(e =>
              e.eventId === eventId ? { ...e, status: candidateResponseStatus } : e
          ));
      } catch (err) {
          setSnackbarMessage(`Lỗi! Không thể ${candidateResponseStatus.toLowerCase().includes('xác nhận') ? 'xác nhận' : 'từ chối'} lịch hẹn.`);
      } finally {
          setSnackbarOpen(true);
          currentLoadingSetter(null);
      }
  };

  const handleConfirm = (eventId) => handleCandidateResponse(eventId, 'Đã xác nhận (candidate)');
  const handleDecline = (eventId) => handleCandidateResponse(eventId, 'Đã từ chối (candidate)');
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (loading || authState.isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
        <Box sx={{p: 2}}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>Lịch hẹn của tôi</Typography>
            <Alert severity="error" sx={{ mb: 2, p: 2, borderRadius: '8px' }}>{error}</Alert>
        </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
        Lịch hẹn của tôi
      </Typography>

      {events.length > 0 ? (
        <Grid container spacing={isMobile ? 2.5 : 3.5}>
          {events.map((event) => {
            const statusInfo = getStatusInfo(event.status);
            // Chỉ hiển thị nút xác nhận/từ chối cho "Mời phỏng vấn" (không phải test)
            const isConfirmableByCandidate = !event.isTest && event.status?.toLowerCase() === 'mời phỏng vấn';

            let eventTypeDisplayLabel = '';
            let eventTypeDisplayIcon = <EventIcon />;
            let timeLabel = '';

            if (event.isTest) {
                eventTypeDisplayLabel = event.testName ? `Bài Test: ${event.testName}` : 'Bài Test Online';
                eventTypeDisplayIcon = <TestIcon />;
                if (event.deadline) {
                    timeLabel = `Hạn chót: ${formatDateTime(event.deadline)}`;
                } else if (event.sentDate) {
                    timeLabel = `Ngày gửi: ${formatDateTime(event.sentDate)}`;
                } else {
                    timeLabel = formatDateTime(event.dateTime); // Fallback
                }
            } else { // Là phỏng vấn hoặc hoạt động khác
                eventTypeDisplayLabel = event.type ? `${event.type}: ${event.jobTitle}` : event.jobTitle;
                eventTypeDisplayIcon = <InterviewIcon />;
                timeLabel = formatDateTime(event.dateTime);
            }
            // console.log(`[SchedulePage] Rendering event ID: ${event.eventId}, Link: "${event.link}", Location: "${event.location}", Type: "${event.type}", isTest: ${event.isTest}, testName: "${event.testName}", jobTitle: "${event.jobTitle}"`);

            return (
              <Grid item xs={12} md={6} lg={4} key={event.eventId}>
                <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.07)',
                    transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    }
                }}>
                  <CardContent sx={{ flexGrow: 1, pb: 1.5, p: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                      <Avatar sx={{
                          bgcolor: event.isTest ? 'secondary.main' : 'primary.main',
                          color: 'white',
                          width: 56, height: 56,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                        {eventTypeDisplayIcon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.35, color: 'text.primary' }}>
                          {eventTypeDisplayLabel}
                        </Typography>
                        {event.companyName && event.companyName !== 'N/A' && (
                            <Link
                                component={RouterLink}
                                to={event.companyId ? `/companies/${event.companyId}` : (event.jobId ? `/jobs/${event.jobId}` : '#')}
                                underline="hover"
                                variant="subtitle1"
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, '&:hover': {color: 'primary.main'} }}
                            >
                               <BusinessIcon sx={{fontSize: '1.1rem'}}/> {event.companyName}
                            </Link>
                        )}
                      </Box>
                    </Stack>
                    <Divider light sx={{ my: 2 }} />
                    <Stack spacing={1.8}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon color="action" sx={{ mr: 1.5, fontSize: '1.25rem' }}/>
                            <Typography variant="body1" color={event.isTest && event.deadline ? "error.main" : "text.primary"} fontWeight={event.isTest && event.deadline ? "500" : "normal"}>
                                {timeLabel}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           {(event.location?.toLowerCase() === 'online' && event.link) || (event.isTest && event.link) ?
                               <LinkIcon color="action" sx={{ mr: 1.5, fontSize: '1.25rem' }}/> :
                               <LocationOnIcon color="action" sx={{ mr: 1.5, fontSize: '1.25rem' }}/>
                           }
                           {event.link && (event.isTest || event.location?.toLowerCase() === 'online') ? (
                                <Link href={event.link} target="_blank" rel="noopener noreferrer" variant="body1" color="primary.main" sx={{fontWeight: 500, wordBreak: 'break-all', display: 'flex', alignItems: 'center', '&:hover': {textDecoration: 'underline'}}}>
                                    {event.isTest
                                        ? (event.testName ? `Làm bài: ${event.testName}` : 'Link làm bài test')
                                        : (event.location?.toLowerCase() === 'online' ? `${event.location} - Tham gia` : 'Link đính kèm')
                                    }
                                    <LaunchIcon sx={{fontSize: '1rem', ml: 0.5}}/>
                                </Link>
                           ) : (
                                 <Typography variant="body1" color="text.primary">{event.location}</Typography>
                           )}
                        </Box>

                        {event.notes && (
                             <Box sx={{ display: 'flex', alignItems: 'start', mt: 0.5 }}>
                                 <NotesIcon color="action" sx={{ mr: 1.5, fontSize: '1.25rem', mt: 0.2 }}/>
                                 <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Ghi chú: {event.notes}</Typography>
                             </Box>
                         )}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}`, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1.5 }}>
                    <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        color={statusInfo.color}
                        variant={statusInfo.label === 'Chờ xác nhận' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ width: {xs: '100%', sm: 'auto'}, mb: {xs: isConfirmableByCandidate ? 1:0, sm:0 }, fontWeight: 500, p: 0.5, borderRadius: '8px' }}
                    />
                    {isConfirmableByCandidate ? (
                    <Stack direction="row" spacing={1} sx={{ width: {xs: '100%', sm: 'auto'} }}>
                        <Button size="small" variant="contained" color="success" onClick={() => handleConfirm(event.eventId)} disabled={confirmingId === event.eventId || decliningId === event.eventId} startIcon={confirmingId === event.eventId ? <CircularProgress size={16} color="inherit"/> : <CheckCircleIcon sx={{fontSize: '1.1rem'}}/>} fullWidth={isMobile} sx={{borderRadius: '8px', fontWeight: 600}}>Xác nhận</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDecline(event.eventId)} disabled={confirmingId === event.eventId || decliningId === event.eventId} startIcon={decliningId === event.eventId ? <CircularProgress size={16} color="inherit"/> : <CancelIcon sx={{fontSize: '1.1rem'}}/>} fullWidth={isMobile} sx={{borderRadius: '8px', fontWeight: 600}}>Từ chối</Button>
                    </Stack>
                    ) : (
                         event.jobId && (
                            <Button size="small" component={RouterLink} to={`/jobs/${event.jobId}`} sx={{ width: {xs: '100%', sm: 'auto'}, fontWeight: 500, borderRadius: '8px' }} endIcon={<LaunchIcon sx={{fontSize: '1rem'}}/>}>Xem tin tuyển dụng</Button>
                        )
                    )}
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Paper sx={{p: {xs:3, sm:5}, textAlign:'center', mt:2, borderRadius: '16px', background: (theme) => theme.palette.background.default}}>
              <EventIcon sx={{fontSize: 72, color: 'text.disabled', mb: 2.5, opacity: 0.7}}/>
              <Typography variant="h5" color="text.primary" gutterBottom sx={{fontWeight: 600}}>
              Bạn không có lịch hẹn nào
              </Typography>
              <Typography color="text.secondary" sx={{mb: 3, maxWidth: 450, mx: 'auto'}}>
                  Khi nhà tuyển dụng mời bạn phỏng vấn hoặc giao bài test, thông tin chi tiết sẽ được hiển thị tại đây.
              </Typography>
              <Button component={RouterLink} to="/jobs" variant="contained" size="large" sx={{borderRadius: '8px', px:3, py: 1.2}}>
                  Khám phá việc làm
              </Button>
          </Paper>
        </Grid>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.toLowerCase().includes('lỗi') ? 'error' : 'success'} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
            {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CandidateSchedulePage;
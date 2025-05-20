// src/pages/candidate/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '@mui/material/Alert';
import { useTheme, alpha, styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';

// Import Icons
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import TestIcon from '@mui/icons-material/Grading';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 6,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 6,
    backgroundColor: theme.palette.primary.main,
  },
}));

const getAppliedJobStatusChipProps = (status, theme) => {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'mời phỏng vấn':
    case 'trúng tuyển':
      return { color: 'success', variant: 'filled', sx: { color: theme.palette.success.contrastText, backgroundColor: theme.palette.success.main, fontWeight: 500, borderRadius: '8px' } };
    case 'đã gửi bài test':
      return { color: 'secondary', variant: 'filled', sx: { color: theme.palette.secondary.contrastText, backgroundColor: theme.palette.secondary.main, fontWeight: 500, borderRadius: '8px' } };
    case 'đang xét duyệt':
    case 'phù hợp':
      return { color: 'warning', variant: 'outlined', sx: { borderColor: theme.palette.warning.main, color: theme.palette.warning.dark, fontWeight: 500, borderRadius: '8px' } };
    case 'từ chối':
      return { color: 'error', variant: 'outlined', sx: { borderColor: theme.palette.error.main, color: theme.palette.error.dark, fontWeight: 500, borderRadius: '8px' } };
    case 'đã nộp':
    default:
      return { color: 'info', variant: 'outlined', sx: { borderColor: theme.palette.info.main, color: theme.palette.info.dark, fontWeight: 500, borderRadius: '8px' } };
  }
};

const getScheduleStatusInfo = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
        case 'mời phỏng vấn':
            return { icon: <HelpOutlineOutlinedIcon fontSize="small"/>, color: 'warning', label: 'Chờ xác nhận' };
        case 'đã xác nhận (candidate)':
            return { icon: <CheckCircleOutlineIcon fontSize="small"/>, color: 'success', label: 'Bạn đã xác nhận' };
        case 'đã từ chối (candidate)':
            return { icon: <CancelOutlinedIcon fontSize="small"/>, color: 'error', label: 'Bạn đã từ chối' };
        case 'đã gửi bài test':
            return { icon: <TestIcon fontSize="small"/>, color: 'info', label: 'Đã nhận bài test'};
        default:
            return { icon: <EventNoteOutlinedIcon fontSize="small"/>, color: 'default', label: status || 'Chưa rõ' };
    }
};

const formatDateTimeSimple = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Ngày giờ không hợp lệ';
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' +
               date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch(e) { return 'Lỗi ngày giờ';}
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

const calculateProfileCompletion = (user) => {
    if (!user) return 0;
    let score = 0;
    const totalFields = 10;
    if (user.fullName) score++;
    if (user.email) score++;
    if (user.phone) score++;
    if (user.address) score++;
    if (user.dateOfBirth) score++;
    if (user.summary) score++;
    if (user.education && user.education.length > 0) score++;
    if (user.experience && user.experience.length > 0) score++;
    if (user.skills && user.skills.length > 0) score++;
    if (user.uploadedCVs && user.uploadedCVs.length > 0) score++;
    return Math.round((score / totalFields) * 100);
};

const SectionPaper = ({ title, icon, linkTo, linkText = "Xem tất cả", children, loading, error, onRetry, minHeight = 'auto' }) => {
    const theme = useTheme();
    return (
        <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', minHeight: minHeight, borderRadius: '16px', boxShadow: theme.shadows[3] }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                    {icon && React.cloneElement(icon, { color: "primary", sx: {fontSize: '1.8rem'} })}
                    <Typography variant="h6" sx={{fontWeight: 600, color: 'text.primary'}}>{title}</Typography>
                </Stack>
                {linkTo && <Button size="small" component={RouterLink} to={linkTo} endIcon={<ArrowForwardIcon/>} sx={{textTransform: 'none', fontWeight: 500, borderRadius: '6px'}}> {linkText} </Button>}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                {loading ? <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px'}}><CircularProgress size={30}/></Box> :
                 error ? <Alert severity="warning" action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Thử lại</Button> : null} sx={{flexGrow: 1, display:'flex', alignItems:'center'}}>{error}</Alert> :
                 children
                }
            </Box>
        </Paper>
    );
};

function CandidateDashboardPage() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const user = authState.user;

  const [recentApps, setRecentApps] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  console.log(`[CandidateDashboardPage] Component Rendering. AuthIsLoading: ${authState.isLoading}, IsAuthenticated: ${authState.isAuthenticated}, User available: ${!!user}`);
  if (user) {
    console.log(`[CandidateDashboardPage] User object during render: _id: ${user._id}, role: ${user.role}, id: ${user.id}`);
  } else {
    console.log(`[CandidateDashboardPage] User object is NULL or UNDEFINED during render.`);
  }

  const profileCompletion = calculateProfileCompletion(user);

  const loadCandidateDashboardData = useCallback(async () => {
    console.log(`[CandidateDashboardPage] useCallback loadCandidateDashboardData - Checking conditions: User ID (user?._id): ${user?._id}, User ID (user?.id): ${user?.id}, User Role: ${user?.role}, IsAuthenticated: ${authState.isAuthenticated}, AuthIsLoading: ${authState.isLoading}`);

    if (authState.isLoading) {
        console.log("[CandidateDashboardPage] loadCandidateDashboardData: AuthContext is STILL LOADING. Aborting fetch for now, will retry on authState.isLoading change.");
        setLoadingData(true); 
        setErrorData(null);
        return;
    }

    if (!authState.isAuthenticated) {
        console.log("[CandidateDashboardPage] loadCandidateDashboardData: User NOT AUTHENTICATED.");
        setLoadingData(false);
        setErrorData("Vui lòng đăng nhập để xem bảng điều khiển.");
        setRecentApps([]); setUpcomingEvents([]); setSuggestedJobs([]);
        return;
    }

    // Sử dụng user._id nếu có, nếu không thì dùng user.id
    const userId = user?._id || user?.id;
    if (!user || !userId) { 
        console.log(`[CandidateDashboardPage] loadCandidateDashboardData: User object or User ID is MISSING. User: ${JSON.stringify(user)}, Evaluated UserID: ${userId}`);
        setLoadingData(false);
        setErrorData("Thông tin người dùng không đầy đủ (thiếu ID) để tải dữ liệu.");
        setRecentApps([]); setUpcomingEvents([]); setSuggestedJobs([]);
        return;
    }

    if (user.role !== 'candidate') {
        console.log(`[CandidateDashboardPage] loadCandidateDashboardData: User role is "${user.role}", not "candidate".`);
        setLoadingData(false);
        setErrorData("Tài khoản không có quyền truy cập mục này.");
        setRecentApps([]); setUpcomingEvents([]); setSuggestedJobs([]);
        return;
    }

    setLoadingData(true);
    setErrorData(null);
    console.log(`[CandidateDashboardPage] PASSED conditions in loadCandidateDashboardData. Starting API calls for User ID: ${userId}`);

    try {
      const recentAppsPromise = apiService.getCandidateApplicationsApi();
      const upcomingEventsPromise = apiService.getCandidateScheduledInterviewsApi();
      const suggestedJobsPromise = apiService.getPublicJobs({ limit: 3, sort: '-createdAt' });

      console.log("[CandidateDashboardPage] loadCandidateDashboardData: About to call Promise.all.");
      const [appsResponse, eventsResponse, jobsResponse] = await Promise.all([
        recentAppsPromise,
        upcomingEventsPromise,
        suggestedJobsPromise
      ]);

      console.log("[CandidateDashboardPage] loadCandidateDashboardData: Recent Applications API Response:", appsResponse?.data);
      console.log("[CandidateDashboardPage] loadCandidateDashboardData: Upcoming Events API Response:", eventsResponse?.data);
      console.log("[CandidateDashboardPage] loadCandidateDashboardData: Suggested Jobs API Response:", jobsResponse?.data);

      if (appsResponse && Array.isArray(appsResponse.data)) {
        setRecentApps(appsResponse.data.slice(0, 4));
      } else {
        console.warn("[CandidateDashboardPage] Recent applications data is not an array or missing from API response:", appsResponse);
        setRecentApps([]);
      }
      if (eventsResponse && Array.isArray(eventsResponse.data)) {
        const formattedEvents = eventsResponse.data.map(app => {
            const jobInfo = app.jobId || {};
            const interviewInfo = app.interviewDetails || {};
            const testInfo = app.assignedTestDetails || {};
            let eventItem = {
                eventId: app._id, jobTitle: jobInfo.title || 'N/A', companyName: jobInfo.companyName || 'N/A',
                status: app.status, isTest: false, type: '', dateTime: null,
                deadline: testInfo.deadline, sentDate: testInfo.sentDate, testName: testInfo.testName,
            };
            if (app.status?.toLowerCase() === 'mời phỏng vấn' && interviewInfo.interviewDate) {
                eventItem.type = interviewInfo.interviewType || 'Phỏng vấn'; eventItem.dateTime = interviewInfo.interviewDate;
            } else if (app.status?.toLowerCase() === 'đã gửi bài test' && testInfo.testId) {
                eventItem.type = testInfo.testName || 'Bài Test'; eventItem.dateTime = testInfo.deadline || testInfo.sentDate; eventItem.isTest = true;
            }
            return eventItem;
        }).filter(event => event.type);
        setUpcomingEvents(formattedEvents.slice(0, 4));
      } else {
        console.warn("[CandidateDashboardPage] Upcoming events data is not an array or missing from API response:", eventsResponse);
        setUpcomingEvents([]);
      }
      if (jobsResponse && Array.isArray(jobsResponse.data)) {
        setSuggestedJobs(jobsResponse.data);
      } else if (jobsResponse && jobsResponse.data && Array.isArray(jobsResponse.data.data)) {
        setSuggestedJobs(jobsResponse.data.data);
      } else {
        console.warn("[CandidateDashboardPage] Suggested jobs data is not in expected array format or missing from API response:", jobsResponse);
        setSuggestedJobs([]);
      }

    } catch (err) {
      console.error("[CandidateDashboardPage] loadCandidateDashboardData: FAILED to load data:", err.response?.data || err.message || err);
      setErrorData("Không thể tải dữ liệu cho bảng điều khiển. Vui lòng thử lại sau.");
      setRecentApps([]); setUpcomingEvents([]); setSuggestedJobs([]);
    } finally {
      setLoadingData(false);
      console.log("[CandidateDashboardPage] loadCandidateDashboardData: Finished loading process.");
    }
  }, [user, authState.isAuthenticated, authState.isLoading]);

  useEffect(() => {
    console.log(`[CandidateDashboardPage] Main useEffect triggered. AuthIsLoading: ${authState.isLoading}, IsAuth: ${authState.isAuthenticated}, User object available: ${!!user}, User ID: ${user?._id || user?.id}`);
    if (!authState.isLoading) {
        console.log("[CandidateDashboardPage] Main useEffect: AuthContext finished loading, calling loadCandidateDashboardData.");
        loadCandidateDashboardData();
    } else {
        setLoadingData(true);
        setErrorData(null);
        console.log("[CandidateDashboardPage] Main useEffect: Waiting for AuthContext to finish loading.");
    }
  }, [authState.isLoading, loadCandidateDashboardData]);

  if (loadingData) {
    console.log(`[CandidateDashboardPage] Rendering LoadingSpinner because 'loadingData' state is true.`);
    return <LoadingSpinner />;
  }

  if (errorData) {
    console.log(`[CandidateDashboardPage] Rendering ErrorData Alert: ${errorData}`);
    return (
        <Box sx={{p:2}}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Bảng điều khiển Ứng viên
            </Typography>
            <Alert severity="error" sx={{ m: 2, p:2, borderRadius: '8px' }}>{errorData}</Alert>
            {authState.isAuthenticated && user && <Button onClick={loadCandidateDashboardData} variant="outlined" sx={{ml:2}}>Thử lại</Button>}
        </Box>
    );
  }
  
  if (!authState.isAuthenticated) {
     console.log("[CandidateDashboardPage] Rendering: Not authenticated (final check).");
     return (
        <Box sx={{p:3, textAlign: 'center'}}>
            <Alert severity="warning" sx={{mb:2, borderRadius: '8px'}}>Vui lòng đăng nhập để xem bảng điều khiển của bạn.</Alert>
            <Button component={RouterLink} to="/login" variant="contained" sx={{borderRadius: '8px'}}>Đăng nhập</Button>
        </Box>
     );
  }

  if (!user && authState.isAuthenticated) {
    console.log("[CandidateDashboardPage] Rendering: Authenticated but user object is STILL missing (final check).");
    return <Alert severity="error" sx={{m:2, borderRadius: '8px'}}>Lỗi nghiêm trọng: Thông tin người dùng không thể tải được dù đã xác thực.</Alert>;
  }

  return (
    <Box sx={{p: {xs: 1.5, sm: 2, md: 3}}}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
        Chào mừng trở lại, {user?.fullName || 'Ứng viên'}!
      </Typography>

      <Grid container spacing={3} direction={"column"}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', boxShadow: theme.shadows[3] }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
               <AccountBoxOutlinedIcon color="primary" sx={{fontSize: '2.2rem'}}/>
               <Typography variant="h6" sx={{fontWeight: 600}}>Tiến độ hồ sơ</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Hồ sơ của bạn đã hoàn thiện <Typography component="span" fontWeight="bold" color="primary.main" sx={{fontSize: '1.1em'}}>{profileCompletion}%</Typography>.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{mb: 1.5}}>
                Một hồ sơ đầy đủ thông tin sẽ tăng cơ hội được nhà tuyển dụng chú ý!
            </Typography>
            <BorderLinearProgress variant="determinate" value={profileCompletion} sx={{mb:2.5}}/>
             <Box sx={{ mt: 'auto', pt: 1, textAlign:'right' }}>
                <Button
                    variant="contained"
                    size="medium"
                    component={RouterLink}
                    to="/candidate/profile"
                    sx={{borderRadius: '8px', textTransform: 'none', fontWeight: 500, px:2}}
                >
                    Cập nhật hồ sơ
                </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={8}>
           <SectionPaper title="Lịch hẹn sắp tới" icon={<EventAvailableOutlinedIcon />} linkTo="/candidate/schedule" loading={loadingData} error={errorData} onRetry={loadCandidateDashboardData} minHeight="280px">
             {upcomingEvents.length > 0 ? (
                <List dense disablePadding>
                    {upcomingEvents.map(event => {
                        const statusDetails = getScheduleStatusInfo(event.status);
                        const eventTypeLabel = event.isTest ? (event.testName || 'Bài Test') : (event.type || 'Phỏng vấn');
                        let displayTime = '';
                        if (event.isTest) {
                            if (event.deadline) displayTime = `Hạn chót: ${formatDateTimeSimple(event.deadline)}`;
                            else if (event.sentDate) displayTime = `Ngày gửi: ${formatDateTimeSimple(event.sentDate)}`;
                            else displayTime = formatDateTimeSimple(event.dateTime);
                        } else {
                            displayTime = formatDateTimeSimple(event.dateTime);
                        }
                        return (
                            <ListItem disableGutters key={event.eventId} sx={{display: 'flex', justifyContent:'space-between', alignItems:'center', py: 1, '&:hover': {bgcolor: alpha(theme.palette.action.hover, 0.04)}, borderRadius: '8px', mb:0.5, px: 1}} button onClick={() => navigate('/candidate/schedule')}>
                                <ListItemIcon sx={{minWidth: 38, color: event.isTest ? theme.palette.info.main : theme.palette.primary.main}}>{event.isTest ? <TestIcon/> : <EventNoteOutlinedIcon/>}</ListItemIcon>
                                <ListItemText primary={<Typography variant="body1" fontWeight="500" noWrap title={`${eventTypeLabel} - ${event.jobTitle} tại ${event.companyName}`}>{eventTypeLabel} - {event.jobTitle}</Typography>} secondary={<Typography variant="caption" color="text.secondary" noWrap>{event.companyName} • {displayTime}</Typography>} />
                                <Chip icon={statusDetails.icon} label={statusDetails.label} color={statusDetails.color} size="small" variant="outlined" sx={{ml: 1, flexShrink: 0, borderRadius: '16px', fontWeight: 500, height: 'auto', '& .MuiChip-label': {py:0.5, px:1}, '& .MuiChip-icon': {ml:0.8}}} />
                            </ListItem>
                        );
                    })}
                </List>
             ) : ( <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center', fontStyle: 'italic', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Không có lịch hẹn nào sắp tới.</Typography> )}
           </SectionPaper>
        </Grid>

        <Grid item xs={12} md={6} lg={7}>
           <SectionPaper title="Ứng tuyển gần đây" icon={<WorkHistoryOutlinedIcon />} linkTo="/candidate/applications" loading={loadingData} error={errorData} onRetry={loadCandidateDashboardData} minHeight="280px">
              {recentApps.length > 0 ? (
                <List dense disablePadding>
                    {recentApps.map(app => {
                        const jobInfo = app.jobId || {};
                        const statusProps = getAppliedJobStatusChipProps(app.status, theme);
                        return (
                         <ListItem disableGutters key={app._id || app.applicationId} sx={{display: 'flex', justifyContent:'space-between', alignItems:'center', py: 1, '&:hover': {bgcolor: alpha(theme.palette.action.hover, 0.04)}, borderRadius: '8px', mb:0.5, px:1}} button onClick={() => navigate(`/jobs/${jobInfo._id || jobInfo.id}`)}>
                            <ListItemText primary={<MuiLink component={RouterLink} to={`/jobs/${jobInfo._id || jobInfo.id}`} underline="hover" sx={{fontWeight: '500', color: 'text.primary'}} noWrap>{jobInfo.title || 'N/A'}</MuiLink>} secondary={<Typography variant="caption" color="text.secondary" noWrap>{jobInfo.companyName || 'N/A'} • Ngày nộp: {formatDisplayDate(app.createdAt)}</Typography>} />
                            <Chip label={app.status} color={statusProps.color} variant={statusProps.variant} size="small" sx={{ml: 1, flexShrink: 0, borderRadius: '16px', height: 'auto', '& .MuiChip-label': {py:0.5, px:1}, ...statusProps.sx}} />
                        </ListItem>
                        );
                    })}
                </List>
             ) : ( <Typography variant="body2" color="text.secondary" sx={{mt: 2, textAlign: 'center', fontStyle: 'italic', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Bạn chưa ứng tuyển việc làm nào gần đây.</Typography> )}
           </SectionPaper>
        </Grid>

        <Grid item xs={12} md={6} lg={5}>
            <SectionPaper title="Việc làm gợi ý" icon={<LightbulbOutlinedIcon />} linkTo="/jobs" linkText="Tìm thêm" loading={loadingData} error={errorData} onRetry={loadCandidateDashboardData} minHeight="280px">
              {suggestedJobs.length > 0 ? (
                 <List dense disablePadding>
                    {suggestedJobs.map(job => (
                         <ListItem disableGutters key={job._id || job.id} sx={{py: 1, '&:hover': {bgcolor: alpha(theme.palette.action.hover, 0.04)}, borderRadius: '8px', mb:0.5, px:1}} button onClick={() => navigate(`/jobs/${job._id || job.id}`)}>
                            <ListItemIcon sx={{minWidth: 38}}><WorkOutlineIcon color="action"/></ListItemIcon>
                            <ListItemText primary={<MuiLink component={RouterLink} to={`/jobs/${job._id || job.id}`} underline="hover" sx={{fontWeight: '500', color: 'text.primary'}} noWrap>{job.title}</MuiLink>} secondary={<Typography variant="caption" color="text.secondary" noWrap>{job.companyName} - {job.location}</Typography>} />
                        </ListItem>
                    ))}
                </List>
             ) : (
                 <Stack alignItems="center" spacing={1.5} sx={{py:3, color: 'text.secondary', flexGrow: 1, justifyContent: 'center'}}>
                    <FindInPageOutlinedIcon sx={{fontSize: 56, opacity: 0.6}}/>
                    <Typography variant="body2" sx={{textAlign: 'center', fontStyle: 'italic'}}>
                        Chưa có việc làm gợi ý phù hợp. <br/>Hãy thử cập nhật hồ sơ và kỹ năng của bạn.
                    </Typography>
                 </Stack>
             )}
           </SectionPaper>
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CandidateDashboardPage;
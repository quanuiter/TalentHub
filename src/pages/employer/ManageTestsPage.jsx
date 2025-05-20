// src/pages/employer/ManageTestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PropTypes from 'prop-types';
import { format } from 'date-fns'; // For date formatting
import { vi } from 'date-fns/locale'; // Vietnamese locale for date-fns

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid'; // For form layout
import { useTheme, alpha } from '@mui/material/styles';

// Import Icons
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';


// Định nghĩa a11yProps cho Tabs
function a11yProps(index) {
  return {
    id: `test-tab-${index}`,
    'aria-controls': `test-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3, pb: 2 }}> {/* Added pb */}
          {children}
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};


function ManageTestsPage() {
  const { authState } = useAuth();
  const theme = useTheme();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const initialFormData = { testId: null, name: '', link: '', description: '', durationMinutes: '' };
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState(null);

  const loadTests = useCallback(async () => {
    if (!authState.user?.id || !authState.isAuthenticated || authState.isLoading) {
        setLoading(false);
        if(!authState.isAuthenticated && !authState.isLoading) setError("Vui lòng đăng nhập để quản lý bài test.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMyTestsApi();
      if (response && Array.isArray(response.data)) {
        // Sort by createdAt descending (newest first)
        response.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTests(response.data);
      } else {
        setTests([]);
        console.warn("API response for My Tests is not an array or data is missing:", response);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài test:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách bài test.");
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id, authState.isAuthenticated, authState.isLoading]);

  useEffect(() => {
    if (activeTab === 'list') { // Only load tests if the list tab is active
        loadTests();
    }
  }, [activeTab, loadTests]);


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData(initialFormData); // Reset form when switching tabs
    setFormError('');
    if (newValue === 'list') { setError(null); } // Clear main error when switching to list
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
   };

  const handleDeleteClick = (testId) => {
    setDeletingTestId(testId);
    setShowDeleteConfirm(true);
  };
  const handleCloseDeleteDialog = () => {
    setShowDeleteConfirm(false);
    setDeletingTestId(null);
  };
  const handleConfirmDelete = async () => {
    if (!deletingTestId || actionLoading.id) return;
    const testIdToDelete = deletingTestId;
    handleCloseDeleteDialog();
    setActionLoading({type: 'delete', id: testIdToDelete});
    setSnackbar({ ...snackbar, open: false });
    try {
        await apiService.deleteTestApi(testIdToDelete);
        setTests(prevTests => prevTests.filter(test => test._id !== testIdToDelete));
        setSnackbar({ open: true, message: 'Đã xóa bài test thành công!', severity: 'success' });
    } catch(err) {
        console.error("Lỗi khi xóa test:", err);
        setSnackbar({ open: true, message: err.response?.data?.message || `Lỗi! Không thể xóa bài test.`, severity: 'error' });
    } finally {
         setActionLoading({type: null, id: null});
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(formError) setFormError(''); // Clear form error on input change
  };

  const handleEditClick = (test) => {
      setFormData({
          testId: test._id,
          name: test.name || '',
          link: test.link || '',
          description: test.description || '',
          durationMinutes: test.durationMinutes || ''
      });
      setFormError('');
      setActiveTab('create');
  };

  const handleAddNewClick = () => {
      setFormData(initialFormData);
      setFormError('');
      setActiveTab('create');
  };

const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!formData.name.trim() || !formData.link.trim()) {
        setFormError('Vui lòng nhập Tên và Link bài test.');
        return;
    }
    try { new URL(formData.link); } catch (_) { setFormError('Link bài test không hợp lệ. Vui lòng nhập URL đầy đủ (ví dụ: https://example.com).'); return; }
    if (formData.durationMinutes && (isNaN(formData.durationMinutes) || Number(formData.durationMinutes) <= 0)) {
        setFormError('Thời gian làm bài (phút) phải là một số dương.'); return;
    }

    setIsSubmitting(true);
    setSnackbar({ ...snackbar, open: false });

    const dataToSubmit = {
        name: formData.name.trim(),
        link: formData.link.trim(),
        description: formData.description?.trim() || undefined,
        durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : undefined
    };

    try {
        let message = '';
        if (formData.testId) {
            await apiService.updateTestApi(formData.testId, dataToSubmit);
            message = 'Cập nhật bài test thành công!';
        } else {
            await apiService.createTestApi(dataToSubmit);
            message = 'Thêm bài test thành công!';
        }
        setSnackbar({ open: true, message: message, severity: 'success'});
        await loadTests(); // Reload tests after successful operation
        setActiveTab('list'); // Switch back to list view
        setFormData(initialFormData);

    } catch(err) {
         console.error("Lỗi khi lưu test:", err);
         const errorMsg = err.response?.data?.message || `Lỗi! Không thể lưu bài test.`;
         setSnackbar({ open: true, message: errorMsg, severity: 'error'});
         setFormError(errorMsg);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (authState.isLoading) return <LoadingSpinner />; // Check auth loading first
  if (!authState.isAuthenticated) { // If not authenticated after auth check, show error
    return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="error">Vui lòng đăng nhập để truy cập trang này.</Alert>
        </Paper>
    );
  }


  return (
    <Paper sx={{ p: {xs: 2, sm: 3}, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2.5, fontWeight: 700, color: 'primary.dark' }}>
        Quản lý Bài Test
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Test management tabs" indicatorColor="primary" textColor="primary">
          <Tab label="Danh sách bài test" value="list" icon={<ListOutlinedIcon />} iconPosition="start" {...a11yProps('list')} sx={{textTransform: 'none', fontWeight: activeTab === 'list' ? 600 : 500}} />
          <Tab label={formData.testId ? "Chỉnh sửa bài test" : "Thêm bài test mới"} value="create" icon={<AddCircleOutlineOutlinedIcon />} iconPosition="start" {...a11yProps('create')} sx={{textTransform: 'none', fontWeight: activeTab === 'create' ? 600 : 500}}/>
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index="list">
        {loading && <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2, p: 1.5, borderRadius: '8px' }}>{error}</Alert>}
        {!loading && !error && (
          <TableContainer component={Paper} variant="outlined" sx={{borderRadius: '8px', boxShadow: 'none'}}>
            <Table sx={{ minWidth: 650 }} aria-label="Tests table">
              <TableHead sx={{ bgcolor: alpha(theme.palette.grey[200], 0.5) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tên bài test</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Link</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Mô tả</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Thời gian (phút)</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Ngày tạo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary', width: '150px' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(tests) && tests.length > 0 ? (
                  tests.map((test) => (
                    <TableRow key={test._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{fontWeight: 500}}>{test.name}</TableCell>
                      <TableCell sx={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        <Tooltip title={test.link || ''}>
                          <Link href={test.link || '#'} target="_blank" rel="noopener noreferrer" sx={{display:'flex', alignItems:'center', gap: 0.5, color: 'primary.main'}}>
                            <LinkOutlinedIcon fontSize="small"/>
                            {test.link || 'N/A'}
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        <Tooltip title={test.description || ''}>{test.description || '-'}</Tooltip>
                      </TableCell>
                      <TableCell align="center">{test.durationMinutes || '-'}</TableCell>
                      <TableCell>
                        {test.createdAt ? format(new Date(test.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Sửa bài test">
                            <IconButton size="small" onClick={() => handleEditClick(test)} disabled={actionLoading.id === test._id}>
                              <EditOutlinedIcon fontSize='small'/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa bài test">
                             <span>
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(test._id)} disabled={actionLoading.id === test._id}>
                                    {actionLoading.type === 'delete' && actionLoading.id === test._id
                                        ? <CircularProgress size={18} color="inherit"/>
                                        : <DeleteOutlineOutlinedIcon fontSize='small'/>
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
                    <TableCell colSpan={6} align="center" sx={{py: 4}}>
                        <Stack alignItems="center" spacing={1} sx={{color: 'text.secondary'}}>
                            <PlaylistAddCheckIcon sx={{fontSize: 48, opacity: 0.7}}/>
                            <Typography>Bạn chưa tạo bài test nào.</Typography>
                            <Button variant="text" onClick={handleAddNewClick} startIcon={<AddCircleOutlineOutlinedIcon/>}>
                                Tạo bài test mới
                            </Button>
                        </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index="create">
        <Typography variant='h6' gutterBottom sx={{fontWeight: 500, color: 'text.primary'}}>
            {formData.testId ? 'Chỉnh sửa thông tin bài test' : 'Thêm Link bài test mới'}
        </Typography>
        <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2.5, maxWidth: 700 }} >
            <Grid container spacing={2.5} direction="column" justifyContent="center">
                 <Grid item xs={12}>
                    <TextField required fullWidth label="Tên bài test" name="name" value={formData.name} onChange={handleFormChange} variant="outlined" size="small" disabled={isSubmitting}/>
                 </Grid>
                 <Grid item xs={12}>
                    <TextField required fullWidth label="Link bài test (URL đầy đủ)" name="link" type="url" value={formData.link} onChange={handleFormChange} variant="outlined" placeholder="https://example.com/your-test-link" size="small" disabled={isSubmitting}/>
                 </Grid>
                 <Grid item xs={12}>
                    <TextField fullWidth label="Mô tả ngắn (tùy chọn)" name="description" multiline rows={3} value={formData.description} onChange={handleFormChange} variant="outlined" size="small" disabled={isSubmitting}/>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Thời gian làm bài (phút, tùy chọn)" name="durationMinutes" type="number" value={formData.durationMinutes} onChange={handleFormChange} variant="outlined" size="small" InputProps={{ inputProps: { min: 0 } }} disabled={isSubmitting}/>
                 </Grid>
                 <Grid item xs={12}>
                    {formError && <Alert severity="error" sx={{ mt: 1, mb:1, p:1, borderRadius: '8px' }}>{formError}</Alert>}
                 </Grid>
                 <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{mt:1}}>
                      <Button type="button" onClick={formData.testId ? () => setActiveTab('list') : handleAddNewClick} disabled={isSubmitting} variant="outlined" color="inherit" sx={{borderRadius: '8px'}}>
                        {formData.testId ? 'Hủy bỏ' : 'Xóa form'}
                      </Button>
                      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null} sx={{borderRadius: '8px', px:3, py:1}}>
                        {formData.testId ? 'Lưu thay đổi' : 'Thêm bài test'}
                      </Button>
                    </Stack>
                 </Grid>
            </Grid>
        </Box>
      </TabPanel>

      <ConfirmDialog
          open={showDeleteConfirm}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa bài test"
          contentText={`Bạn có chắc chắn muốn xóa bài test "${tests.find(t=>t._id === deletingTestId)?.name || 'này'}" không? Hành động này không thể hoàn tác.`}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
           <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
               {snackbar.message}
           </Alert>
       </Snackbar>
    </Paper>
  );
}

export default ManageTestsPage;

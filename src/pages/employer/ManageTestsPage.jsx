// src/pages/employer/ManageTestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Đảm bảo đường dẫn này đúng và file data chứa đủ các hàm/biến này
import apiService from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PropTypes from 'prop-types'; // <<< THÊM DÒNG NÀY
import { format } from 'date-fns'; // <<< THÊM IMPORT NÀY
import { vi } from 'date-fns/locale'; 
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
// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
// Định nghĩa a11yProps cho Tabs
function a11yProps(index) {
  return {
    id: `test-tab-${index}`,
    'aria-controls': `test-tabpanel-${index}`,
  };
}


function ManageTestsPage() {
  const { authState } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' hoặc 'create'

  // State cho form Thêm/Sửa
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ testId: null, name: '', link: '' });
  const [formError, setFormError] = useState('');

  // State cho Dialog Xóa và Snackbar
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState(null);

  // Hàm load danh sách tests
 const loadTests = useCallback(async () => {
    if (!authState.user?.id) {
        // Không set error ở đây nữa vì useEffect sẽ không chạy nếu user ID chưa có
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMyTestsApi(); // Gọi API thật
      console.log("API Response for My Tests:", response.data);
      setTests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài test:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách bài test.");
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [authState.user?.id]); // Phụ thuộc vào userId

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id && activeTab === 'list') {
        loadTests();
    }
  }, [activeTab, authState.isAuthenticated, authState.user?.id, loadTests]);


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData({ testId: null, name: '', link: '', description: '', durationMinutes: '' }); // Reset form khi chuyển tab
    setFormError('');
    if (newValue === 'list') { setError(''); }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
   };

  // --- Handlers cho Delete ---
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
        await apiService.deleteTestApi(testIdToDelete); // Gọi API thật
        setTests(prevTests => prevTests.filter(test => test._id !== testIdToDelete)); // Dùng _id từ MongoDB
        setSnackbar({ open: true, message: 'Đã xóa bài test thành công!', severity: 'success' });
    } catch(err) {
        console.error("Lỗi khi xóa test:", err);
        setSnackbar({ open: true, message: err.response?.data?.message || `Lỗi! Không thể xóa bài test.`, severity: 'error' });
    } finally {
         setActionLoading({type: null, id: null});
    }
  };

  // --- Handlers cho Form Thêm/Sửa ---
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleEditClick = (test) => {
      setFormData({
          testId: test._id, // Dùng _id
          name: test.name,
          link: test.link,
          description: test.description || '',
          durationMinutes: test.durationMinutes || ''
      });
      setFormError('');
      setActiveTab('create');
  };

  const handleAddNewClick = () => { // Đổi tên thành handleSetAddMode để rõ nghĩa hơn
      setFormData({ testId: null, name: '', link: '' }); // Reset form về trạng thái thêm mới
      setFormError('');
      setActiveTab('create'); // Đảm bảo đang ở tab create
  };

const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!formData.name || !formData.link) {
        setFormError('Vui lòng nhập Tên và Link bài test.');
        return;
    }
    try { new URL(formData.link); } catch (_) { setFormError('Link bài test không hợp lệ.'); return; }
    if (formData.durationMinutes !== '' && (isNaN(formData.durationMinutes) || Number(formData.durationMinutes) < 0)) {
        setFormError('Thời gian làm bài không hợp lệ.'); return;
    }


    setIsSubmitting(true);
    setSnackbar({ ...snackbar, open: false });

    const dataToSubmit = {
        name: formData.name,
        link: formData.link,
        description: formData.description || undefined, // Gửi undefined nếu rỗng
        durationMinutes: formData.durationMinutes === '' ? undefined : Number(formData.durationMinutes)
    };

    try {
        let message = '';
        if (formData.testId) { // Chế độ Sửa
            await apiService.updateTestApi(formData.testId, dataToSubmit); // Gọi API thật
            message = 'Cập nhật bài test thành công!';
        } else { // Chế độ Thêm
            await apiService.createTestApi(dataToSubmit); // Gọi API thật
            message = 'Thêm bài test thành công!';
        }
        setSnackbar({ open: true, message: message, severity: 'success'});
        loadTests();
        setActiveTab('list');
        setFormData({ testId: null, name: '', link: '', description: '', durationMinutes: '' }); // Reset form

    } catch(err) {
         console.error("Lỗi khi lưu test:", err);
         const errorMsg = err.response?.data?.message || `Lỗi! Không thể lưu bài test.`;
         setSnackbar({ open: true, message: errorMsg, severity: 'error'});
         setFormError(errorMsg); // Hiển thị lỗi này trực tiếp trên form
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- JSX ---
  return (
    <Paper sx={{ p: 3, position: 'relative' /* Cho ConfirmDialog */ }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Quản lý Bài Test (Links)
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Test management tabs">
          <Tab label="Danh sách bài test" value="list" icon={<ListIcon />} iconPosition="start" {...a11yProps('list')} />
          <Tab label={formData.testId ? "Sửa bài test" : "Thêm bài test mới"} value="create" icon={<AddCircleOutlineIcon />} iconPosition="start" {...a11yProps('create')} />
        </Tabs>
      </Box>

      {/* Tab Panel for Listing Tests */}
      <TabPanel value={activeTab} index="list">
        {loading && <LoadingSpinner />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && !error && (
          <TableContainer component={Paper} variant="outlined" sx={{mt: 2}}> {/* Thêm margin top */}
            <Table sx={{ minWidth: 650 }} aria-label="Tests table">
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell>Tên bài test</TableCell>
                  <TableCell>Link bài test</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(tests) && tests.length > 0 ? ( // Kiểm tra isArray cho chắc
                  tests.map((test) => (
                    <TableRow key={test._id} hover>
                      <TableCell component="th" scope="row">{test.name}</TableCell>
                      <TableCell sx={{maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        <Tooltip title={test.link || ''}>
                          <Link href={test.link || '#'} target="_blank" rel="noopener noreferrer" sx={{display:'flex', alignItems:'center', gap: 0.5}}>
                            <LinkIcon fontSize="small"/>
                            {test.link || 'N/A'}
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Sửa thông tin test">
                            <IconButton size="small" onClick={() => handleEditClick(test)} disabled={actionLoading.id === test._id}>
                              <EditIcon fontSize='small'/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa bài test">
                             <span>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(test._id)}
                                    disabled={actionLoading.id === test._id}
                                >
                                    {actionLoading.type === 'delete' && actionLoading.id === test._id
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
                    <TableCell colSpan={4} align="center">Chưa có bài test nào được tạo.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Tab Panel for Creating/Editing Test */}
      <TabPanel value={activeTab} index="create">
        <Typography variant='h6' gutterBottom>
            {formData.testId ? 'Chỉnh sửa thông tin bài test' : 'Thêm Link bài test mới'}
        </Typography>
        <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2, maxWidth: 600 /* Giới hạn chiều rộng form */ }}>
            <Stack spacing={3}>
                 <TextField
                    required
                    fullWidth
                    label="Tên bài test"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    variant="outlined"
                    disabled={isSubmitting}
                 />
                  <TextField
                    required
                    fullWidth
                    label="Link bài test (URL)"
                    name="link"
                    type="url" // <<< Thêm type url để có validation cơ bản của trình duyệt
                    value={formData.link}
                    onChange={handleFormChange}
                    variant="outlined"
                    placeholder="https://docs.google.com/forms/d/e/..."
                    disabled={isSubmitting}
                 />
                 {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}
                 <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {/* Sửa lại nút này thành Cancel Edit hoặc Reset Add */}
                      <Button
                        type="button"
                        onClick={formData.testId ? () => setActiveTab('list') : handleAddNewClick} // Quay về list nếu đang sửa, reset form nếu đang thêm
                        disabled={isSubmitting}
                        variant="outlined"
                      >
                        {formData.testId ? 'Hủy bỏ' : 'Xóa form'}
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        {formData.testId ? 'Lưu thay đổi' : 'Thêm bài test'} {/* Đổi chữ nút thêm */}
                      </Button>
                 </Box>
            </Stack>
        </Box>
      </TabPanel>

      {/* Dialog Xác nhận Xóa */}
      <ConfirmDialog
          open={showDeleteConfirm}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Xác nhận xóa bài test"
          contentText={`Bạn có chắc chắn muốn xóa bài test "${tests.find(t=>t.testId === deletingTestId)?.name || 'này'}" không?`} // Hiển thị tên test
      />

      {/* Snackbar */}
      <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
       >
           <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
               {snackbar.message}
           </Alert>
       </Snackbar>

    </Paper>
  );
}


// Thêm lại TabPanel helper nếu nó chưa có ở file khác
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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = { // Thêm PropTypes cho TabPanel
  children: PropTypes.node,
  index: PropTypes.string.isRequired, // value của Tab là string ('list', 'create')
  value: PropTypes.string.isRequired,
};


export default ManageTestsPage;
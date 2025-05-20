// src/pages/candidate/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import apiService from '../../services/api';

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';

// Import Icons
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import ListItemIcon from '@mui/material/ListItemIcon';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

function CandidateProfilePage() {
  const { authState, setAuthState, updateUserProfile } = useAuth();
  const currentUser = authState.user;
  const theme = useTheme();

  const initialEditableProfile = {
    fullName: '', phone: '', address: '', dateOfBirth: '',
    linkedin: '', portfolio: '', summary: '',
  };

  const initialEducationData = { school: '', degree: '', startYear: '', endYear: '' };
  const initialExperienceData = { company: '', title: '', startDate: '', endDate: '', description: '' };

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editableProfileData, setEditableProfileData] = useState(initialEditableProfile);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editableEducationData, setEditableEducationData] = useState(initialEducationData);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [editableExperienceData, setEditableExperienceData] = useState(initialExperienceData);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editableSkills, setEditableSkills] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState('');
  const [formActionLoading, setFormActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);

  const renderSectionHeader = (title, icon, onEditToggle, isEditingSection, addAction) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
            {icon && React.cloneElement(icon, { color: "primary", sx:{fontSize: '1.75rem'} })}
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>{title}</Typography>
        </Stack>
        <Box>
            {isEditingSection ? (
                <>
                    <Tooltip title="Hủy bỏ">
                        <IconButton size="small" onClick={onEditToggle} disabled={formActionLoading} sx={{mr:0.5}}>
                            <CancelOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Lưu thay đổi">
                        <span>
                            <IconButton size="small" onClick={
                                title === "Thông tin cá nhân" ? handleSavePersonalInfo :
                                title === "Kỹ năng" ? handleSaveSkills :
                                null
                            } disabled={formActionLoading}>
                                {formActionLoading ? <CircularProgress size={20} /> : <SaveOutlinedIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                </>
            ) : (
                addAction ? (
                    <Tooltip title={`Thêm ${title.toLowerCase().replace('quản lý ', '')}`}>
                        <IconButton size="small" onClick={addAction} disabled={formActionLoading || editingEducationId || editingExperienceId}>
                            <AddCircleOutlineOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={onEditToggle} disabled={formActionLoading || editingEducationId || editingExperienceId}>
                            <EditOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                )
            )}
        </Box>
    </Stack>
  );

  useEffect(() => {
     console.log('[PROFILE PAGE] selectedFile state changed to:', selectedFile);
    if (currentUser) {
      if (isEditingPersonalInfo) {
        setEditableProfileData({
          fullName: currentUser.fullName || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          dateOfBirth: currentUser.dateOfBirth ? currentUser.dateOfBirth.split('T')[0] : '',
          linkedin: currentUser.linkedin || '',
          portfolio: currentUser.portfolio || '',
          summary: currentUser.summary || '',
        });
      }
      if (isEditingSkills) {
        setEditableSkills(Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '');
      }
    }
  }, [currentUser, isEditingPersonalInfo, isEditingSkills]);

  if (!currentUser && !authState.isLoading) {
    return (
        <Container maxWidth="sm" sx={{py: 5, textAlign: 'center'}}>
            <Alert severity="warning">Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ.</Alert>
        </Container>
    );
  }
  if (authState.isLoading || (!currentUser && authState.isLoading)) {
      return <LoadingSpinner />;
  }
  if (!currentUser) {
      return <Typography sx={{textAlign:'center', mt:3}}>Không thể tải thông tin người dùng.</Typography>;
  }

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setEditableProfileData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleToggleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
    if (isEditingPersonalInfo && currentUser) {
        setEditableProfileData({
            fullName: currentUser.fullName || '', phone: currentUser.phone || '',
            address: currentUser.address || '', dateOfBirth: currentUser.dateOfBirth ? currentUser.dateOfBirth.split('T')[0] : '',
            linkedin: currentUser.linkedin || '', portfolio: currentUser.portfolio || '',
            summary: currentUser.summary || '',
        });
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSavePersonalInfo = async () => {
    setFormActionLoading(true);
    setSnackbar({ ...snackbar, open: false });
    try {
        const dataToUpdate = {
            ...editableProfileData,
            dateOfBirth: editableProfileData.dateOfBirth || null,
        };
        await updateUserProfile(dataToUpdate);
        setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success'});
        setIsEditingPersonalInfo(false);
    } catch(err) {
         console.error("Lỗi khi cập nhật profile:", err);
         setSnackbar({ open: true, message: err.response?.data?.message || err.message || 'Lỗi! Không thể cập nhật thông tin.', severity: 'error'});
    } finally {
        setFormActionLoading(false);
    }
  };

  // >>> HÀM handleCloseSnackbar ĐƯỢC ĐỊNH NGHĨA Ở ĐÂY <<<
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditEducationClick = (edu) => {
    setEditingEducationId(edu._id);
    setEditableEducationData({ ...edu, startYear: edu.startYear || '', endYear: edu.endYear || '' });
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddEducationClick = () => {
    setEditingEducationId('new');
    setEditableEducationData(initialEducationData);
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancelEducationEdit = () => {
    setEditingEducationId(null);
    setEditableEducationData(initialEducationData);
  };

  const handleEducationInputChange = (event) => {
    const { name, value } = event.target;
    setEditableEducationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEducation = async () => {
     if (!editableEducationData?.school || !editableEducationData?.degree) {
      setSnackbar({ open: true, message: 'Vui lòng nhập Tên trường và Bằng cấp.', severity: 'error'});
      return;
    }
     setFormActionLoading(true);
     const currentEducation = Array.isArray(currentUser.education) ? currentUser.education : [];
     let updatedEducationList;
     if (editingEducationId === 'new') {
      const newItem = { ...editableEducationData };
      delete newItem._id;
      updatedEducationList = [...currentEducation, newItem];
     } else {
      updatedEducationList = currentEducation.map(edu => edu._id === editingEducationId ? { ...edu, ...editableEducationData } : edu );
     }
     try {
        await updateUserProfile({ education: updatedEducationList });
        setSnackbar({ open: true, message: editingEducationId === 'new' ? 'Thêm học vấn thành công!' : 'Cập nhật học vấn thành công!', severity: 'success'});
        handleCancelEducationEdit();
     } catch(err){
        setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể lưu học vấn.', severity: 'error'});
     } finally {
        setFormActionLoading(false);
     }
  };

   const handleEditExperienceClick = (exp) => {
       setEditingExperienceId(exp._id);
       setEditableExperienceData({ ...exp });
       setSnackbar({ ...snackbar, open: false });
    };

   const handleAddExperienceClick = () => {
       setEditingExperienceId('new');
       setEditableExperienceData(initialExperienceData);
       setSnackbar({ ...snackbar, open: false });
    };

   const handleCancelExperienceEdit = () => {
       setEditingExperienceId(null);
       setEditableExperienceData(initialExperienceData);
    };

   const handleExperienceInputChange = (event) => {
       const { name, value } = event.target;
       setEditableExperienceData(prev => ({ ...prev, [name]: value }));
    };

   const handleSaveExperience = async () => {
     if (!editableExperienceData?.company || !editableExperienceData?.title) {
         setSnackbar({ open: true, message: 'Vui lòng nhập Tên công ty và Chức danh.', severity: 'error'}); return;
        }
     setFormActionLoading(true);
     const currentExperience = Array.isArray(currentUser.experience) ? currentUser.experience : [];
     let updatedExperienceList;
     if (editingExperienceId === 'new') {
        const newItem = { ...editableExperienceData };
        delete newItem._id;
        updatedExperienceList = [...currentExperience, newItem];
     } else {
        updatedExperienceList = currentExperience.map(exp => exp._id === editingExperienceId ? { ...exp, ...editableExperienceData } : exp );
     }
     try {
        await updateUserProfile({ experience: updatedExperienceList });
        setSnackbar({ open: true, message: editingExperienceId === 'new' ? 'Thêm kinh nghiệm thành công!' : 'Cập nhật kinh nghiệm thành công!', severity: 'success'});
        handleCancelExperienceEdit();
    } catch(err){
        setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể lưu kinh nghiệm.', severity: 'error'});
    } finally {
        setFormActionLoading(false);
    }
   };

   const handleToggleEditSkills = () => {
       setIsEditingSkills(!isEditingSkills);
       if (isEditingSkills && currentUser) {
           setEditableSkills(Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '');
           setSnackbar({ ...snackbar, open: false });
       } else if (currentUser) {
            setEditableSkills(Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '');
       }
   };

   const handleSkillsInputChange = (event) => {
       setEditableSkills(event.target.value);
   };

   const handleSaveSkills = async () => {
       setFormActionLoading(true);
       const newSkillsArray = editableSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
       try {
           await updateUserProfile({ skills: newSkillsArray });
           setSnackbar({ open: true, message: 'Cập nhật kỹ năng thành công!', severity: 'success' });
           setIsEditingSkills(false);
       } catch(err) {
           setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể lưu kỹ năng.', severity: 'error' });
       } finally {
           setFormActionLoading(false);
       }
   };

  const handleOpenDeleteDialog = (itemId, itemType) => {
     setDeletingItemId(itemId); setDeleteItemType(itemType); setShowDeleteConfirm(true); setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseDeleteDialog = () => {
     setShowDeleteConfirm(false); setDeletingItemId(null); setDeleteItemType('');
  };

  const handleConfirmDelete = async () => {
    setFormActionLoading(true);
    let updatePayload = {};
    let successMessage = '';

    if (deleteItemType === 'education') {
        const updatedList = currentUser.education.filter(edu => edu._id !== deletingItemId);
        updatePayload = { education: updatedList };
        successMessage = 'Đã xóa học vấn thành công!';
    } else if (deleteItemType === 'experience') {
       const updatedList = currentUser.experience.filter(exp => exp._id !== deletingItemId);
       updatePayload = { experience: updatedList };
       successMessage = 'Đã xóa kinh nghiệm thành công!';
    } else if (deleteItemType === 'cv') {
        try {
            await apiService.deleteCvApi(deletingItemId);
            setAuthState(prevState => {
                const updatedUser = {
                    ...prevState.user,
                    uploadedCVs: prevState.user.uploadedCVs.filter(cv => cv._id !== deletingItemId)
                };
                localStorage.setItem('authUser', JSON.stringify(updatedUser));
                return {...prevState, user: updatedUser};
            });
            successMessage = 'Đã xóa CV thành công!';
            setSnackbar({ open: true, message: successMessage, severity: 'success'});
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể xóa CV.', severity: 'error'});
        } finally {
            setFormActionLoading(false);
            handleCloseDeleteDialog();
            return;
        }
    }

     try {
        if(Object.keys(updatePayload).length > 0){
            await updateUserProfile(updatePayload);
            setSnackbar({ open: true, message: successMessage, severity: 'success'});
        }
    } catch(err) {
        setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi! Không thể xóa.', severity: 'error'});
    } finally {
        setFormActionLoading(false);
        handleCloseDeleteDialog();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    console.log('[PROFILE PAGE] File input change event triggered. File from event:', file);
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
           setSnackbar({ open: true, message: 'Loại file không hợp lệ. Chỉ chấp nhận .pdf, .doc, .docx.', severity: 'error' });
           setSelectedFile(null); event.target.value = null; return;
      }
       if (file.size > 5 * 1024 * 1024) {
           setSnackbar({ open: true, message: 'Dung lượng file không được vượt quá 5MB.', severity: 'error' });
            setSelectedFile(null); event.target.value = null; return;
       }
      setSelectedFile(file);
      setSnackbar({ ...snackbar, open: false });
    }
  };

  const handleCancelFileSelect = () => {
    console.log('[PROFILE PAGE] handleCancelFileSelect called. Setting selectedFile to null.');
    setSelectedFile(null);
    const fileInput = document.getElementById('cvUploadInput');
    if(fileInput) fileInput.value = null;
  };

  const handleUploadCV = async () => {
    console.log('[PROFILE PAGE] handleUploadCV called. Current value of selectedFile:', selectedFile);
    // ADD THESE LINES:
    console.log('[PROFILE PAGE] currentUser in handleUploadCV:', currentUser);
    console.log('[PROFILE PAGE] currentUser._id in handleUploadCV:', currentUser?._id);
    if (!selectedFile || !currentUser?.id) {
        setSnackbar({ open: true, message: 'Vui lòng chọn file CV trước khi tải lên.', severity: 'warning' });
        return;
    }
    setIsUploadingCV(true);
    setSnackbar({ ...snackbar, open: false });
    const formData = new FormData();
    formData.append('cvFile', selectedFile);
    try {
        const response = await apiService.uploadCvApi(formData);
        if (response.data && response.data.newCv) {
            const newCvData = response.data.newCv;
            setAuthState((prevState) => {
                const existingCVs = Array.isArray(prevState.user?.uploadedCVs) ? prevState.user.uploadedCVs : [];
                const updatedCVs = [newCvData, ...existingCVs];
                const updatedUser = { ...prevState.user, uploadedCVs: updatedCVs };
                localStorage.setItem('authUser', JSON.stringify(updatedUser));
                return { ...prevState, user: updatedUser };
            });
            setSnackbar({ open: true, message: response.data.message || "Tải lên CV thành công!", severity: 'success' });
            setSelectedFile(null);
             const fileInput = document.getElementById('cvUploadInput');
             if(fileInput) fileInput.value = null;
        } else {
             throw new Error(response.data?.message || 'Upload CV thất bại. Dữ liệu trả về không hợp lệ.');
        }
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Không thể tải lên CV.';
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
        setIsUploadingCV(false);
    }
  };

  const renderEducationForm = (data, handleChangeFn, handleSaveFn, handleCancelFn) => (
     <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, borderColor: alpha(theme.palette.primary.main, 0.3), borderRadius: '8px' }}>
        <Stack spacing={2}>
            <TextField required fullWidth label="Tên trường/Trung tâm" name="school" value={data?.school || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/>
            <TextField required fullWidth label="Bằng cấp/Chứng chỉ" name="degree" value={data?.degree || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/>
            <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Năm bắt đầu" name="startYear" type="number" value={data?.startYear || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/></Grid>
                <Grid item xs={6}><TextField fullWidth label="Năm kết thúc (hoặc dự kiến)" name="endYear" type="number" value={data?.endYear || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/></Grid>
            </Grid>
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{pt:1}}>
                <Button onClick={handleCancelFn} disabled={formActionLoading} size="small" color="inherit" sx={{borderRadius: '6px'}}>Hủy</Button>
                <Button onClick={handleSaveFn} variant="contained" disabled={formActionLoading} size="small" startIcon={formActionLoading ? <CircularProgress size={16} color="inherit"/> : <SaveOutlinedIcon fontSize="small"/>} sx={{borderRadius: '6px'}}>Lưu</Button>
            </Stack>
        </Stack>
    </Paper>
  );

   const renderExperienceForm = (data, handleChangeFn, handleSaveFn, handleCancelFn) => (
    <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, borderColor: alpha(theme.palette.primary.main, 0.3), borderRadius: '8px' }}>
        <Stack spacing={2}>
            <TextField required fullWidth label="Tên công ty" name="company" value={data?.company || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/>
            <TextField required fullWidth label="Chức danh" name="title" value={data?.title || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/>
            <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Ngày bắt đầu" name="startDate" placeholder="MM/YYYY hoặc Ngày cụ thể" value={data?.startDate || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/></Grid>
                <Grid item xs={6}><TextField fullWidth label="Ngày kết thúc" name="endDate" placeholder="MM/YYYY hoặc Hiện tại" value={data?.endDate || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/></Grid>
            </Grid>
            <TextField fullWidth label="Mô tả công việc" name="description" multiline rows={4} value={data?.description || ''} onChange={handleChangeFn} variant="outlined" size="small" disabled={formActionLoading}/>
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{pt:1}}>
                <Button onClick={handleCancelFn} disabled={formActionLoading} size="small" color="inherit" sx={{borderRadius: '6px'}}>Hủy</Button>
                <Button onClick={handleSaveFn} variant="contained" disabled={formActionLoading} size="small" startIcon={formActionLoading ? <CircularProgress size={16} color="inherit"/> : <SaveOutlinedIcon fontSize="small"/>} sx={{borderRadius: '6px'}}>Lưu</Button>
            </Stack>
        </Stack>
    </Paper>
  );

  const InfoDisplayItem = ({icon, value, href, placeholder = "Chưa cập nhật"}) => (
    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.8, gap: 1.5 }}> {/* sm={6} để 2 cột trên màn hình nhỏ */}
        {icon && React.cloneElement(icon, {color: "action", sx: {fontSize: '1.35rem', mt: '2px'}})}
        <Box>
            {/* <Typography variant="body2" component="span" sx={{fontWeight: 500, color: 'text.secondary', display:'block', mb:0.2 }}>
                {label}
            </Typography> */}
            {href ? (
                <Link href={value && value.startsWith('http') ? value : `http://${value}`} target="_blank" rel="noopener noreferrer" variant="body1" color="primary.main" sx={{wordBreak: 'break-all', display:'block', fontWeight:500}}>
                    {value || <Typography component="em" color="text.disabled" sx={{fontStyle:'italic'}}>{placeholder}</Typography>}
                </Link>
            ) : (
                <Typography variant="body1" color={value ? "text.primary" : "text.disabled"} sx={{wordBreak: 'break-all', display:'block', fontStyle: value ? 'normal' : 'italic'}}>
                    {value || placeholder}
                </Typography>
            )}
        </Box>
    </Grid>
  );


  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
        Hồ sơ của tôi
      </Typography>

      {/* Section: Thông tin cá nhân */}
      <Paper sx={{ p: {xs:2, md:3}, mb: 3.5, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
          {renderSectionHeader("Thông tin cá nhân", <PersonOutlineOutlinedIcon/>, handleToggleEditPersonalInfo, isEditingPersonalInfo)}
          <Divider sx={{ mb: 2.5 }}/>
          <Grid container spacing={isEditingPersonalInfo ? 2 : 0.5 } direction="column"> {/* Giảm spacing khi hiển thị */}
              {!isEditingPersonalInfo ? (
                  <>
                      <InfoDisplayItem icon={<EmailOutlinedIcon/>} label="Email" value={currentUser.email} />
                      <InfoDisplayItem icon={<PhoneOutlinedIcon/>} label="Điện thoại" value={currentUser.phone} />
                      <InfoDisplayItem icon={<CakeOutlinedIcon/>} label="Ngày sinh" value={currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString('vi-VN') : ''} />
                      <InfoDisplayItem icon={<LocationOnOutlinedIcon/>} label="Địa chỉ" value={currentUser.address} />
                      <InfoDisplayItem icon={<LinkedInIcon/>} label="LinkedIn" value={currentUser.linkedin} href={currentUser.linkedin} />
                      <InfoDisplayItem icon={<LinkIcon/>} label="Portfolio" value={currentUser.portfolio} href={currentUser.portfolio} />
                      <Grid item xs={12} sx={{mt: 1.5}}>
                          <Typography variant="subtitle1" sx={{fontWeight: 500, color: 'text.secondary', mb:0.5}}>Giới thiệu bản thân:</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: currentUser.summary ? 'text.primary' : 'text.disabled', fontStyle: currentUser.summary ? 'normal' : 'italic', lineHeight: 1.7 }}>
                            {currentUser.summary || 'Chưa cập nhật giới thiệu.'}
                          </Typography>
                      </Grid>
                  </>
              ) : (
                   editableProfileData && <>
                      <Grid item xs={12}>
                          <TextField label="Họ và Tên (*)" name="fullName" value={editableProfileData.fullName} onChange={handleProfileInputChange} fullWidth required variant="outlined" size="small" disabled={formActionLoading}/>
                      </Grid>
                      <Grid item xs={12} md={6}>
                           <TextField label="Email" value={currentUser.email} fullWidth disabled variant="outlined" size="small" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField label="Số điện thoại" name="phone" value={editableProfileData.phone} onChange={handleProfileInputChange} fullWidth variant="outlined" size="small" disabled={formActionLoading}/>
                      </Grid>
                       <Grid item xs={12} md={6}>
                          <TextField label="Ngày sinh" name="dateOfBirth" type="date" value={editableProfileData.dateOfBirth} onChange={handleProfileInputChange} fullWidth variant="outlined" size="small" disabled={formActionLoading} InputLabelProps={{ shrink: true }}/>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField label="Địa chỉ" name="address" value={editableProfileData.address} onChange={handleProfileInputChange} fullWidth variant="outlined" size="small" disabled={formActionLoading}/>
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField label="LinkedIn Profile URL" name="linkedin" value={editableProfileData.linkedin} onChange={handleProfileInputChange} fullWidth variant="outlined" size="small" disabled={formActionLoading} placeholder="https://linkedin.com/in/yourprofile"/>
                      </Grid>
                      <Grid item xs={12} md={6}>
                           <TextField label="Portfolio URL" name="portfolio" value={editableProfileData.portfolio} onChange={handleProfileInputChange} fullWidth variant="outlined" size="small" disabled={formActionLoading} placeholder="https://yourportfolio.com"/>
                      </Grid>
                       <Grid item xs={12}>
                           <TextField label="Giới thiệu bản thân" name="summary" value={editableProfileData.summary} onChange={handleProfileInputChange} fullWidth multiline rows={5} variant="outlined" size="small" disabled={formActionLoading} placeholder="Mô tả ngắn gọn về kinh nghiệm và mục tiêu nghề nghiệp của bạn..."/>
                      </Grid>
                   </>
              )}
          </Grid>
      </Paper>

      {/* Section: Học vấn */}
      <Paper sx={{ p: {xs:2, md:3}, mb: 3.5, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
        {renderSectionHeader("Học vấn", <SchoolOutlinedIcon/>, null, editingEducationId !== null, handleAddEducationClick)}
        <Divider sx={{ mb: 2.5 }}/>
        {editingEducationId === 'new' && renderEducationForm(editableEducationData, handleEducationInputChange, handleSaveEducation, handleCancelEducationEdit)}
        {currentUser.education && currentUser.education.length > 0 ? (
            currentUser.education.map(edu => (
                editingEducationId === edu._id ? (
                    <Box key={`edit-${edu._id}`}>
                        {renderEducationForm(editableEducationData, handleEducationInputChange, handleSaveEducation, handleCancelEducationEdit)}
                    </Box>
                ) : (
                <Paper key={edu._id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: '8px', position: 'relative', '&:hover .action-buttons': {opacity: 1} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>{edu.school}</Typography>
                            <Typography variant="body1" color="text.secondary">{edu.degree}</Typography>
                            <Typography variant="caption" color="text.secondary">{edu.startYear} - {edu.endYear || 'Hiện tại'}</Typography>
                        </Box>
                         <Stack direction="row" spacing={0.5} className="action-buttons" sx={{opacity: {xs:1, sm:0}, transition: 'opacity 0.2s'}}>
                            <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => handleEditEducationClick(edu)} disabled={formActionLoading || !!editingEducationId}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleOpenDeleteDialog(edu._id, 'education')} disabled={formActionLoading || !!editingEducationId}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                         </Stack>
                    </Box>
                </Paper>
                )
            ))
         ) : (
             editingEducationId !== 'new' && <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py:2, fontStyle: 'italic'}}>Chưa có thông tin học vấn. Nhấn nút (+) để thêm.</Typography>
         )}
      </Paper>

      {/* Section: Kinh nghiệm làm việc */}
      <Paper sx={{ p: {xs:2, md:3}, mb: 3.5, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
        {renderSectionHeader("Kinh nghiệm làm việc", <WorkOutlineOutlinedIcon/>, null, editingExperienceId !== null, handleAddExperienceClick)}
        <Divider sx={{ mb: 2.5 }}/>
        {editingExperienceId === 'new' && renderExperienceForm(editableExperienceData, handleExperienceInputChange, handleSaveExperience, handleCancelExperienceEdit)}
        {currentUser.experience && currentUser.experience.length > 0 ? (
            currentUser.experience.map(exp => (
                editingExperienceId === exp._id ? (
                    <Box key={`edit-${exp._id}`}>
                        {renderExperienceForm(editableExperienceData, handleExperienceInputChange, handleSaveExperience, handleCancelExperienceEdit)}
                    </Box>
                ) : (
                <Paper key={exp._id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: '8px', position: 'relative', '&:hover .action-buttons': {opacity: 1} }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>{exp.title}</Typography>
                            <Typography variant="body1" color="text.secondary">{exp.company}</Typography>
                            <Typography variant="caption" color="text.secondary">{exp.startDate} - {exp.endDate || 'Hiện tại'}</Typography>
                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line', color: 'text.secondary' }}>{exp.description}</Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} className="action-buttons" sx={{opacity: {xs:1, sm:0}, transition: 'opacity 0.2s'}}>
                            <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => handleEditExperienceClick(exp)} disabled={formActionLoading || !!editingExperienceId}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleOpenDeleteDialog(exp._id, 'experience')} disabled={formActionLoading || !!editingExperienceId}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                     </Box>
                </Paper>
                )
            ))
         ) : (
             editingExperienceId !== 'new' && <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py:2, fontStyle: 'italic'}}>Chưa có kinh nghiệm làm việc. Nhấn nút (+) để thêm.</Typography>
         )}
      </Paper>

      {/* Section: Kỹ năng */}
      <Paper sx={{ p: {xs:2, md:3}, mb: 3.5, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
         {renderSectionHeader("Kỹ năng", <BuildOutlinedIcon/>, handleToggleEditSkills, isEditingSkills)}
         <Divider sx={{ mb: 2.5 }}/>
         {isEditingSkills ? (
              <TextField
                label="Các kỹ năng (ngăn cách bởi dấu phẩy)" fullWidth multiline rows={3}
                value={editableSkills} onChange={handleSkillsInputChange} disabled={formActionLoading}
                variant="outlined" size="small" placeholder="Ví dụ: ReactJS, NodeJS, English, Kỹ năng giao tiếp..."
                helperText="Nhập các kỹ năng của bạn, mỗi kỹ năng cách nhau bằng dấu phẩy."
              />
         ) : (
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentUser.skills && currentUser.skills.length > 0 ? (
                    currentUser.skills.map(skill => <Chip key={skill} label={skill} variant="outlined" color="primary" sx={{fontWeight: 500, borderRadius: '8px', p: 0.5}}/>)
                ) : ( <Typography variant="body2" color="text.secondary" sx={{fontStyle:'italic'}}>Chưa cập nhật kỹ năng.</Typography> )}
             </Box>
         )}
      </Paper>

      {/* Section: Quản lý CV */}
      <Paper sx={{ p: {xs:2, md:3}, mb: 3.5, borderRadius: '12px', boxShadow: theme.shadows[2] }}>
         <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems={{xs:'flex-start', sm:'center'}} mb={1.5} flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <ArticleOutlinedIcon color="primary" sx={{fontSize: '1.75rem'}}/>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Quản lý CV</Typography>
            </Stack>
             <Button
                component="label" variant="contained" size="small"
                startIcon={<CloudUploadOutlinedIcon />}
                disabled={isUploadingCV || !!selectedFile}
                sx={{borderRadius: '8px', textTransform: 'none', py: 0.8, px: 1.5}}
            >
                {selectedFile ? "Đã chọn file để tải" : "Tải lên CV mới"}
                <input type="file" id="cvUploadInput" hidden accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileSelect}/>
            </Button>
         </Stack>
         <Divider sx={{ my: 2 }}/>
         {selectedFile && (
             <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, mb: 2, borderRadius: '8px', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>
                 <Stack direction="row" alignItems="center" spacing={1} sx={{overflow: 'hidden', flexGrow: 1, mr:1}}>
                    <DescriptionOutlinedIcon color="primary"/>
                    <Tooltip title={selectedFile.name}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedFile.name}
                        </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                 </Stack>
                 <Stack direction="row" spacing={1}>
                      <Tooltip title="Hủy chọn">
                        <IconButton size="small" onClick={handleCancelFileSelect} disabled={isUploadingCV} color="default">
                             <CancelOutlinedIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                      <Button variant="contained" size="small" startIcon={isUploadingCV ? <CircularProgress size={16} color="inherit" /> : <UploadFileOutlinedIcon />} onClick={handleUploadCV} disabled={isUploadingCV} sx={{borderRadius: '6px', textTransform: 'none'}}>
                        Tải lên
                    </Button>
                 </Stack>
             </Paper>
         )}
         <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 500, color: 'text.secondary', mb: 1}}>CV đã tải lên:</Typography>
         <List dense>
            {currentUser.uploadedCVs && currentUser.uploadedCVs.length > 0 ? (
                currentUser.uploadedCVs.map(cv => (
                    <ListItem
                        key={cv._id}
                        secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Tải xuống CV">
                                    <span>
                                        <IconButton edge="end" aria-label="download" href={cv.url.startsWith('http') ? cv.url : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5001'}${cv.url}`} target="_blank" disabled={!cv.url || cv.url === '#'} download={cv.fileName}>
                                            <DownloadIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Xóa CV này">
                                    <span>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(cv._id, 'cv')} disabled={formActionLoading || isUploadingCV}>
                                            <DeleteOutlineOutlinedIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        }
                        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 0 }, pr: {xs:1, sm:12}, '&:hover': {bgcolor: alpha(theme.palette.action.hover, 0.03)}, borderRadius: '8px', mb: 0.5, py: 1 }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <ArticleOutlinedIcon fontSize="small" color="action"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography variant="body1" sx={{fontWeight: 500}}>{cv.fileName}</Typography>}
                            secondary={`Tải lên: ${cv.uploadDate ? new Date(cv.uploadDate).toLocaleDateString('vi-VN') : 'N/A'}`}
                        />
                    </ListItem>
                ))
            ) : (
                 <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py:2, fontStyle: 'italic'}}>Bạn chưa tải lên CV nào.</Typography>
            )}
         </List>
      </Paper>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        contentText={`Bạn có chắc chắn muốn xóa mục ${
            deleteItemType === 'education' ? 'học vấn' :
            deleteItemType === 'experience' ? 'kinh nghiệm' :
            deleteItemType === 'cv' ? 'CV' : 'này'
        } này không? Hành động này không thể hoàn tác.`}
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity || 'info'} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
            {snackbar.message}
        </Alert>
    </Snackbar>
    </Container>
  );
}

export default CandidateProfilePage;

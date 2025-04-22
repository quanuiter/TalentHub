// src/pages/candidate/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';

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

// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotesIcon from '@mui/icons-material/Notes'; // Icon Ghi chú (có thể dùng cho mô tả kinh nghiệm)

function CandidateProfilePage() {
  const { authState, updateUserProfile } = useAuth();
  const currentUser = authState.user;

  // State Edit Personal Info
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editableProfileData, setEditableProfileData] = useState(null);

  // State Edit Inline Education
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editableEducationData, setEditableEducationData] = useState(null);

  // Bên dưới state của KinhNhgiem
  const [editingExperienceId, setEditingExperienceId] = useState(null); // null, 'new', hoặc id
  const [editableExperienceData, setEditableExperienceData] = useState(null);

  // State Edit Skills
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editableSkills, setEditableSkills] = useState(''); // Lưu dạng string, ngăn cách bởi dấu phẩy

  // State Delete Confirm và Snackbar
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [deleteItemType, setDeleteItemType] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Effect cập nhật editableProfileData khi bắt đầu sửa Personal Info
  useEffect(() => {
    if (currentUser && isEditingPersonalInfo) {
      setEditableProfileData({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '', 
        dateOfBirth: currentUser.dateOfBirth || '',
        linkedin: currentUser.linkedin || '', 
        portfolio: currentUser.portfolio || '',
        summary: currentUser.summary || '',
      });
    } else { setEditableProfileData(null); }
  }, [currentUser, isEditingPersonalInfo]);

  // Effect cập nhật editableSkills khi bắt đầu sửa Skills
   useEffect(() => {
    if (currentUser && isEditingSkills) {
      setEditableSkills(currentUser.skills?.join(', ') || ''); // Nối mảng thành string
    } else { setEditableSkills(''); }
  }, [currentUser, isEditingSkills]);

  if (!currentUser) {
    return <Typography>Không thể tải thông tin người dùng.</Typography>;
  }
  // --- Handlers cho Personal Info ---
  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setEditableProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleToggleEditPersonalInfo = () => {
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
    // Reset lỗi khi hủy
    if (isEditingPersonalInfo) {
       setSnackbar({ ...snackbar, open: false });
    }
  };
  // Handler khi bấm nút Lưu
  const handleSavePersonalInfo = async () => {
    setLoading(true);
    setSnackbar({ ...snackbar, open: false }); // Đóng snackbar cũ (nếu có)

    try {
        const success = await updateUserProfile(editableProfileData); // Gọi hàm update giả lập từ context
        if (success) {
            setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success'});
            setIsEditingPersonalInfo(false); // Thoát chế độ edit
        } else {
             setSnackbar({ open: true, message: 'Lỗi! Không thể cập nhật thông tin.', severity: 'error'});
        }
    } catch(err) {
         console.error("Lỗi khi cập nhật profile:", err);
         setSnackbar({ open: true, message: 'Lỗi! Không thể cập nhật thông tin.', severity: 'error'});
    } finally {
        setLoading(false);
    }
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  // --- Handlers cho Inline Edit Education ---
  const handleEditEducationClick = (edu) => { 
    setEditingEducationId(edu.id); 
    setEditableEducationData({ ...edu }); 
    setSnackbar({ ...snackbar, open: false }); 
  };
  const handleAddEducationClick = () => { 
    setEditingEducationId('new'); 
    setEditableEducationData({ school: '', degree: '', startYear: '', endYear: '' }); 
    setSnackbar({ ...snackbar, open: false }); 
  };
  const handleCancelEducationEdit = () => { 
    setEditingEducationId(null); 
    setEditableEducationData(null); 
  };
  const handleEducationInputChange = (event) => { 
    const { name, value } = event.target; 
    setEditableEducationData(prev => ({ ...prev, [name]: value })); 
  };
  const handleSaveEducation = async () => { /* ... như cũ ... */
     if (!editableEducationData?.school || !editableEducationData?.degree) { 
      setSnackbar({ open: true, message: 'Vui lòng nhập Tên trường và Bằng cấp.', severity: 'error'}); 
      return; }
     setLoading(true); const currentEducation = currentUser.education || []; 
     let updatedEducationList;
     if (editingEducationId === 'new') { 
      const newItem = { ...editableEducationData, id: `edu_${Date.now()}` }; 
      updatedEducationList = [...currentEducation, newItem];
     } else { updatedEducationList = currentEducation.map(edu => edu.id === editingEducationId ? { ...editableEducationData } : edu ); }
     try { const success = await updateUserProfile({ education: updatedEducationList }); /*...*/ if(success){ setSnackbar({ open: true, message: editingEducationId === 'new' ? 'Thêm học vấn thành công!' : 'Cập nhật học vấn thành công!', severity: 'success'}); handleCancelEducationEdit(); } else {/*...*/}} catch(err){/*...*/} finally {setLoading(false);}
  };

  // --- Handlers cho Inline Edit Experience (Tương tự Education) ---
   const handleEditExperienceClick = (exp) => { setEditingExperienceId(exp.id); setEditableExperienceData({ ...exp }); setSnackbar({ ...snackbar, open: false }); };
   const handleAddExperienceClick = () => { setEditingExperienceId('new'); setEditableExperienceData({ company: '', title: '', startDate: '', endDate: '', description: '' }); setSnackbar({ ...snackbar, open: false }); };
   const handleCancelExperienceEdit = () => { setEditingExperienceId(null); setEditableExperienceData(null); };
   const handleExperienceInputChange = (event) => { const { name, value } = event.target; setEditableExperienceData(prev => ({ ...prev, [name]: value })); };
   const handleSaveExperience = async () => {
     if (!editableExperienceData?.company || !editableExperienceData?.title) { setSnackbar({ open: true, message: 'Vui lòng nhập Tên công ty và Chức danh.', severity: 'error'}); return; }
     setLoading(true); const currentExperience = currentUser.experience || []; let updatedExperienceList;
     if (editingExperienceId === 'new') { const newItem = { ...editableExperienceData, id: `exp_${Date.now()}` }; updatedExperienceList = [...currentExperience, newItem];
     } else { updatedExperienceList = currentExperience.map(exp => exp.id === editingExperienceId ? { ...editableExperienceData } : exp ); }
     try { const success = await updateUserProfile({ experience: updatedExperienceList }); /*...*/ if(success){ setSnackbar({ open: true, message: editingExperienceId === 'new' ? 'Thêm kinh nghiệm thành công!' : 'Cập nhật kinh nghiệm thành công!', severity: 'success'}); handleCancelExperienceEdit(); } else {/*...*/}} catch(err){/*...*/} finally {setLoading(false);}
   };

  // --- Handlers cho Edit Skills ---
   const handleToggleEditSkills = () => {
       setIsEditingSkills(!isEditingSkills);
       if (isEditingSkills) {
           setEditableSkills(currentUser.skills?.join(', ') || ''); // Reset về giá trị ban đầu khi hủy
           setSnackbar({ ...snackbar, open: false });
       } else {
           // Khi bắt đầu sửa, cập nhật state
            setEditableSkills(currentUser.skills?.join(', ') || '');
       }
   };
   const handleSkillsInputChange = (event) => {
       setEditableSkills(event.target.value);
   };
   const handleSaveSkills = async () => {
       setLoading(true);
       // Chuyển string thành mảng, loại bỏ khoảng trắng thừa và phần tử rỗng
       const newSkillsArray = editableSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
       try {
           const success = await updateUserProfile({ skills: newSkillsArray });
           if (success) {
               setSnackbar({ open: true, message: 'Cập nhật kỹ năng thành công!', severity: 'success' });
               setIsEditingSkills(false);
           } else {
                setSnackbar({ open: true, message: 'Lỗi! Không thể lưu kỹ năng.', severity: 'error' });
           }
       } catch(err) {
           setSnackbar({ open: true, message: 'Lỗi! Không thể lưu kỹ năng.', severity: 'error' });
       } finally {
           setLoading(false);
       }
   };

  // --- Handlers cho Delete ---
  const handleOpenDeleteDialog = (itemId, itemType) => { /* ... như cũ ... */
     setDeletingItemId(itemId); setDeleteItemType(itemType); setShowDeleteConfirm(true); setSnackbar({ ...snackbar, open: false });
  };
  const handleCloseDeleteDialog = () => { /* ... như cũ ... */
     setShowDeleteConfirm(false); setDeletingItemId(null); setDeleteItemType('');
  };
  const handleConfirmDelete = async () => { // <<< Cập nhật để xử lý nhiều type
    setLoading(true);
    let updatePayload = {};
    let successMessage = '';

    if (deleteItemType === 'education') {
        const updatedList = currentUser.education.filter(edu => edu.id !== deletingItemId);
        updatePayload = { education: updatedList };
        successMessage = 'Đã xóa học vấn thành công!';
    } else if (deleteItemType === 'experience') {
       const updatedList = currentUser.experience.filter(exp => exp.id !== deletingItemId);
       updatePayload = { experience: updatedList };
       successMessage = 'Đã xóa kinh nghiệm thành công!';
    } else if (deleteItemType === 'cv') {
        const updatedList = currentUser.uploadedCVs.filter(cv => cv.id !== deletingItemId);
        updatePayload = { uploadedCVs: updatedList };
        successMessage = 'Đã xóa CV thành công!';
    }

     try {
        if(Object.keys(updatePayload).length > 0){ // Chỉ gọi API nếu có gì để update
            const success = await updateUserProfile(updatePayload);
            if (success) {
                setSnackbar({ open: true, message: successMessage, severity: 'success'});
            } else {
                setSnackbar({ open: true, message: 'Lỗi! Không thể xóa.', severity: 'error'});
            }
        }
    } catch(err) { /*...*/ setSnackbar({ open: true, message: 'Lỗi! Không thể xóa.', severity: 'error'}); }
     finally { setLoading(false); handleCloseDeleteDialog(); }
  };

  // --- Hàm Render Form Inline (Giữ nguyên cho Education, tạo cái tương tự cho Experience) ---
  const renderEducationForm = (data, handleChange, handleSave, handleCancel) => ( /* ... như cũ ... */
     <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, borderColor: 'primary.light' }}>
        <Stack spacing={2}>
            <TextField required fullWidth label="Tên trường/Trung tâm" name="school" value={data?.school || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/>
            <TextField required fullWidth label="Bằng cấp/Chứng chỉ" name="degree" value={data?.degree || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/>
            <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Năm bắt đầu" name="startYear" type="number" value={data?.startYear || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/></Grid>
                <Grid item xs={6}><TextField fullWidth label="Năm kết thúc" name="endYear" type="number" value={data?.endYear || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/></Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCancel} disabled={loading} size="small" color="inherit">Hủy</Button><Button onClick={handleSave} variant="contained" disabled={loading} size="small" startIcon={loading ? <CircularProgress size={16} color="inherit"/> : <SaveIcon fontSize="small"/>}>Lưu</Button></Box>
        </Stack>
    </Paper>
  );

   const renderExperienceForm = (data, handleChange, handleSave, handleCancel) => (
    <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, borderColor: 'primary.light' }}>
        <Stack spacing={2}>
            <TextField required fullWidth label="Tên công ty" name="company" value={data?.company || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/>
            <TextField required fullWidth label="Chức danh" name="title" value={data?.title || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/>
            <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Ngày bắt đầu (MM/YYYY)" name="startDate" placeholder="MM/YYYY" value={data?.startDate || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/></Grid>
                <Grid item xs={6}><TextField fullWidth label="Ngày kết thúc (MM/YYYY)" name="endDate" placeholder="MM/YYYY hoặc Hiện tại" value={data?.endDate || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/></Grid>
            </Grid>
            <TextField fullWidth label="Mô tả công việc" name="description" multiline rows={3} value={data?.description || ''} onChange={handleChange} variant="outlined" size="small" disabled={loading}/>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={handleCancel} disabled={loading} size="small" color="inherit">Hủy</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading} size="small" startIcon={loading ? <CircularProgress size={16} color="inherit"/> : <SaveIcon fontSize="small"/>}>Lưu</Button>
            </Box>
        </Stack>
    </Paper>
  );

  // --- JSX Render ---
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Hồ sơ của tôi</Typography>

      {/* --- Phần Thông tin cá nhân (Code JSX giữ nguyên như bản trước) --- */}
      <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Thông tin cá nhân</Typography>
            <Box>
                {isEditingPersonalInfo ? (
                    <>
                        <Tooltip title="Hủy bỏ">
                            <IconButton size="small" onClick={handleToggleEditPersonalInfo} disabled={loading}>
                                <CancelIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Lưu thay đổi">
                            <span> {/* Thêm span để Tooltip hoạt động khi Button disabled */}
                                <IconButton size="small" onClick={handleSavePersonalInfo} disabled={loading}>
                                    {loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </>
                ) : (
                    <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={handleToggleEditPersonalInfo}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }}/>

          {/* Sử dụng Grid để bố cục */}
              {/* --- Chế độ Hiển thị --- */}
              {!isEditingPersonalInfo && (
                  <>
                      <Grid item xs={12}>
                          <Typography variant="h5" gutterBottom>{currentUser.fullName}</Typography>
                      </Grid>
                      {/* Các Grid item hiển thị thông tin khác như cũ (Email, Phone, DOB...) */}
                      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <EmailIcon color="action" fontSize="small"/> <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{currentUser.email}</Typography>
                      </Grid>
                       <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <PhoneIcon color="action" fontSize="small"/> <Typography variant="body1">{currentUser.phone || 'Chưa cập nhật'}</Typography>
                       </Grid>
                       {/* ... các grid item hiển thị khác ... */}
                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CakeIcon color="action" fontSize="small"/> <Typography variant="body1">{currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon color="action" fontSize="small"/> <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{currentUser.address || 'Chưa cập nhật'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinkedInIcon color="action" fontSize="small"/>
                            {currentUser.linkedin ? <Link href={currentUser.linkedin} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-word' }}>{currentUser.linkedin}</Link> : <Typography variant="body1">Chưa cập nhật</Typography>}
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinkIcon color="action" fontSize="small"/>
                            {currentUser.portfolio ? <Link href={currentUser.portfolio} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-word' }}>{currentUser.portfolio}</Link> : <Typography variant="body1">Chưa cập nhật</Typography>}
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>Giới thiệu:</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{currentUser.summary || 'Chưa cập nhật'}</Typography>
                        </Grid>
                  </>
              )}

               {/* --- Chế độ Chỉnh sửa --- */}
              {isEditingPersonalInfo && editableProfileData && (
                   <>
                      <Grid item xs={12} sx={{ mb: 2 }}>
                          <TextField
                              label="Họ và Tên"
                              name="fullName"
                              value={editableProfileData.fullName}
                              onChange={handleProfileInputChange}
                              fullWidth
                              required
                              variant="outlined"
                              size="small"
                              disabled={loading}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}  sx={{ mb: 2 }}>
                           <TextField label="Email" value={currentUser.email} fullWidth disabled variant="outlined" size="small" /> {/* Email thường không cho sửa */}
                      </Grid>
                      <Grid item xs={12} md={6}  sx={{ mb: 2 }}>
                          <TextField
                              label="Số điện thoại"
                              name="phone"
                              value={editableProfileData.phone}
                              onChange={handleProfileInputChange}
                              fullWidth
                              variant="outlined"
                              size="small"
                              disabled={loading}
                          />
                      </Grid>
                       <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                          <TextField
                              label="Ngày sinh"
                              name="dateOfBirth"
                              type="date" // Dùng type="date"
                              value={editableProfileData.dateOfBirth}
                              onChange={handleProfileInputChange}
                              fullWidth
                              variant="outlined"
                              size="small"
                              disabled={loading}
                              InputLabelProps={{ shrink: true }} // Luôn hiển thị label ở trên khi type="date"
                          />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                          <TextField
                              label="Địa chỉ"
                              name="address"
                              value={editableProfileData.address}
                              onChange={handleProfileInputChange}
                              fullWidth
                              variant="outlined"
                              size="small"
                              disabled={loading}
                          />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                          <TextField
                              label="LinkedIn Profile URL"
                              name="linkedin"
                              value={editableProfileData.linkedin}
                              onChange={handleProfileInputChange}
                              fullWidth
                              variant="outlined"
                              size="small"
                              disabled={loading}
                          />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                           <TextField
                              label="Portfolio URL"
                              name="portfolio"
                              value={editableProfileData.portfolio}
                              onChange={handleProfileInputChange}
                              fullWidth
                              variant="outlined"
                              size="small"
                              disabled={loading}
                          />
                      </Grid>
                       <Grid item xs={12} sx={{ space: 2 }}>
                           <TextField
                              label="Giới thiệu bản thân"
                              name="summary"
                              value={editableProfileData.summary}
                              onChange={handleProfileInputChange}
                              fullWidth
                              multiline // Cho phép nhập nhiều dòng
                              rows={4} // Số dòng hiển thị ban đầu
                              variant="outlined"
                              size="small"
                              disabled={loading}
                          />
                      </Grid>
                   </>
              )}
      </Paper>

      {/* --- Phần Học vấn (Code JSX giữ nguyên như bản trước) --- */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Học vấn</Typography>
            {editingEducationId === null && (
                <Tooltip title="Thêm học vấn">
                    <IconButton size="small" onClick={handleAddEducationClick} disabled={loading}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
        <Divider sx={{ mb: 2 }}/>
        {editingEducationId === 'new' && renderEducationForm(editableEducationData, handleEducationInputChange, handleSaveEducation, handleCancelEducationEdit)}
        {currentUser.education && currentUser.education.length > 0 ? (
            currentUser.education.map(edu => (
                editingEducationId === edu.id ? (
                    <Box key={`edit-${edu.id}`}>
                        {renderEducationForm(editableEducationData, handleEducationInputChange, handleSaveEducation, handleCancelEducationEdit)}
                    </Box>
                ) : (
                <Box key={edu.id} sx={{ mb: 2, pb: 1, borderBottom: '1px dashed #eee' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box> {/* Phần hiển thị */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{edu.school}</Typography>
                            <Typography variant="body2" color="text.secondary">{edu.degree}</Typography>
                            <Typography variant="caption" color="text.secondary">{edu.startYear} - {edu.endYear}</Typography>
                        </Box>
                         <Box> {/* Nút Edit/Delete */}
                            <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => handleEditEducationClick(edu)} disabled={loading || editingEducationId === 'new'}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleOpenDeleteDialog(edu.id, 'education')} disabled={loading || editingEducationId !== null}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                         </Box>
                    </Box>
                </Box>
                )
            ))
         ) : (
             editingEducationId !== 'new' && <Typography variant="body2">Chưa có thông tin học vấn.</Typography>
         )}
      </Paper>
      {/* --- Phần Kinh nghiệm làm việc (Cập nhật JSX) --- */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Kinh nghiệm làm việc</Typography>
             {editingExperienceId === null && (
                <Tooltip title="Thêm kinh nghiệm">
                    <IconButton size="small" onClick={handleAddExperienceClick} disabled={loading}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
             )}
        </Box>
        <Divider sx={{ mb: 2 }}/>
        {/* Hiển thị form Add nếu đang thêm mới */}
        {editingExperienceId === 'new' && renderExperienceForm(
            editableExperienceData,
            handleExperienceInputChange,
            handleSaveExperience,
            handleCancelExperienceEdit
        )}
        {/* Hiển thị danh sách */}
        {currentUser.experience && currentUser.experience.length > 0 ? (
            currentUser.experience.map(exp => (
                // Hiển thị form Edit nếu đang sửa mục này
                editingExperienceId === exp.id ? (
                    <Box key={`edit-${exp.id}`}>
                        {renderExperienceForm(
                            editableExperienceData,
                            handleExperienceInputChange,
                            handleSaveExperience,
                            handleCancelExperienceEdit
                        )}
                    </Box>
                ) : (
                // Hiển thị thông tin bình thường
                <Box key={exp.id} sx={{ mb: 2, pb: 1, borderBottom: '1px dashed #eee' }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{exp.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{exp.company}</Typography>
                            <Typography variant="caption" color="text.secondary">{exp.startDate} - {exp.endDate}</Typography>
                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{exp.description}</Typography>
                        </Box>
                        <Box>
                            <Tooltip title="Chỉnh sửa"><IconButton size="small" onClick={() => handleEditExperienceClick(exp)} disabled={loading || editingExperienceId === 'new'}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Xóa"><IconButton size="small" onClick={() => handleOpenDeleteDialog(exp.id, 'experience')} disabled={loading || editingExperienceId !== null}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                     </Box>
                </Box>
                )
            ))
         ) : (
             editingExperienceId !== 'new' && <Typography variant="body2">Chưa có kinh nghiệm làm việc.</Typography>
         )}
      </Paper>

      {/* --- Phần Kỹ năng (Cập nhật JSX) --- */}
      <Paper sx={{ p: 3, mb: 3 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Kỹ năng</Typography>
             <Box>
                {isEditingSkills ? (
                     <>
                        <Tooltip title="Hủy bỏ"><IconButton size="small" onClick={handleToggleEditSkills} disabled={loading}><CancelIcon /></IconButton></Tooltip>
                        <Tooltip title="Lưu kỹ năng"><span><IconButton size="small" onClick={handleSaveSkills} disabled={loading}>{loading ? <CircularProgress size={20} /> : <SaveIcon />}</IconButton></span></Tooltip>
                     </>
                ) : (
                    <Tooltip title="Chỉnh sửa kỹ năng"><IconButton size="small" onClick={handleToggleEditSkills} disabled={loading}><EditIcon /></IconButton></Tooltip>
                )}
            </Box>
         </Box>
         <Divider sx={{ mb: 2 }}/>
         {isEditingSkills ? (
              <TextField
                label="Các kỹ năng (ngăn cách bởi dấu phẩy)"
                fullWidth
                multiline
                rows={3}
                value={editableSkills}
                onChange={handleSkillsInputChange}
                disabled={loading}
                variant="outlined"
                size="small"
                placeholder="Ví dụ: ReactJS, NodeJS, English, ..."
              />
         ) : (
             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentUser.skills && currentUser.skills.length > 0 ? (
                    currentUser.skills.map(skill => <Chip key={skill} label={skill} />)
                ) : ( <Typography variant="body2">Chưa cập nhật kỹ năng.</Typography> )}
             </Box>
         )}
      </Paper>

      {/* --- Phần Quản lý CV (Cập nhật JSX) --- */}
      <Paper sx={{ p: 3, mb: 3 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Quản lý CV</Typography>
             {/* Nút Upload */}
             <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => document.getElementById('cvUploadInput')?.click()}
                size="small"
            >
                Tải lên CV mới
            </Button>
            <input type="file" id="cvUploadInput" hidden onChange={(e) => console.log("Selected file:", e.target.files[0])} />
         </Box>
         <Divider sx={{ my: 2 }}/>
         <List dense>
            {currentUser.uploadedCVs && currentUser.uploadedCVs.length > 0 ? (
                currentUser.uploadedCVs.map(cv => (
                    <ListItem
                        key={cv.id}
                        secondaryAction={
                            <>
                                <Tooltip title="Tải xuống"><IconButton edge="end" aria-label="download" href={cv.url} target="_blank"><DownloadIcon /></IconButton></Tooltip>
                                {/* Nút Delete gọi hàm mở Dialog Confirm */}
                                <Tooltip title="Xóa"><IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(cv.id, 'cv')} disabled={loading}><DeleteIcon /></IconButton></Tooltip>
                            </>
                        }
                        sx={{ borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 0 } }} // Bỏ border dòng cuối
                    >
                        <ListItemText
                            primary={cv.fileName}
                            secondary={`Tải lên ngày: ${new Date(cv.uploadDate).toLocaleDateString('vi-VN')}`}
                        />
                    </ListItem>
                ))
            ) : (
                 <Typography variant="body2">Bạn chưa tải lên CV nào.</Typography>
            )}
         </List>
         <Typography variant="body2" color="text.secondary" sx={{mt:2}}>(Chức năng Upload/Download CV cần xử lý Backend)</Typography>
      </Paper>

      {/* Dialog Xác nhận Xóa (Cập nhật contentText) */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        contentText={`Bạn có chắc chắn muốn xóa mục ${
            deleteItemType === 'education' ? 'học vấn' :
            deleteItemType === 'experience' ? 'kinh nghiệm' :
            deleteItemType === 'cv' ? 'CV' : 'này' // Thêm type 'cv'
        } này không? Hành động này không thể hoàn tác.`}
      />
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000} // Hoặc 6000 nếu muốn lâu hơn
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    // !!! BỎ HOÀN TOÀN prop 'message' nếu có !!!
    // !!! BỎ HOÀN TOÀN prop 'ContentProps' nếu có !!!
>
    {/* Chỉ cần Alert làm con trực tiếp */}
    {/* Thêm variant="filled" để đảm bảo có nền màu và chữ tương phản */}
    <Alert
        onClose={handleCloseSnackbar} // Cho phép đóng bằng nút 'x' trên Alert
        severity={snackbar.severity || 'info'} // Lấy severity từ state (success, error, warning, info)
        sx={{ width: '100%' }}
        variant="filled" // <<< QUAN TRỌNG: Dùng filled variant
    >
        {snackbar.message} {/* Hiển thị nội dung thông báo */}
    </Alert>
    </Snackbar>
    </Box>
  );
}

export default CandidateProfilePage;
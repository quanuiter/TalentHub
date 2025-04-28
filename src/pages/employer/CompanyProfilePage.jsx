// src/pages/employer/CompanyProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    fetchCompanyProfile,
    updateCompanyProfile,
    mockIndustriesForSelect,
    mockCompanySizes
} from '../../data/mockJobs'; // Đảm bảo đúng đường dẫn

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// Import Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business'; // Icon công ty
import LinkIcon from '@mui/icons-material/Link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People'; // Icon quy mô
import CategoryIcon from '@mui/icons-material/Category'; // Icon ngành nghề
import DescriptionIcon from '@mui/icons-material/Description'; // Icon mô tả
import PhotoCamera from '@mui/icons-material/PhotoCamera'; // Icon upload logo
import LoadingSpinner from '../../components/ui/LoadingSpinner'; // Import spinner


function EmployerCompanyProfilePage() {
  const { authState } = useAuth();
  const companyId = authState.user?.companyId;

  const [companyProfile, setCompanyProfile] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Loading trang ban đầu
  const [saving, setSaving] = useState(false); // Loading khi bấm lưu
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!companyId) {
        setError("Không tìm thấy thông tin công ty cho tài khoản này.");
        setLoading(false);
        return;
      }
      setLoading(true); setError(null);
      try {
        const data = await fetchCompanyProfile(companyId);
        if (data) { setCompanyProfile(data); }
        else { setError("Không tải được hồ sơ công ty."); setCompanyProfile(null); }
      } catch (err) { console.error("Lỗi tải hồ sơ:", err); setError("Lỗi kết nối."); setCompanyProfile(null); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [companyId]);

  // Bắt đầu chỉnh sửa
  const handleEdit = () => {
    if (!companyProfile) return;
    setEditableData({
        name: companyProfile.name || '',
        description: companyProfile.description || '',
        website: companyProfile.website || '',
        address: companyProfile.address || '',
        industry: companyProfile.industry || null, // Giữ object industry
        size: companyProfile.size || '',
    });
    setIsEditing(true); setSnackbar({ ...snackbar, open: false });
  };

  // Hủy chỉnh sửa
  const handleCancel = () => { setIsEditing(false); setEditableData(null); };

  // Handlers cho form sửa
  const handleChange = (event) => { const { name, value } = event.target; setEditableData(prev => ({ ...prev, [name]: value })); };
  const handleIndustryChange = (event, newValue) => { setEditableData(prev => ({ ...prev, industry: newValue })); };
  const handleSizeChange = (event) => { setEditableData(prev => ({ ...prev, size: event.target.value })); };

  // Lưu thay đổi
  const handleSave = async () => {
    if (!editableData || !companyId) return;
    setSaving(true); setSnackbar({ ...snackbar, open: false });
    try {
      const updatedProfile = await updateCompanyProfile(companyId, editableData);
      setCompanyProfile(updatedProfile); // Cập nhật state hiển thị
      setSnackbar({ open: true, message: 'Cập nhật hồ sơ công ty thành công!', severity: 'success' });
      setIsEditing(false); setEditableData(null);
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      setSnackbar({ open: true, message: `Lỗi! Không thể cập nhật. (${err.message})`, severity: 'error' });
    } finally { setSaving(false); }
  };

   const handleCloseSnackbar = (event, reason) => { /* ... như cũ ... */ };

  // --- Render ---
  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error" sx={{m:2}}>{error}</Alert>;
  // Hiển thị nếu fetch về null (khác với error)
  if (!companyProfile && !isEditing) return (
      <Paper sx={{p:3}}>
          <Typography>Không tìm thấy dữ liệu hồ sơ công ty (ID: {companyId}).</Typography>
          {/* Có thể thêm nút tạo hồ sơ nếu cần */}
      </Paper>
  );

  // Dữ liệu hiện tại để hiển thị (hoặc dữ liệu gốc nếu đang không sửa)
  const displayData = isEditing ? editableData : companyProfile;

  return (
    <Paper sx={{ p: 3, position: 'relative' }}>
      {/* --- Header của trang --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Hồ sơ công ty
        </Typography>
        {/* Nút Edit hoặc Save/Cancel */}
        {!isEditing ? (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} disabled={!companyProfile /* Disable nếu chưa load được data */}>
            Chỉnh sửa
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving}>
                Hủy bỏ
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
               >
                Lưu thay đổi
              </Button>
          </Stack>
        )}
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* --- Nội dung hồ sơ (Grid Layout) --- */}
      <Grid container spacing={3}>
         {/* Cột Logo */}
         <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar
                // Hiển thị logo gốc vì chưa cho sửa logo
                src={companyProfile?.logoUrl}
                alt={`${displayData?.name || ''} logo`}
                variant="rounded"
                sx={{ width: 150, height: 150, margin: 'auto', mb: 1, objectFit: 'contain', bgcolor: '#eee' }}
            />
             {isEditing && (
                 <Button component="label" size="small" startIcon={<PhotoCamera />} disabled={saving}>
                    Thay đổi Logo
                    <input type="file" hidden accept="image/*" /* onChange={handleLogoChange} */ />
                 </Button>
            )}
            {isEditing && <Typography variant="caption" display="block" color="text.secondary">(Chức năng upload sẽ làm sau)</Typography>}
         </Grid>

         {/* Cột thông tin chính */}
         <Grid item xs={12} md={9}>
            <Stack spacing={2.5}> {/* Tăng spacing một chút */}
                {/* Tên công ty */}
                {isEditing ? (
                     <TextField fullWidth required label="Tên công ty" name="name" value={editableData?.name || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                ) : (
                    <Typography variant="h4">{displayData?.name}</Typography>
                )}

                {/* Website */}
                {isEditing ? (
                    <TextField fullWidth label="Website" name="website" type="url" value={editableData?.website || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                ) : (
                    displayData?.website && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinkIcon color="action" fontSize="small"/> <Link href={displayData.website.startsWith('http') ? displayData.website : `http://${displayData.website}`} target="_blank" rel="noopener noreferrer">{displayData.website}</Link></Box>
                )}

                 {/* Ngành nghề */}
                 {isEditing ? (
                    <Autocomplete
                        id="company-industry-ac" // Thêm id khác
                        options={mockIndustriesForSelect}
                        getOptionLabel={(option) => option.label || ""}
                        value={editableData?.industry || null}
                        onChange={handleIndustryChange}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id} // Thêm kiểm tra null
                        renderInput={(params) => (<TextField {...params} label="Ngành nghề" variant="outlined" size="small"/>)}
                        disabled={saving}
                    />
                 ) : (
                    displayData?.industry && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CategoryIcon color="action" fontSize="small"/> <Typography variant="body1">{displayData.industry.label}</Typography></Box>
                 )}

                 {/* Quy mô */}
                 {isEditing ? (
                     <FormControl fullWidth size="small">
                        <InputLabel id="company-size-label">Quy mô công ty</InputLabel>
                        <Select labelId="company-size-label" name="size" value={editableData?.size || ''} label="Quy mô công ty" onChange={handleSizeChange} disabled={saving}>
                            <MenuItem value=""><em>Không chọn</em></MenuItem>
                            {mockCompanySizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                        </Select>
                    </FormControl>
                 ) : (
                    displayData?.size && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PeopleIcon color="action" fontSize="small"/> <Typography variant="body1">{displayData.size}</Typography></Box>
                 )}

                 {/* Địa chỉ */}
                 {isEditing ? (
                    <TextField fullWidth label="Địa chỉ công ty" name="address" value={editableData?.address || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                 ) : (
                    displayData?.address && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocationOnIcon color="action" fontSize="small"/> <Typography variant="body1">{displayData.address}</Typography></Box>
                 )}

                 {/* Mô tả */}
                 <Box sx={{mt: 1}}> {/* Thêm margin top cho mô tả */}
                    <Typography variant="subtitle2" sx={{fontWeight:'medium', mb: 0.5}}>Mô tả công ty:</Typography>
                    {isEditing ? (
                        <TextField fullWidth name="description" multiline rows={5} value={editableData?.description || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                    ) : (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{displayData?.description || 'Chưa có mô tả.'}</Typography>
                    )}
                 </Box>

            </Stack>
         </Grid>
      </Grid>

       {/* Snackbar */}
       <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
          </Alert>
       </Snackbar>
    </Paper>
  );
}

export default EmployerCompanyProfilePage;
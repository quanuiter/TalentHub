// src/pages/employer/CompanyProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// --- SỬA IMPORT Ở ĐÂY ---
import apiService from '../../services/api'; // Sử dụng apiService

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
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Container } from '@mui/material';

// Dữ liệu cho Selects (có thể chuyển vào constants hoặc lấy từ API sau này)
const mockIndustriesForSelect = [
  { id: 'it-software', label: 'CNTT - Phần mềm' },
  { id: 'it-hardware', label: 'CNTT - Phần cứng / Mạng' },
  { id: 'marketing', label: 'Marketing / Truyền thông / Quảng cáo' },
  { id: 'sales', label: 'Bán hàng / Kinh doanh' },
  { id: 'hr', label: 'Nhân sự' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán' },
  { id: 'design', label: 'Thiết kế / Mỹ thuật' },
  // Thêm các ngành khác nếu cần
];
const mockCompanySizes = ['Dưới 10 nhân viên', '10-50 nhân viên', '50-100 nhân viên', '100-500 nhân viên', 'Trên 500 nhân viên'];


function EmployerCompanyProfilePage() {
  const { authState, setAuthState } = useAuth(); // Lấy setAuthState để cập nhật companyName nếu cần
  // const companyId = authState.user?.companyId; // Không cần lấy companyId từ đây cho API fetch nữa

  const [companyProfile, setCompanyProfile] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadProfile = async () => {
      if (authState.user?.role !== 'employer') {
        setError("Bạn không có quyền truy cập trang này.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // --- SỬA Ở ĐÂY: Gọi API thật sự ---
        const response = await apiService.getMyCompanyProfileApi(); 
        // --- KẾT THÚC SỬA ---
        if (response && response.data) {
          const profileData = { ...response.data, id: response.data._id || response.data.id };
          setCompanyProfile(profileData);
        } else {
          setError("Không tải được hồ sơ công ty. Dữ liệu trả về không hợp lệ.");
          setCompanyProfile(null);
        }
      } catch (err) {
        console.error("Lỗi tải hồ sơ công ty của NTD:", err);
        if (err.response && err.response.status === 404) {
             setError(err.response.data.message || "Không tìm thấy hồ sơ công ty. Bạn có thể cần tạo hồ sơ trước.");
        } else {
            setError(err.response?.data?.message || err.message || "Lỗi kết nối khi tải hồ sơ công ty.");
        }
        setCompanyProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authState.isLoading && authState.isAuthenticated) {
        loadProfile();
    } else if (!authState.isLoading && !authState.isAuthenticated) {
        setError("Vui lòng đăng nhập để xem hồ sơ công ty.");
        setLoading(false);
    }
    // Bỏ companyId khỏi dependencies vì API /my-profile không cần nó làm tham số
  }, [authState.isAuthenticated, authState.isLoading, authState.user?.role]); 

  const handleEdit = () => {
    if (!companyProfile) return;
    let industryObject = null;
    if (companyProfile.industry) {
        if (typeof companyProfile.industry === 'string') {
            industryObject = mockIndustriesForSelect.find(i => i.label === companyProfile.industry || i.id === companyProfile.industry) || null;
        } else if (typeof companyProfile.industry === 'object' && companyProfile.industry.id) {
            industryObject = companyProfile.industry;
        } else if (typeof companyProfile.industry === 'object' && !companyProfile.industry.id && companyProfile.industry.label) {
            industryObject = mockIndustriesForSelect.find(i => i.label === companyProfile.industry.label) || null;
        }
    }

    setEditableData({
        name: companyProfile.name || '',
        description: companyProfile.description || '',
        website: companyProfile.website || '',
        address: companyProfile.address || '',
        industry: industryObject,
        size: companyProfile.size || '',
        logoUrl: companyProfile.logoUrl || '',
    });
    setIsEditing(true);
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableData(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndustryChange = (event, newValue) => {
    setEditableData(prev => ({ ...prev, industry: newValue }));
  };
  
  const handleSizeChange = (event) => {
    setEditableData(prev => ({ ...prev, size: event.target.value }));
  };

  const handleSave = async () => {
    if (!editableData) return;
    setSaving(true);
    setSnackbar({ ...snackbar, open: false });

    const dataToSend = {
        ...editableData,
        industry: editableData.industry?.label || editableData.industry, 
    };
    delete dataToSend.logoUrl; 

    try {
      // --- SỬA Ở ĐÂY: Gọi API thật sự ---
      const response = await apiService.updateMyCompanyProfileApi(dataToSend);
      // --- KẾT THÚC SỬA ---
      if (response.data && response.data.company) {
          const updatedProfileFromApi = response.data.company;
          const updatedProfile = { ...updatedProfileFromApi, id: updatedProfileFromApi._id || updatedProfileFromApi.id };
          
          setCompanyProfile(updatedProfile);
          setSnackbar({ open: true, message: response.data.message || 'Cập nhật hồ sơ công ty thành công!', severity: 'success' });
          
          if (authState.user && authState.user.companyName !== updatedProfile.name) {
              const updatedUser = { ...authState.user, companyName: updatedProfile.name };
              setAuthState(prevState => ({ ...prevState, user: updatedUser }));
              localStorage.setItem('authUser', JSON.stringify(updatedUser));
          }

          setIsEditing(false);
          setEditableData(null);
      } else {
          throw new Error("Dữ liệu trả về không hợp lệ sau khi cập nhật.");
      }
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ công ty:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || `Lỗi! Không thể cập nhật.`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Xử lý upload logo (Tạm thời comment out)
  // ...

  if (loading) return <LoadingSpinner />;
  
  if (error && !loading) {
      return (
          <Container maxWidth="md" sx={{mt: 4}}>
              <Alert severity="error">{error}</Alert>
          </Container>
      );
  }
  
  if (!companyProfile && !isEditing && !loading) {
      return (
          <Container maxWidth="md" sx={{mt: 4}}>
              <Paper sx={{p:3, textAlign: 'center'}}>
                  <Typography variant="h6">Hồ sơ công ty của bạn</Typography>
                  <Typography color="text.secondary" sx={{my:2}}>
                      {error || "Có vẻ như bạn chưa thiết lập hồ sơ công ty hoặc không tìm thấy thông tin."}
                  </Typography>
                  <Button variant="contained" onClick={handleEdit} disabled={isEditing}>
                      Thiết lập hồ sơ công ty
                  </Button>
              </Paper>
          </Container>
      );
  }

  const displayData = isEditing ? editableData : companyProfile;
  if (!displayData && !isEditing) { 
      return <LoadingSpinner />;
  }

  return (
    <Paper sx={{ p: {xs: 2, md: 3}, position: 'relative', maxWidth: 900, margin: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" gutterBottom>
          Hồ sơ công ty
        </Typography>
        {!isEditing ? (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} disabled={saving || !companyProfile /* Disable nếu companyProfile chưa load xong */}>
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

      <Grid container spacing={3}>
         <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
                src={displayData?.logoUrl} 
                alt={`${displayData?.name || ''} logo`}
                variant="rounded"
                sx={{ width: 150, height: 150, margin: 'auto', mb: 1, objectFit: 'contain', bgcolor: '#f0f0f0', border: '1px solid #ddd' }}
            >
               {!displayData?.logoUrl && <BusinessIcon sx={{ fontSize: 70, color: 'grey.500' }}/>}
            </Avatar>
             {isEditing && (
                 <>
                    <Button component="label" size="small" startIcon={<PhotoCamera />} disabled={saving}>
                        Thay đổi Logo
                        <input type="file" hidden accept="image/*" />
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary">(Chức năng upload logo sẽ được hoàn thiện sau)</Typography>
                 </>
            )}
         </Grid>

         <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
                {isEditing ? (
                     <TextField fullWidth required label="Tên công ty" name="name" value={editableData?.name || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                ) : (
                    <Typography variant="h4" component="h1" fontWeight="bold">{displayData?.name}</Typography>
                )}

                {isEditing ? (
                    <TextField fullWidth label="Website" name="website" type="url" value={editableData?.website || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                ) : (
                    displayData?.website && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinkIcon color="action" fontSize="small"/> <Link href={displayData.website.startsWith('http') ? displayData.website : `http://${displayData.website}`} target="_blank" rel="noopener noreferrer">{displayData.website}</Link></Box>
                )}

                 {isEditing ? (
                    <Autocomplete
                        id="company-industry-autocomplete-employer"
                        options={mockIndustriesForSelect}
                        getOptionLabel={(option) => option.label || ""}
                        value={editableData?.industry || null}
                        onChange={handleIndustryChange}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => (<TextField {...params} label="Ngành nghề" variant="outlined" size="small"/>)}
                        disabled={saving}
                    />
                 ) : (
                    displayData?.industry && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CategoryIcon color="action" fontSize="small"/> <Typography variant="body1">{typeof displayData.industry === 'object' ? displayData.industry.label : displayData.industry}</Typography></Box>
                 )}

                 {isEditing ? (
                     <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id="company-size-label-employer">Quy mô công ty</InputLabel>
                        <Select labelId="company-size-label-employer" name="size" value={editableData?.size || ''} label="Quy mô công ty" onChange={handleSizeChange} disabled={saving}>
                            <MenuItem value=""><em>Không chọn</em></MenuItem>
                            {mockCompanySizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                        </Select>
                    </FormControl>
                 ) : (
                    displayData?.size && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PeopleIcon color="action" fontSize="small"/> <Typography variant="body1">{displayData.size}</Typography></Box>
                 )}

                 {isEditing ? (
                    <TextField fullWidth label="Địa chỉ công ty" name="address" value={editableData?.address || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                 ) : (
                    displayData?.address && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocationOnIcon color="action" fontSize="small"/> <Typography variant="body1">{displayData.address}</Typography></Box>
                 )}

                 <Box sx={{mt: 1}}>
                    <Typography variant="subtitle1" sx={{fontWeight:'medium', mb: 0.5}}>Mô tả công ty:</Typography>
                    {isEditing ? (
                        <TextField fullWidth name="description" multiline rows={5} value={editableData?.description || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                    ) : (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: displayData?.description ? 'text.primary' : 'text.secondary' }}>
                            {displayData?.description || 'Chưa có mô tả.'}
                        </Typography>
                    )}
                 </Box>
            </Stack>
         </Grid>
      </Grid>

       <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
          </Alert>
       </Snackbar>
    </Paper>
  );
}

export default EmployerCompanyProfilePage;

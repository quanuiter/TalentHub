// src/pages/employer/CompanyProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

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
// import IconButton from '@mui/material/IconButton'; // IconButton không được sử dụng trực tiếp trong file này nữa
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';

// Import Icons
import EditIcon from '@mui/icons-material/EditOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import BusinessIcon from '@mui/icons-material/BusinessOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';

// Mock data
const mockIndustriesForSelect = [
  { id: 'it-software', label: 'CNTT - Phần mềm' },
  { id: 'it-hardware', label: 'CNTT - Phần cứng / Mạng' },
  { id: 'marketing', label: 'Marketing / Truyền thông / Quảng cáo' },
  { id: 'sales', label: 'Bán hàng / Kinh doanh' },
  { id: 'hr', label: 'Nhân sự' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán' },
  { id: 'design', label: 'Thiết kế / Mỹ thuật' },
];
const mockCompanySizes = ['Dưới 10 nhân viên', '10-50 nhân viên', '50-100 nhân viên', '100-500 nhân viên', 'Trên 500 nhân viên'];

const initialEditableData = {
    name: '',
    description: '',
    website: '',
    address: '',
    industry: null,
    size: '',
    logoUrl: '',
};

function EmployerCompanyProfilePage() {
  const { authState, setAuthState } = useAuth();
  const theme = useTheme();

  const [companyProfile, setCompanyProfile] = useState(null);
  const [editableData, setEditableData] = useState(initialEditableData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // >>> THÊM ĐỊNH NGHĨA HÀM renderSectionHeader VÀO ĐÂY <<<
  const renderSectionHeader = (title, icon) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5, mt: 3 }}>
      {icon && React.cloneElement(icon, { color:"action", sx: { fontSize: '1.6rem' } })}
      <Typography variant="h6" component="div" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {title}
      </Typography>
    </Stack>
  );
  // >>> KẾT THÚC ĐỊNH NGHĨA HÀM <<<


  useEffect(() => {
    const loadProfile = async () => {
      if (authState.user?.role !== 'employer' || !authState.isAuthenticated || authState.isLoading) {
        if (!authState.isAuthenticated && !authState.isLoading) setError("Bạn không có quyền truy cập trang này hoặc chưa đăng nhập.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getMyCompanyProfileApi();
        if (response && response.data) {
          const profileData = { ...response.data, id: response.data._id || response.data.id };
          setCompanyProfile(profileData);
          if (isEditing) {
            let industryObject = null;
            if (profileData.industry) {
                if (typeof profileData.industry === 'string') {
                    industryObject = mockIndustriesForSelect.find(i => i.label === profileData.industry || i.id === profileData.industry) || null;
                } else if (typeof profileData.industry === 'object') {
                    industryObject = profileData.industry;
                }
            }
            setEditableData({
                name: profileData.name || '',
                description: profileData.description || '',
                website: profileData.website || '',
                address: profileData.address || '',
                industry: industryObject,
                size: profileData.size || '',
                logoUrl: profileData.logoUrl || '',
            });
          }
        } else {
          setError("Không tải được hồ sơ công ty. Dữ liệu trả về không hợp lệ.");
          setCompanyProfile(null);
        }
      } catch (err) {
        console.error("Lỗi tải hồ sơ công ty của NTD:", err);
        const errMsg = err.response?.data?.message || err.message || "Lỗi kết nối khi tải hồ sơ công ty.";
        if (err.response && err.response.status === 404) {
             setError(errMsg + " Bạn có thể cần tạo hồ sơ trước.");
        } else {
            setError(errMsg);
        }
        setCompanyProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated, authState.isLoading, authState.user?.role]); // Bỏ isEditing khỏi đây để tránh loop khi setEditableData


  const handleEdit = () => {
    if (!companyProfile) {
        // Nếu chưa có profile, khởi tạo editableData rỗng để người dùng tạo mới
        setEditableData(initialEditableData);
        setIsEditing(true);
        setSnackbar({ ...snackbar, open: false });
        return;
    }
    let industryObject = null;
    if (companyProfile.industry) {
        if (typeof companyProfile.industry === 'string') {
            industryObject = mockIndustriesForSelect.find(i => i.label === companyProfile.industry || i.id === companyProfile.industry) || null;
        } else if (typeof companyProfile.industry === 'object') {
            industryObject = companyProfile.industry;
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
    // Khi hủy, nếu có companyProfile thì reset editableData về giá trị đó, nếu không thì về initial
    if (companyProfile) {
        let industryObject = null;
        if (companyProfile.industry) {
            if (typeof companyProfile.industry === 'string') {
                industryObject = mockIndustriesForSelect.find(i => i.label === companyProfile.industry || i.id === companyProfile.industry) || null;
            } else if (typeof companyProfile.industry === 'object') {
                industryObject = companyProfile.industry;
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
    } else {
        setEditableData(initialEditableData);
    }
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
    if (!editableData || !editableData.name) { // Thêm kiểm tra tên công ty là bắt buộc khi lưu
        setSnackbar({ open: true, message: 'Tên công ty là bắt buộc.', severity: 'error' });
        return;
    }
    setSaving(true);
    setSnackbar({ ...snackbar, open: false });

    const dataToSend = {
        name: editableData.name,
        description: editableData.description,
        website: editableData.website,
        address: editableData.address,
        industry: editableData.industry?.label || editableData.industry?.id || editableData.industry,
        size: editableData.size,
    };

    try {
      const response = await apiService.updateMyCompanyProfileApi(dataToSend);
      if (response.data && response.data.company) {
          const updatedProfileFromApi = response.data.company;
          const updatedProfile = { ...updatedProfileFromApi, id: updatedProfileFromApi._id || updatedProfileFromApi.id };
          
          setCompanyProfile(updatedProfile); // Cập nhật companyProfile với dữ liệu mới
          setSnackbar({ open: true, message: response.data.message || 'Cập nhật hồ sơ công ty thành công!', severity: 'success' });
          
          if (authState.user && authState.user.companyName !== updatedProfile.name) {
              const updatedUser = { ...authState.user, companyName: updatedProfile.name, companyId: updatedProfile._id }; // Cập nhật cả companyId
              setAuthState(prevState => ({ ...prevState, user: updatedUser }));
              localStorage.setItem('authUser', JSON.stringify(updatedUser));
          }
          setIsEditing(false);
          // Không cần setEditableData(null) ở đây nữa vì khi isEditing=false, displayData sẽ là companyProfile
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
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        console.log("Logo selected:", file.name);
        setSnackbar({open: true, message: "Chức năng tải lên logo sẽ được cập nhật sau.", severity: "info"})
        // TODO: setEditableData(prev => ({ ...prev, logoFile: file, logoUrl: URL.createObjectURL(file) }));
    }
  };

  if (loading) return <LoadingSpinner />;
  
  if (error && !isEditing && !companyProfile) { // Chỉ hiển thị lỗi nếu không có profile và không đang edit
      return (
          <Container maxWidth="md" sx={{mt: 4, textAlign: 'center'}}>
              <Alert severity="error" sx={{mb: 2}}>{error}</Alert>
              {authState.user?.role === 'employer' && ( // Chỉ hiển thị nút tạo nếu là employer
                 <Button variant="contained" onClick={handleEdit} sx={{borderRadius: '8px'}}>Tạo hồ sơ công ty</Button>
              )}
          </Container>
      );
  }
  
  // Nếu không có profile, và user click Edit, isEditing sẽ là true, editableData sẽ là initialEditableData
  const displayOrEditableData = isEditing ? editableData : companyProfile;

  // Nếu vẫn chưa có gì để hiển thị (trường hợp rất hiếm sau các kiểm tra trên)
  if (!displayOrEditableData && !isEditing) {
      return <Typography sx={{textAlign: 'center', mt: 3}}>Không có dữ liệu hồ sơ để hiển thị.</Typography>;
  }
  // Nếu đang edit mà editableData vẫn null (cũng hiếm)
  if (isEditing && !editableData) {
      setEditableData(initialEditableData); // Đảm bảo editableData có giá trị
      return <LoadingSpinner/>;
  }


  const InfoRow = ({ icon, label, value, href }) => ( // Bỏ isEditingField và children
    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.8, gap: 1.5 }}>
        {icon && React.cloneElement(icon, { color:"action", sx: { fontSize: '1.35rem', mt: '2px' } })}
        <Box>
            <Typography variant="body1" component="span" sx={{fontWeight: 500, color: 'text.secondary' }}>
                {label}
            </Typography>
            {href ? (
                <Link href={href.startsWith('http') ? href : `http://${href}`} target="_blank" rel="noopener noreferrer" variant="body1" color="primary.main" sx={{wordBreak: 'break-word', display:'block'}}>
                    {value || <Typography component="em" color="text.disabled" sx={{fontStyle:'italic'}}>Chưa cập nhật</Typography>}
                </Link>
            ) : (
                <Typography variant="body1" color="text.primary" sx={{wordBreak: 'break-word', display:'block'}}>
                    {value || <Typography component="em" color="text.disabled" sx={{fontStyle:'italic'}}>Chưa cập nhật</Typography>}
                </Typography>
            )}
        </Box>
    </Grid>
  );


  return (
    <Paper sx={{ p: {xs: 2, sm: 3, md: 4}, borderRadius: '16px', boxShadow: theme.shadows[3], maxWidth: 900, margin: 'auto' }}>
      <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems={{xs:'flex-start', sm:'center'}} mb={2.5} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
          Hồ sơ công ty
        </Typography>
        {!isEditing ? (
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit} disabled={saving || (!companyProfile && authState.user?.role !== 'employer')} sx={{borderRadius: '8px', py: 1, px: 2.5, alignSelf: {xs: 'flex-start', sm:'center'}}}>
            {companyProfile ? 'Chỉnh sửa' : 'Tạo hồ sơ'}
          </Button>
        ) : (
          <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" color="inherit" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving} sx={{borderRadius: '8px'}}>
                Hủy bỏ
              </Button>
              <Button
                variant="contained" color="primary"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{borderRadius: '8px', px: 2.5}}
               >
                Lưu thay đổi
              </Button>
          </Stack>
        )}
      </Stack>
      <Divider sx={{ mb: 3.5 }} />

      <Grid container spacing={isEditing ? 2 : 3.5} direction="column"> {/* Giảm spacing khi edit */}
         <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection:'column', alignItems: 'center', gap: 1.5, mb: {xs: 3, md: 0} }}>
            <Avatar
                src={displayOrEditableData?.logoUrl}
                alt={`${displayOrEditableData?.name || ''} logo`}
                variant="rounded"
                sx={{ width: 180, height: 180, objectFit: 'contain', bgcolor: alpha(theme.palette.grey[300], 0.5), border: `1px solid ${theme.palette.divider}`, borderRadius: '12px' }}
            >
               {!displayOrEditableData?.logoUrl && <BusinessIcon sx={{ fontSize: 80, color: theme.palette.grey[400] }}/>}
            </Avatar>
             {isEditing && (
                 <>
                    <Button component="label" size="small" startIcon={<PhotoCameraOutlinedIcon />} disabled={saving} variant="text" sx={{textTransform: 'none'}}>
                        Thay đổi Logo
                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Button>
                 </>
            )}
         </Grid>

         <Grid item xs={12} md={8} >
            {/* Chế độ hiển thị */}
            {!isEditing && companyProfile && (
                <Stack spacing={0.5}> {/* Giảm spacing giữa các InfoRow */}
                    <Typography variant="h3" component="h2" fontWeight="bold" color="text.primary" gutterBottom sx={{fontSize: {xs: '2rem', sm: '2.5rem'}}}>{companyProfile.name}</Typography>
                    <InfoRow icon={<LinkIcon/>} label="Website" value={companyProfile.website} href={companyProfile.website} />
                    <InfoRow icon={<CategoryIcon/>} label="Ngành nghề" value={typeof companyProfile.industry === 'object' ? companyProfile.industry.label : companyProfile.industry} />
                    <InfoRow icon={<PeopleOutlineOutlinedIcon/>} label="Quy mô" value={companyProfile.size} />
                    <InfoRow icon={<LocationOnOutlinedIcon/>} label="Địa chỉ" value={companyProfile.address} />
                </Stack>
            )}

            {/* Chế độ chỉnh sửa */}
            {isEditing && editableData && (
                <Stack spacing={2.5}>
                     <TextField fullWidth required label="Tên công ty (*)" name="name" value={editableData.name} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                     <TextField fullWidth label="Website" name="website" type="url" value={editableData.website} onChange={handleChange} variant="outlined" size="small" disabled={saving} placeholder="https://example.com"/>
                     <Autocomplete
                        id="company-industry-autocomplete-employer" options={mockIndustriesForSelect} getOptionLabel={(option) => option.label || ""}
                        value={editableData.industry || null} onChange={handleIndustryChange} isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => (<TextField {...params} label="Ngành nghề" variant="outlined" size="small"/>)}
                        disabled={saving} size="small"
                    />
                     <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id="company-size-label-employer">Quy mô công ty</InputLabel>
                        <Select labelId="company-size-label-employer" name="size" value={editableData.size || ''} label="Quy mô công ty" onChange={handleSizeChange} disabled={saving}>
                            <MenuItem value=""><em>Không chọn</em></MenuItem>
                            {mockCompanySizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField fullWidth label="Địa chỉ công ty" name="address" multiline rows={2} value={editableData.address} onChange={handleChange} variant="outlined" size="small" disabled={saving}/>
                </Stack>
            )}
         </Grid>

         {/* Company Description - Luôn hiển thị hoặc form edit */}
         <Grid item xs={12} sx={{mt: 0 }}> {/* Tăng mt */}
            {renderSectionHeader("Giới thiệu công ty", <DescriptionOutlinedIcon />)}
            <Divider sx={{mb:2}}/>
            {isEditing && editableData ? (
                <TextField fullWidth name="description" multiline rows={8} value={editableData.description || ''} onChange={handleChange} variant="outlined" size="small" disabled={saving} placeholder="Chia sẻ về văn hóa, sứ mệnh và những điều nổi bật về công ty của bạn..."/>
            ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: companyProfile?.description ? 'text.primary' : 'text.secondary', lineHeight: 1.75, fontSize: '1rem', p:1, borderRadius: '8px', bgcolor: companyProfile?.description ? 'transparent' : alpha(theme.palette.grey[200], 0.3) }}>
                    {companyProfile?.description || <Typography component="em" sx={{fontStyle:'italic'}}>Chưa có mô tả về công ty.</Typography>}
                </Typography>
            )}
         </Grid>
      </Grid>

       <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={handleCloseSnackbar} anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
       </Snackbar>
    </Paper>
  );
}

export default EmployerCompanyProfilePage;

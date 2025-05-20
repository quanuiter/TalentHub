// src/pages/employer/PostJobPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

// Import MUI components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useTheme } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';


// Icons for section headers
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
// import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'; // Icon cho kỹ năng (đã dùng trong Autocomplete)
import BuildIcon from '@mui/icons-material/Build'; // Giữ lại cho Yêu cầu & Kỹ năng
import CardMembershipIcon from '@mui/icons-material/CardMembership';


// Mock data (Nên chuyển vào file constants hoặc lấy từ API nếu có thể)
const mockIndustries = [
  { id: 'it-software', label: 'CNTT - Phần mềm' },
  { id: 'it-hardware', label: 'CNTT - Phần cứng / Mạng' },
  { id: 'marketing', label: 'Marketing / Truyền thông / Quảng cáo' },
  { id: 'sales', label: 'Bán hàng / Kinh doanh' },
  { id: 'hr', label: 'Nhân sự' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán' },
  { id: 'design', label: 'Thiết kế / Mỹ thuật' },
  { id: 'architecture', label: 'Kiến trúc & Xây dựng' },
  { id: 'education', label: 'Giáo dục & Đào tạo' },
  { id: 'finance-banking', label: 'Tài chính & Ngân hàng' },
];

const mockJobTypes = ['Full-time', 'Part-time', 'Hợp đồng', 'Thực tập', 'Remote', 'Freelance'];
const mockExperienceLevels = ['Chưa có kinh nghiệm', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '4 năm', '5 năm', 'Trên 5 năm'];
const mockSkills = [
    'JavaScript', 'TypeScript', 'ReactJS', 'Angular', 'VueJS', 'Node.js', 'Express.js', 'Python', 'Django', 'Flask',
    'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby on Rails', 'Go (Golang)', 'Swift', 'Kotlin', 'Flutter', 'React Native',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Oracle',
    'AWS', 'Azure', 'Google Cloud Platform (GCP)', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
    'HTML5', 'CSS3', 'Sass/SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'RESTful APIs', 'GraphQL', 'Microservices', 'Git', 'JIRA', 'Agile', 'Scrum',
    'Data Analysis', 'Machine Learning', 'Deep Learning', 'AI', 'Big Data', 'Data Science',
    'UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Project Management', 'Product Management', 'Business Analysis', 'Digital Marketing', 'SEO', 'SEM', 'Content Writing',
    'Customer Service', 'Sales Management', 'Communication Skills', 'Teamwork', 'Problem Solving', 'English', 'Japanese', 'Korean'
];

const initialJobData = {
  title: '',
  industry: null,
  jobType: '',
  location: '',
  salary: '',
  description: '',
  requirements: '',
  benefits: '',
  requiredSkills: [],
  applicationDeadline: '',
  experienceLevel: '',
  numberOfHires: 1,
};

function PostJobPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditMode = !!jobId;
  // const { authState } = useAuth(); // authState không thấy được sử dụng trực tiếp, có thể bỏ nếu không cần cho logic nào khác
  const theme = useTheme();

  const [jobData, setJobData] = useState(initialJobData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [loadingJobDetails, setLoadingJobDetails] = useState(isEditMode);
  const [fetchJobError, setFetchJobError] = useState(null);

  // Effect to load job details if in edit mode
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!isEditMode || !jobId) {
        setLoadingJobDetails(false);
        setJobData(initialJobData); // Reset về initial nếu không phải edit mode hoặc không có jobId
        return;
      }
      
      setLoadingJobDetails(true);
      setFetchJobError(null);
      try {
        const response = await apiService.getJobDetailsApi(jobId);
        const data = response.data;

        if (data) {
          let loadedIndustry = null;
          if (data.industry) {
            loadedIndustry = mockIndustries.find(i => i.label === data.industry || i.id === data.industry) || null;
          }

          setJobData({
            title: data.title || '',
            industry: loadedIndustry,
            jobType: data.type || '',
            location: data.location || '',
            salary: data.salary || '',
            description: data.description || '',
            requirements: data.requirements || '',
            benefits: data.benefits || '',
            requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
            applicationDeadline: data.applicationDeadline ? data.applicationDeadline.split('T')[0] : '',
            experienceLevel: data.experienceLevel || '',
            numberOfHires: data.numberOfHires || 1,
          });
        } else {
          setFetchJobError(`Không tìm thấy tin tuyển dụng với ID: ${jobId}. Có thể tin đã bị xóa.`);
          setJobData(initialJobData);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết tin đăng:", err);
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải chi tiết tin tuyển dụng.";
        setFetchJobError(errorMsg);
        setJobData(initialJobData); // Reset về initial khi có lỗi
      } finally {
        setLoadingJobDetails(false);
      }
    };
    
    loadJobDetails();

  }, [jobId, isEditMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndustryChange = (event, newValue) => {
    setJobData(prev => ({ ...prev, industry: newValue }));
  };

  const handleSkillsChange = (event, newValue) => {
    setJobData(prev => ({ ...prev, requiredSkills: newValue }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSnackbar({ ...snackbar, open: false });

    if (!jobData.title || !jobData.industry || !jobData.jobType || !jobData.location || !jobData.description || !jobData.requirements) {
        setSnackbar({ open: true, message: 'Vui lòng điền đầy đủ các trường có dấu (*)', severity: 'error'});
        setIsSubmitting(false);
        return;
    }

    const dataToSend = {
      title: jobData.title,
      industry: jobData.industry?.label || jobData.industry?.id || jobData.industry,
      type: jobData.jobType,
      location: jobData.location,
      salary: jobData.salary,
      description: jobData.description,
      requirements: jobData.requirements,
      benefits: jobData.benefits,
      requiredSkills: jobData.requiredSkills,
      applicationDeadline: jobData.applicationDeadline || null,
      experienceLevel: jobData.experienceLevel,
      numberOfHires: parseInt(jobData.numberOfHires, 10) || 1,
      // associatedTestIds: [], // Đã bỏ theo yêu cầu
    };

    try {
        let response;
        let successMessage = '';
        if (isEditMode) {
            response = await apiService.updateJobApi(jobId, dataToSend);
            successMessage = response.data?.message || 'Cập nhật tin tuyển dụng thành công!';
        } else {
            response = await apiService.createJobApi(dataToSend);
            successMessage = response.data?.message || 'Đăng tin tuyển dụng thành công!';
        }
        setSnackbar({ open: true, message: successMessage, severity: 'success'});
        setTimeout(() => {
             navigate('/employer/manage-jobs');
        }, 1500);
    } catch (err) {
        console.error("Lỗi khi lưu tin đăng:", err.response?.data || err.message || err);
        const errorMsg = err.response?.data?.message || err.message || 'Lỗi! Không thể lưu tin.';
        setSnackbar({ open: true, message: errorMsg, severity: 'error'});
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loadingJobDetails && isEditMode) return <LoadingSpinner />;
  if (fetchJobError) return <Alert severity="error" sx={{m: 2, p: 2, borderRadius: '8px'}}>{fetchJobError}</Alert>;

  const renderSectionHeader = (title, icon) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5, mt: 3 }}> {/* Thêm mt cho khoảng cách giữa các section */}
      {icon && React.cloneElement(icon, { color:"action", sx: { fontSize: '1.6rem' } })} {/* Tăng size icon một chút */}
      <Typography variant="h6" component="div" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Paper sx={{ p: {xs: 2, sm: 3, md: 4}, borderRadius: '16px', boxShadow: theme.shadows[3] }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1, fontWeight: 700, color: 'primary.dark' }}>
        {isEditMode ? `Chỉnh sửa tin tuyển dụng` : 'Tạo tin tuyển dụng mới'}
      </Typography>
      {isEditMode && jobId && <Typography variant="body2" color="text.secondary" sx={{mb:3.5}}>ID: {jobId}</Typography>}
      {!isEditMode && <Typography variant="body1" color="text.secondary" sx={{mb:3.5}}>Điền đầy đủ thông tin bên dưới để tạo tin tuyển dụng mới.</Typography>}


      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2.5} direction="column" > {/* Giảm spacing một chút nếu muốn form gọn hơn */}

          {/* Section 1: Thông tin chung */}
          <Grid item xs={12}>
            {renderSectionHeader("Thông tin chung", <CategoryIcon />)}
            <Divider sx={{mb:2.5}}/>
          </Grid>
          <Grid item xs={12}> {/* Chức danh chiếm toàn bộ hàng */}
            <TextField required fullWidth label="Chức danh tuyển dụng (*)" name="title" value={jobData.title} onChange={handleChange} variant="outlined" size="small"/>
          </Grid>
          <Grid item xs={12}> {/* Ngành nghề chiếm toàn bộ hàng */}
             <Autocomplete
                id="industry-autocomplete" options={mockIndustries} getOptionLabel={(option) => option.label || ""}
                value={jobData.industry} onChange={handleIndustryChange} isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => (<TextField {...params} required label="Ngành nghề (*)" variant="outlined" size="small"/>)}
                size="small"
             />
          </Grid>
          <Grid item xs={12}> {/* Loại hình công việc chiếm toàn bộ hàng */}
            <FormControl fullWidth required size="small">
              <InputLabel id="job-type-label">Loại hình công việc (*)</InputLabel>
              <Select labelId="job-type-label" name="jobType" value={jobData.jobType} onChange={handleChange} input={<OutlinedInput label="Loại hình công việc (*)" />}>
                <MenuItem value="" disabled><em>Chọn loại hình</em></MenuItem>
                {mockJobTypes.map(type => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>

          {/* Section 2: Địa điểm & Lương */}
           <Grid item xs={12}>
            {renderSectionHeader("Địa điểm & Mức lương", <LocationCityIcon />)}
            <Divider sx={{mb:2.5}}/>
          </Grid>
          <Grid item xs={12}> {/* Địa điểm chiếm toàn bộ hàng */}
            <TextField required fullWidth label="Địa điểm làm việc (*)" name="location" value={jobData.location} onChange={handleChange} variant="outlined" size="small" helperText="Ví dụ: TP.HCM hoặc Tầng 5, Tòa nhà ABC, Hà Nội"/>
          </Grid>
          <Grid item xs={12}> {/* Mức lương chiếm toàn bộ hàng */}
             <TextField fullWidth label="Mức lương" name="salary" value={jobData.salary} onChange={handleChange} variant="outlined" size="small" InputProps={{startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment>}} helperText="Ví dụ: 15-20 triệu VND, hoặc Thương lượng"/>
          </Grid>

          {/* Section 3: Mô tả chi tiết */}
          <Grid item xs={12}>
            {renderSectionHeader("Mô tả công việc", <DescriptionIcon />)}
            <Divider sx={{mb:2.5}}/>
          </Grid>
          <Grid item xs={12}>
            <TextField required fullWidth label="Mô tả công việc chi tiết (*)" name="description" multiline rows={8} value={jobData.description} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: '8px' } }}/>
          </Grid>

          {/* Section 4: Yêu cầu & Kỹ năng */}
          <Grid item xs={12}>
            {renderSectionHeader("Yêu cầu & Kỹ năng", <BuildIcon />)}
            <Divider sx={{mb:2.5}}/>
          </Grid>
          <Grid item xs={12}>
             <TextField required fullWidth label="Yêu cầu đối với ứng viên (*)" name="requirements" multiline rows={5} value={jobData.requirements} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: '8px' } }}/>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
                multiple id="skills-autocomplete" options={mockSkills} value={jobData.requiredSkills} onChange={handleSkillsChange} freeSolo
                renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" color="primary" label={option} {...getTagProps({ index })} size="small" onDelete={getTagProps({ index }).onDelete} /> ))}
                renderInput={(params) => (<TextField {...params} variant="outlined" label="Kỹ năng yêu cầu" placeholder="Thêm kỹ năng..." size="small"/>)}
                size="small"
                limitTags={7}
             />
             <FormHelperText sx={{ml: '14px'}}>Nhấn Enter để thêm kỹ năng mới nếu không có trong danh sách.</FormHelperText>
           </Grid>

           {/* Section 5: Quyền lợi */}
            <Grid item xs={12}>
                {renderSectionHeader("Quyền lợi & Phúc lợi", <CardMembershipIcon />)}
                <Divider sx={{mb:2.5}}/>
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth label="Phúc lợi, Quyền lợi & Thông tin thêm" name="benefits" multiline rows={4} value={jobData.benefits} onChange={handleChange} variant="outlined" InputProps={{ sx: { borderRadius: '8px' } }}/>
            </Grid>


          {/* Section 6: Thông tin tuyển dụng */}
          <Grid item xs={12}>
            {renderSectionHeader("Thông tin tuyển dụng", <PeopleAltOutlinedIcon />)}
            <Divider sx={{mb:2.5}}/>
          </Grid>
          <Grid item xs={12}> {/* Hạn nộp hồ sơ chiếm toàn bộ hàng */}
            <TextField fullWidth label="Hạn nộp hồ sơ" name="applicationDeadline" type="date" value={jobData.applicationDeadline} onChange={handleChange} variant="outlined" size="small" InputLabelProps={{ shrink: true }} InputProps={{startAdornment: <InputAdornment position="start"><EventBusyIcon fontSize="small" /></InputAdornment>}}/>
          </Grid>
           <Grid item xs={12}> {/* Yêu cầu kinh nghiệm chiếm toàn bộ hàng */}
            <FormControl fullWidth size="small">
              <InputLabel id="exp-level-label">Yêu cầu kinh nghiệm</InputLabel>
              <Select labelId="exp-level-label" name="experienceLevel" value={jobData.experienceLevel} onChange={handleChange} input={<OutlinedInput label="Yêu cầu kinh nghiệm" />} startAdornment={<InputAdornment position="start" sx={{mr:1}}><WorkOutlineIcon fontSize="small" /></InputAdornment>}>
                <MenuItem value=""><em>Không yêu cầu cụ thể</em></MenuItem>
                 {mockExperienceLevels.map(level => (<MenuItem key={level} value={level}>{level}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
           <Grid item xs={12}> {/* Số lượng tuyển chiếm toàn bộ hàng */}
            <TextField fullWidth label="Số lượng tuyển" name="numberOfHires" type="number" value={jobData.numberOfHires} onChange={handleChange} variant="outlined" size="small" InputProps={{ inputProps: { min: 1 } }}/>
          </Grid>

           {/* Actions */}
           <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{mt: 4, pt:2.5, borderTop: `1px solid ${theme.palette.divider}`}}>
                    <Button type="button" variant="outlined" color="inherit" onClick={() => navigate('/employer/manage-jobs')} disabled={isSubmitting} sx={{borderRadius: '8px', px: 2.5}}>
                        Hủy bỏ
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null} sx={{borderRadius: '8px', px: 3.5, py: 1.2}}>
                        {isEditMode ? 'Lưu thay đổi' : 'Đăng tin'}
                    </Button>
                </Stack>
           </Grid>
        </Grid>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={4500} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>
    </Paper>
  );
}

export default PostJobPage;

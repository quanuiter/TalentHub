// src/pages/employer/PostJobPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Để lấy thông tin NTD/Công ty nếu cần
import { fetchEmployerTests } from '../../data/mockJobs';
import { fetchEmployerJobDetail, createEmployerJob, updateEmployerJob } from '../../data/mockJobs'; // Đảm bảo đúng đường dẫn
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
import OutlinedInput from '@mui/material/OutlinedInput'; // Dùng với Select
import Chip from '@mui/material/Chip'; // Có thể dùng cho Skills sau này
import Autocomplete from '@mui/material/Autocomplete'; // Dùng cho Ngành nghề, Kỹ năng
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack'; // Dùng Stack cho các nút
import Checkbox from '@mui/material/Checkbox'; 
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'; // Icon checkbox chưa chọn
import CheckBoxIcon from '@mui/icons-material/CheckBox'; // Icon checkbox đã chọn
import LoadingSpinner from '../../components/ui/LoadingSpinner'; // Giả lập loading
import { useParams } from 'react-router-dom'; // Để lấy jobId từ URL
// Dữ liệu giả lập cho các Select/Autocomplete (sau này lấy từ API hoặc config)
const mockIndustries = [
  { id: 'it-software', label: 'CNTT - Phần mềm' },
  { id: 'it-hardware', label: 'CNTT - Phần cứng / Mạng' },
  { id: 'marketing', label: 'Marketing / Truyền thông / Quảng cáo' },
  { id: 'sales', label: 'Bán hàng / Kinh doanh' },
  { id: 'hr', label: 'Nhân sự' },
  { id: 'accounting', label: 'Kế toán / Kiểm toán' },
  { id: 'design', label: 'Thiết kế / Mỹ thuật' },
  // Thêm các ngành khác...
];

const mockJobTypes = ['Full-time', 'Part-time', 'Hợp đồng', 'Thực tập', 'Remote'];
const mockExperienceLevels = ['Chưa có kinh nghiệm', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '4 năm', '5 năm', 'Trên 5 năm'];
const mockSkills = ['JavaScript', 'ReactJS', 'NodeJS', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'English', 'Project Management', 'Teamwork']; // Ví dụ
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
// --- State khởi tạo cho form trống ---
const initialJobData = {
  title: '', industry: null, jobType: '', location: '', salary: '',
  description: '', requirements: '', benefits: '', requiredSkills: [],
  applicationDeadline: '', experienceLevel: '', numberOfHires: 1,
  associatedTests: []
};

function PostJobPage() {
  const navigate = useNavigate();
  const { jobId } = useParams(); // <<< Lấy jobId từ URL
  const isEditMode = !!jobId; // <<< Xác định chế độ Edit dựa vào jobId
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loadingJobDetails, setLoadingJobDetails] = useState(isEditMode); // <<< Chỉ loading nếu là edit mode
  const [availableTests, setAvailableTests] = useState([]); // <<< KHAI BÁO STATE Ở ĐÂY
  const [loadingTests, setLoadingTests] = useState(false); // Loading riêng cho việc tải tests
  const [fetchError, setFetchError] = useState(null);
  const [fetchTestError, setFetchTestError] = useState(null); // Lỗi riêng cho việc tải tests
  const [jobData, setJobData] = useState({
    title: '',
    industry: null, // Dùng null cho Autocomplete
    jobType: '',    // Dùng '' cho Select
    location: '',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    requiredSkills: [], // Dùng mảng cho Autocomplete multiple
    applicationDeadline: '', // YYYY-MM-DD
    experienceLevel: '', // Select
    numberOfHires: 1, // Number
    associatedTests: [], // Mảng chứa các bài test đã chọn
  });

  useEffect(() => {
    const loadAvailableTests = async () => {
        if (!authState.user?.id) return;
        setLoadingTests(true);
        setFetchTestError(null);
        try {
            const testsData = await fetchEmployerTests(authState.user.id);
            setAvailableTests(Array.isArray(testsData) ? testsData : []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách bài test có sẵn:", err);
            setFetchTestError("Không thể tải danh sách bài test để chọn.");
        } finally {
            setLoadingTests(false);
        }
    };
    loadAvailableTests();
  }, [authState.user?.id]);
  // === Kết thúc useEffect ===
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!isEditMode || !jobId) {
          setLoadingJobDetails(false);
          return;
      }
      setLoadingJobDetails(true);
      setFetchError(null);
      try {
        // Gọi API công khai lấy chi tiết job
        const response = await apiService.getJobDetailsApi(jobId);
        const data = response.data;

        if (data) {
           // --- Xử lý Map dữ liệu ---
            let loadedIndustry = null;
            if (data.industry) {
                // Thử tìm trong mockIndustries bằng label hoặc id (tùy backend trả về gì)
                loadedIndustry = mockIndustries.find(i => i.label === data.industry || i.id === data.industry) || null;
            }

            let loadedAssociatedTests = [];
            // Giả sử API getJobDetailsApi trả về mảng ID của test trong data.associatedTests
            // Và availableTests đã được load ở useEffect trên
             if (data.associatedTests && data.associatedTests.length > 0 && availableTests.length > 0) {
                loadedAssociatedTests = availableTests.filter(test =>
                    data.associatedTests.includes(test.testId || test._id) // So sánh ID
                );
            }

            setJobData({
              title: data.title || '',
              industry: loadedIndustry,
              jobType: data.type || '', // API trả về 'type'
              location: data.location || '',
              salary: data.salary || '',
              description: data.description || '',
              requirements: data.requirements || '',
              benefits: data.benefits || '',
              requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
              applicationDeadline: data.applicationDeadline ? data.applicationDeadline.split('T')[0] : '',
              experienceLevel: data.experienceLevel || '',
              numberOfHires: data.numberOfHires || 1,
              associatedTests: loadedAssociatedTests, // Gán mảng object test đã tìm được
            });
        } else {
          setFetchError(`Không tìm thấy tin tuyển dụng với ID: ${jobId}`);
          setJobData(initialJobData);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết tin đăng:", err);
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải chi tiết tin tuyển dụng.";
        setFetchError(errorMsg);
      } finally {
        setLoadingJobDetails(false);
      }
    };

    // Chỉ load job details khi availableTests đã sẵn sàng (hoặc không cần test)
     if (!loadingTests || availableTests.length === 0) {
        loadJobDetails();
     }

  }, [jobId, isEditMode, availableTests, loadingTests]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  // Handler riêng cho Autocomplete Industry (single select)
   const handleIndustryChange = (event, newValue) => {
    setJobData(prev => ({ ...prev, industry: newValue }));
  };

   // Handler riêng cho Autocomplete Skills (multiple select)
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
    // Không cần setFetchError(null) ở đây vì lỗi submit khác lỗi fetch

    // --- Validation (Giữ nguyên) ---
    if (!jobData.title || !jobData.industry || !jobData.jobType || !jobData.location || !jobData.description || !jobData.requirements) {
        setSnackbar({ open: true, message: 'Vui lòng điền đầy đủ các trường bắt buộc (*)', severity: 'error'});
        setIsSubmitting(false);
        return;
    }

    // --- Chuẩn bị dữ liệu gửi đi ---
    const dataToSend = {
      title: jobData.title,
      // Gửi ID hoặc label tùy backend mong muốn
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
      // Không cần gửi companyName/companyId vì backend lấy từ token/postedBy
      // Gửi mảng ID của associatedTests
      //associatedTests: jobData.associatedTests.map(test => test.testId || test._id),
      associatedTests: [],
      // Có thể thêm status nếu cho phép sửa status ở đây (ví dụ: 'Draft')
    };
    console.log('--- Dữ liệu gửi đi để tạo Job ---'); 
    console.log(dataToSend);                          
    try {
        let response;
        let successMessage = '';
        if (isEditMode) { // --- Chế độ Sửa ---
            console.log("Updating Job Data (API):", jobId, dataToSend);
            // <<< GỌI API UPDATE >>>
            response = await apiService.updateJobApi(jobId, dataToSend);
            successMessage = response.data?.message || 'Cập nhật tin tuyển dụng thành công!';
        } else { // --- Chế độ Tạo mới ---
            console.log("Creating Job Data (API):", dataToSend);
             // <<< GỌI API CREATE >>>
            response = await apiService.createJobApi(dataToSend);
            successMessage = response.data?.message || 'Đăng tin tuyển dụng thành công!';
        }

         console.log("API success response:", response.data);
         setSnackbar({ open: true, message: successMessage, severity: 'success'});

         // Điều hướng về trang quản lý sau khi thành công
         setTimeout(() => {
             navigate('/employer/manage-jobs');
         }, 1000); // Chờ 1s để xem thông báo

    } catch (err) {
        console.error("Lỗi khi lưu tin đăng:", err);
         const errorMsg = err.response?.data?.message || err.message || 'Lỗi! Không thể lưu tin.';
         setSnackbar({ open: true, message: errorMsg, severity: 'error'});
    } finally {
        setIsSubmitting(false);
    }
  };
  // --- Kết thúc hàm submit ---
  // === Handler mới cho Autocomplete chọn Test ===
  const handleTestsChange = (event, newValue) => {
    setJobData(prev => ({
      ...prev,
      // newValue là một mảng các object test đã chọn
      associatedTests: newValue
    }));
  };
  // Hiển thị loading nếu đang tải chi tiết job (ở chế độ edit)
  if (loadingJobDetails) return <LoadingSpinner />;
  // Hiển thị lỗi nếu có lỗi fetch ban đầu
  if (fetchError) return <Alert severity="error" sx={{m: 2}}>{fetchError}</Alert>;
  // === Kết thúc Handler mới ===
  return (
    <Paper sx={{ p: 3 }}> {/* Dùng Paper để tạo khung */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {isEditMode ? `Chỉnh sửa tin tuyển dụng (ID: ${jobId})` : 'Đăng tin tuyển dụng mới'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
          {/* Hàng 1: Chức danh, Ngành nghề */}
          <Grid item xs={12} md={12} sx ={{ mt: 3 }}>
            <TextField
              required
              fullWidth
              label="Chức danh tuyển dụng"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
             <Autocomplete
                id="industry-autocomplete"
                options={mockIndustries} // Danh sách lựa chọn
                getOptionLabel={(option) => option.label || ""} // Hiển thị label
                value={jobData.industry}
                onChange={handleIndustryChange}
                isOptionEqualToValue={(option, value) => option.id === value.id} // So sánh object
                renderInput={(params) => (
                    <TextField
                        {...params}
                        required
                        label="Ngành nghề"
                        variant="outlined"
                    />
                )}
             />
          </Grid>

          {/* Hàng 2: Loại hình, Địa điểm */}
          <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
            <FormControl fullWidth required>
              <InputLabel id="job-type-label">Loại hình công việc</InputLabel>
              <Select
                labelId="job-type-label"
                id="jobType"
                name="jobType"
                value={jobData.jobType}
                onChange={handleChange}
                input={<OutlinedInput label="Loại hình công việc" />}
              >
                <MenuItem value="" disabled><em>Chọn loại hình</em></MenuItem>
                {mockJobTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
            <TextField
              required
              fullWidth
              label="Địa điểm làm việc"
              name="location"
              value={jobData.location}
              onChange={handleChange}
              variant="outlined"
              helperText="Ví dụ: TP.HCM hoặc Tầng 5, Tòa nhà ABC, 123 Đường Z, Hà Nội"
            />
          </Grid>

          {/* Hàng 3: Mức lương, Hạn nộp */}
          <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
             <TextField
              fullWidth
              label="Mức lương"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              variant="outlined"
               helperText="Ví dụ: 15-20 triệu VND, $1000-$1500, hoặc Thương lượng"
            />
          </Grid>
          <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Hạn nộp hồ sơ"
              name="applicationDeadline"
              type="date" // Dùng type="date"
              value={jobData.applicationDeadline}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ shrink: true }} // Luôn hiển thị label
            />
          </Grid>

           {/* Hàng 4: Kinh nghiệm, Số lượng tuyển */}
           <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="exp-level-label">Yêu cầu kinh nghiệm</InputLabel>
              <Select
                labelId="exp-level-label"
                id="experienceLevel"
                name="experienceLevel"
                value={jobData.experienceLevel}
                onChange={handleChange}
                input={<OutlinedInput label="Yêu cầu kinh nghiệm" />}
              >
                <MenuItem value="" disabled><em>Chọn mức kinh nghiệm</em></MenuItem>
                 {mockExperienceLevels.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
           <Grid item xs={12} md={6} sx ={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Số lượng tuyển"
              name="numberOfHires"
              type="number"
              value={jobData.numberOfHires}
              onChange={handleChange}
              variant="outlined"
              InputProps={{ inputProps: { min: 1 } }} // Giá trị nhỏ nhất là 1
            />
          </Grid>


          {/* Hàng 5: Mô tả công việc */}
          <Grid item xs={12} sx ={{ mt: 3 }}>
            <TextField
              required
              fullWidth
              label="Mô tả công việc"
              name="description"
              multiline
              rows={6} // Số dòng hiển thị ban đầu
              value={jobData.description}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Hàng 6: Yêu cầu ứng viên */}
          <Grid item xs={12} sx ={{ mt: 3 }}>
             <TextField
              required
              fullWidth
              label="Yêu cầu ứng viên"
              name="requirements"
              multiline
              rows={4}
              value={jobData.requirements}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Hàng 7: Quyền lợi */}
          <Grid item xs={12} sx ={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Quyền lợi"
              name="benefits"
              multiline
              rows={4}
              value={jobData.benefits}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

           {/* Hàng 8: Kỹ năng yêu cầu */}
           <Grid item xs={12} sx ={{ mt: 3 }}>
            <Autocomplete
                multiple // Cho phép chọn nhiều
                id="skills-autocomplete"
                options={mockSkills} // Danh sách gợi ý
                value={jobData.requiredSkills} // Giá trị là mảng
                onChange={handleSkillsChange}
                freeSolo // Cho phép người dùng nhập kỹ năng không có trong gợi ý
                renderTags={(value, getTagProps) => // Hiển thị các tag đã chọn
                    value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Kỹ năng yêu cầu"
                        placeholder="Thêm kỹ năng..."
                    />
                )}
             />
           </Grid>
                    {/* === THÊM MỤC CHỌN BÀI TEST === */}
                <Grid item xs={12} sx ={{ mt: 3 }}>
                <Autocomplete
                    multiple
                    id="associated-tests-autocomplete"
                    options={availableTests} // Lấy từ state đã fetch
                    getOptionLabel={(option) => option.name || ""} // Hiển thị tên test
                    value={jobData.associatedTests} // Giá trị là mảng các object test đã chọn
                    onChange={handleTestsChange} // Handler mới
                    isOptionEqualToValue={(option, value) => option.testId === value.testId} // So sánh bằng testId
                    loading={loadingTests} // Hiển thị loading khi đang tải test
                    disabled={isSubmitting} // Disable khi đang submit form chính
                    disableCloseOnSelect // Giữ dropdown mở khi chọn nhiều
                    renderOption={(props, option, { selected }) => ( // Custom cách hiển thị lựa chọn
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option.name}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Gắn bài test sàng lọc (tùy chọn)"
                            placeholder="Chọn bài test..."
                            error={!!fetchTestError} // Hiển thị lỗi nếu fetch test thất bại
                            helperText={fetchTestError}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                <>
                                    {loadingTests ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                                ),
                            }}
                        />
                    )}
                 />
           </Grid>
          {/* === KẾT THÚC MỤC CHỌN BÀI TEST === */}
           {/* Hàng 9: Nút bấm */}
           <Grid item xs={12} sx ={{ mt: 3 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button type="button" variant="outlined" onClick={() => navigate('/employer/manage-jobs')} disabled={isSubmitting}> {/* Nút Hủy luôn quay về trang quản lý */}
                        Hủy bỏ
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                        {isEditMode ? 'Lưu thay đổi' : 'Đăng tin'} {/* Thay đổi text nút */}
                    </Button>
                </Stack>
           </Grid>
      </Box>
      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
          </Alert>
      </Snackbar>

    </Paper>
  );
}

export default PostJobPage;
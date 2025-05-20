import React, { useState, useEffect, useCallback } from "react" // Added useCallback
import { Link as RouterLink, useNavigate } from "react-router-dom"

// MUI Components
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Paper from "@mui/material/Paper"
import Chip from "@mui/material/Chip"
import Container from "@mui/material/Container"
import { alpha, useTheme } from "@mui/material/styles" // Added useTheme
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Divider from "@mui/material/Divider"
import InputAdornment from "@mui/material/InputAdornment"
import Alert from "@mui/material/Alert" // Added Alert

// Icons
import SearchIcon from "@mui/icons-material/Search"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined" // Using Outlined
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined" // Using Outlined
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined" // Using Outlined
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'; // Icon for categories
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Custom Components
import JobCard from "../components/jobs/JobCard"
import CompanyCard from "../components/companies/CompanyCard" // Corrected import name
import apiService from "../services/api"
import LoadingSpinner from "../components/ui/LoadingSpinner"

// Mock data for filter options (can be moved to a constants file)
const popularCategories = [
  { label: "CNTT - Phần mềm", value: "it-software" },
  { label: "Marketing & Truyền thông", value: "marketing" },
  { label: "Bán hàng & Kinh doanh", value: "sales" },
  { label: "Thiết kế & Sáng tạo", value: "design" },
  { label: "Nhân sự & Tuyển dụng", value: "hr" },
  { label: "Kế toán & Tài chính", value: "accounting"},
]
const popularLocations = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote", "Toàn quốc"]

function HomePage() {
  const navigate = useNavigate()
  const theme = useTheme() // Initialize theme

  const [featuredJobs, setFeaturedJobs] = useState([])
  const [featuredCompanies, setFeaturedCompanies] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [errorJobs, setErrorJobs] = useState(null)
  const [errorCompanies, setErrorCompanies] = useState(null)

  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchLocation, setSearchLocation] = useState(null) // Autocomplete can be null

  useEffect(() => {
    const loadData = async () => {
      setLoadingJobs(true)
      setLoadingCompanies(true)
      setErrorJobs(null)
      setErrorCompanies(null)

      // --- Load Featured Jobs (Latest Jobs) ---
      try {
        // Request specific number of latest jobs
        const jobsResponse = await apiService.getPublicJobs({ limit: 6, sort: '-createdAt' });
        
        // Correctly access the jobs array from response.data.data
        if (jobsResponse && jobsResponse.data && Array.isArray(jobsResponse.data.data)) {
          setFeaturedJobs(jobsResponse.data.data); // API already sorted and limited
        } else {
          // Handle unexpected structure or empty data case
          console.warn("Unexpected jobsResponse structure or no data:", jobsResponse);
          setFeaturedJobs([]);
          // Consider a more specific error if jobsResponse.data exists but jobsResponse.data.data is not an array
          setErrorJobs("Không thể tải danh sách việc làm nổi bật hoặc định dạng dữ liệu không đúng.");
        }
      } catch (error) {
        console.error("Lỗi tải jobs trang chủ:", error);
        setErrorJobs(error.response?.data?.message || error.message || "Lỗi tải việc làm.");
        setFeaturedJobs([]);
      } finally {
        setLoadingJobs(false);
      }

      // --- Load Featured Companies ---
      try {
        // Assuming getPublicCompaniesApi also returns a similar structure or direct array
        // If it returns { data: { data: companiesArray } }, similar change is needed.
        // For now, assuming it might return a direct array or { data: companiesArray }
        const companiesResponse = await apiService.getPublicCompaniesApi({ limit: 6 }); // Example: limit companies
        
        if (companiesResponse && companiesResponse.data && Array.isArray(companiesResponse.data.data)) {
          // If response is { data: { data: [...] } }
          setFeaturedCompanies(companiesResponse.data.data);
        } else if (companiesResponse && Array.isArray(companiesResponse.data)) {
          // If response is { data: [...] } or a direct array from a non-axios raw fetch
           setFeaturedCompanies(companiesResponse.data.slice(0, 6));
        }
        else {
          console.warn("Unexpected companiesResponse structure or no data:", companiesResponse);
          setFeaturedCompanies([]);
          setErrorCompanies("Không thể tải danh sách công ty nổi bật hoặc định dạng dữ liệu không đúng.");
        }
      } catch (error) {
        console.error("Lỗi tải companies trang chủ:", error);
        setErrorCompanies(error.response?.data?.message || error.message || "Lỗi tải công ty.");
        setFeaturedCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    }
    loadData()
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    const queryParams = new URLSearchParams();
    if (searchKeyword) queryParams.set("keyword", searchKeyword);
    if (searchLocation) queryParams.set("location", searchLocation);
    navigate(`/jobs?${queryParams.toString()}`)
  }

  const SectionHeader = ({ icon, title, onViewAllLink }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
        pb: 1,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        fontWeight="600"
        color="text.primary"
        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
      >
        {icon} {title}
      </Typography>
      {onViewAllLink && (
        <Button
          variant="text"
          component={RouterLink}
          to={onViewAllLink}
          size="small"
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 500,
            color: 'primary.main',
            textTransform: 'none',
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
          }}
        >
          Xem tất cả
        </Button>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[50],
        minHeight: "100vh",
        pt: {xs: 2, md: 0}, 
        pb: 6,
      }}
    >
      {/* === Hero Section === */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5, md: 8 }, 
          mb: {xs: 4, md: 6},
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          borderRadius: {xs: 0, md: '24px'},
          position: "relative",
          overflow: "hidden",
          mt: {xs:0, md: -8} 
        }}
      >
        <Box 
          sx={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            opacity: 0.07,
            backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c7da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80")',
            backgroundSize: "cover", backgroundPosition: "center", zIndex: 0,
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, pt: {xs:2, md:8}, pb: {xs:3, md:6} }}>
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: "2rem", sm: "2rem", md: "2.5rem" },
              textShadow: "0 2px 5px rgba(0,0,0,0.25)",
              mb: 2,
            }}
          >
            Kết Nối Tài Năng - Kiến Tạo Tương Lai
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              mb: 4, opacity: 0.9, maxWidth: "700px", mx: "auto",
              fontSize: { xs: "1rem", md: "1.25rem" },
              lineHeight: 1.6,
            }}
          >
            Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu. Tìm kiếm, ứng tuyển và xây dựng sự nghiệp mơ ước của bạn ngay hôm nay!
          </Typography>
          <Paper 
            elevation={6}
            sx={{
              maxWidth: "750px", mx: "auto", borderRadius: "12px", 
              p: 0.5, 
              background: alpha(theme.palette.background.paper, 0.15),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: {xs: 1.5, sm: 1}, p: {xs: 1.5, sm: 1} }}
            >
              <TextField
                variant="outlined"
                placeholder="Chức danh, kỹ năng, công ty..."
                fullWidth
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                InputProps={{
                  startAdornment: ( <InputAdornment position="start"><SearchIcon sx={{color: alpha(theme.palette.common.white, 0.7)}} /></InputAdornment>),
                  sx: {
                    borderRadius: "8px",
                    bgcolor: alpha(theme.palette.common.black, 0.2),
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.common.white, 0.3) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.common.white, 0.5) },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.common.white, borderWidth: '1px' },
                    '& input::placeholder': { color: alpha(theme.palette.common.white, 0.5) },
                  }
                }}
                sx={{ flexGrow: 2 }}
              />
              <Autocomplete
                options={popularLocations}
                value={searchLocation}
                onChange={(event, newValue) => setSearchLocation(newValue)}
                freeSolo
                fullWidth
                popupIcon={<LocationOnOutlinedIcon sx={{color: alpha(theme.palette.common.white, 0.7)}}/>}
                sx={{ flexGrow: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Địa điểm"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: ( <InputAdornment position="start"><LocationOnOutlinedIcon sx={{color: alpha(theme.palette.common.white, 0.7)}} /></InputAdornment>),
                        sx: {
                        borderRadius: "8px",
                        bgcolor: alpha(theme.palette.common.black, 0.2),
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.common.white, 0.3) },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.common.white, 0.5) },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.common.white, borderWidth: '1px' },
                        '& input::placeholder': { color: alpha(theme.palette.common.white, 0.5) },
                      }
                    }}
                  />
                )}
                PaperComponent={(props) => <Paper elevation={4} {...props} />}
              />
              <Button
                variant="contained"
                color="secondary" 
                type="submit"
                size="large"
                sx={{
                  px: {xs:2, sm:3}, fontWeight: "bold", fontSize: "1rem", borderRadius: "8px",
                  minWidth: { xs: "100%", sm: "130px" },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    '&:hover': { bgcolor: 'secondary.dark'}
                }}
              >
                Tìm kiếm
              </Button>
            </Box>
          </Paper>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* === Quick Browse by Category === */}
        <Box sx={{ my: {xs:4, md:6}, p: {xs: 2, sm:3}, borderRadius: '16px', bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <SectionHeader icon={<CategoryOutlinedIcon color="primary" />} title="Tìm việc theo ngành nghề" />
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
            {popularCategories.map((category) => (
              <Chip
                key={category.value}
                label={category.label}
                onClick={() => navigate(`/jobs?industry=${category.value}`)} // Changed to 'industry' to match backend
                clickable
                variant="outlined"
                color="primary"
                sx={{
                  p: 2.5, borderRadius: "20px", fontWeight: 500, fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[3]
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* === Featured Jobs Section === */}
        <Box sx={{ my: {xs:4, md:6}, p: {xs: 2, sm:3}, borderRadius: '16px', bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <SectionHeader icon={<WorkOutlineOutlinedIcon color="primary" />} title="Việc làm mới nhất" onViewAllLink="/jobs" />
          {loadingJobs ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><LoadingSpinner /></Box>
          ) : errorJobs ? (
            <Alert severity="warning" sx={{m:2}}>{errorJobs}</Alert>
          ) : (
            <Grid container spacing={3}>
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={job.id || job._id}>
                    <JobCard job={job} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}><Typography sx={{ textAlign: "center", py: 4, color: "text.secondary", fontStyle: "italic" }}>Hiện chưa có việc làm nào.</Typography></Grid>
              )}
            </Grid>
          )}
        </Box>

        {/* === Employer CTA Section === */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 }, my: {xs:4, md:6},
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: "white", textAlign: "center", borderRadius: '24px', position: "relative", overflow: "hidden",
          }}
        >
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80")', backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }}/>
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)", fontSize: {xs: '1.7rem', md: '2.5rem'} }}>
              Dành cho Nhà tuyển dụng
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: "700px", mx: "auto", opacity: 0.9, fontSize: {xs: '1rem', md: '1.15rem'} }}>
              Đăng tin tuyển dụng và tiếp cận hàng ngàn ứng viên tiềm năng một cách nhanh chóng và hiệu quả.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/employer/post-job"
              size="large"
              sx={{
                bgcolor: "white", color: theme.palette.secondary.dark, fontWeight: "bold",
                px: 5, py: 1.5, fontSize: "1rem", borderRadius: "12px",
                '&:hover': { bgcolor: alpha("#fff", 0.9), boxShadow: "0 4px 15px rgba(0,0,0,0.2)"},
              }}
            >
              Đăng tin ngay
            </Button>
          </Box>
        </Paper>

        {/* === Featured Companies Section === */}
        <Box sx={{ my: {xs:4, md:6}, p: {xs: 2, sm:3}, borderRadius: '16px', bgcolor: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <SectionHeader icon={<BusinessOutlinedIcon color="primary" />} title="Công ty hàng đầu" onViewAllLink="/companies"/>
          {loadingCompanies ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><LoadingSpinner /></Box>
          ) : errorCompanies ? (
            <Alert severity="warning" sx={{m:2}}>{errorCompanies}</Alert>
          ) : (
            <Grid container spacing={3}>
              {featuredCompanies.length > 0 ? (
                featuredCompanies.map((company) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={company.id || company._id}>
                    <CompanyCard company={company} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}><Typography sx={{ textAlign: "center", py: 4, color: "text.secondary", fontStyle: "italic" }}>Hiện chưa có thông tin công ty.</Typography></Grid>
              )}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage

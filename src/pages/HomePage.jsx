"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Paper from "@mui/material/Paper"
import Chip from "@mui/material/Chip"
import Container from "@mui/material/Container"
import { alpha } from "@mui/material/styles"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Divider from "@mui/material/Divider"
import SearchIcon from "@mui/icons-material/Search"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import WorkIcon from "@mui/icons-material/Work"
import BusinessIcon from "@mui/icons-material/Business"
import InputAdornment from "@mui/material/InputAdornment"

import JobCard from "../components/jobs/JobCard"
import CompanyCard from "../components/companies/companyCard"
import apiService from "../services/api"; 
import LoadingSpinner from "../components/ui/LoadingSpinner"

// Dữ liệu giả lập cho bộ lọc nhanh
const popularCategories = [
  { label: "CNTT - Phần mềm", value: "it-software" },
  { label: "Marketing", value: "marketing" },
  { label: "Bán hàng", value: "sales" },
  { label: "Thiết kế", value: "design" },
  { label: "Nhân sự", value: "hr" },
]
const popularLocations = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote"]

function HomePage() {
  const navigate = useNavigate()
  const [errorCompanies, setErrorCompanies] = useState(null);
  const [errorJobs, setErrorJobs] = useState(null);
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [featuredCompanies, setFeaturedCompanies] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  // State cho thanh tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchLocation, setSearchLocation] = useState(null)

  // Load jobs và companies
  useEffect(() => {
    const loadData = async () => {
      setLoadingJobs(true);
      setLoadingCompanies(true);
      setErrorJobs(null);
      setErrorCompanies(null);

      try {
        // Gọi API để lấy jobs
        const jobsResponse = await apiService.getPublicJobs(); // Giả sử lấy 6 job mới nhất ở backend hoặc lọc ở đây
        if (jobsResponse && Array.isArray(jobsResponse.data)) {
          // Sắp xếp theo createdAt (ngày tạo) mới nhất nếu backend chưa làm
          // Và lấy 6 jobs đầu tiên
          const sortedJobs = jobsResponse.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setFeaturedJobs(sortedJobs.slice(0, 4));
        } else {
          setFeaturedJobs([]);
          setErrorJobs("Không thể tải danh sách việc làm nổi bật.");
        }
      } catch (error) {
        console.error("Lỗi tải jobs trang chủ:", error);
        setErrorJobs(error.response?.data?.message || error.message || "Lỗi tải việc làm.");
        setFeaturedJobs([]);
      } finally {
        setLoadingJobs(false);
      }

      try {
        // Gọi API để lấy companies
        const companiesResponse = await apiService.getPublicCompaniesApi(); // Giả sử lấy 6 công ty hoặc lọc ở đây
        if (companiesResponse && Array.isArray(companiesResponse.data)) {
          // Lấy 6 công ty đầu tiên (backend có thể đã sắp xếp theo tiêu chí nổi bật)
          setFeaturedCompanies(companiesResponse.data.slice(0, 4));
        } else {
          setFeaturedCompanies([]);
          setErrorCompanies("Không thể tải danh sách công ty nổi bật.");
        }
      } catch (error) {
        console.error("Lỗi tải companies trang chủ:", error);
        setErrorCompanies(error.response?.data?.message || error.message || "Lỗi tải công ty.");
        setFeaturedCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadData();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (event) => {
    event.preventDefault()
    const keywordQuery = searchKeyword ? `keyword=${encodeURIComponent(searchKeyword)}` : ""
    const locationQuery = searchLocation ? `location=${encodeURIComponent(searchLocation)}` : ""
    const queryParams = [keywordQuery, locationQuery].filter(Boolean).join("&")
    console.log("Navigating to:", `/jobs?${queryParams}`)
    navigate(`/jobs?${queryParams}`)
  }

  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        pt: 2,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* === Hero Section === */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            mb: 5,
            textAlign: "center",
            background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
            color: "white",
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage:
                'url("https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Kết Nối Tài Năng - Kiến Tạo Tương Lai
            </Typography>

            <Typography
              variant="h6"
              component="p"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: "800px",
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.2rem" },
              }}
            >
              Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu tại Việt Nam.
            </Typography>

            <Card
              elevation={4}
              sx={{
                maxWidth: "800px",
                mx: "auto",
                borderRadius: 2,
                background: alpha("#fff", 0.95),
                backdropFilter: "blur(8px)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <TextField
                    variant="outlined"
                    placeholder="Nhập chức danh, kỹ năng, công ty..."
                    fullWidth
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flexGrow: 2 }}
                  />

                  <Autocomplete
                    options={popularLocations}
                    value={searchLocation}
                    onChange={(event, newValue) => {
                      setSearchLocation(newValue)
                    }}
                    freeSolo
                    fullWidth
                    sx={{ flexGrow: 1 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Địa điểm"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{
                      px: 3,
                      py: { xs: 1.5, sm: "auto" },
                      height: { sm: "56px" },
                      minWidth: { xs: "100%", sm: "120px" },
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Tìm kiếm
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        {/* === Quick Browse by Category === */}
        <Card
          elevation={2}
          sx={{
            my: 5,
            p: 3,
            borderRadius: 2,
            background: "white",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h5"
              component="h2"
              fontWeight="medium"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <WorkIcon color="primary" /> Tìm việc theo ngành nghề
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            {popularCategories.map((category) => (
              <Chip
                key={category.value}
                label={category.label}
                onClick={() => navigate(`/jobs?category=${category.value}`)}
                clickable
                sx={{
                  px: 1,
                  py: 2.5,
                  borderRadius: "16px",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  },
                }}
                color="primary"
                variant="outlined"
              />
            ))}
            <Chip
              label="Xem tất cả"
              onClick={() => navigate(`/jobs`)}
              clickable
              color="primary"
              sx={{
                px: 1,
                py: 2.5,
                borderRadius: "16px",
                fontWeight: 600,
                fontSize: "0.9rem",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s ease",
                },
              }}
            />
          </Box>
        </Card>

        {/* === Featured Jobs Section === */}
        <Card
          elevation={2}
          sx={{
            my: 5,
            p: 3,
            borderRadius: 2,
            background: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              fontWeight="medium"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <WorkIcon color="primary" /> Việc làm mới nhất
            </Typography>

            <Button
              variant="outlined"
              component={RouterLink}
              to="/jobs"
              size="small"
              sx={{
                borderRadius: "20px",
                fontWeight: 500,
              }}
            >
              Xem tất cả
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loadingJobs ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <LoadingSpinner />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job.id || job._id}>
                    <JobCard job={job} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Typography sx={{ fontStyle: "italic" }}>Hiện chưa có việc làm nào.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Card>

        {/* === Employer CTA Section === */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            my: 5,
            background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
            color: "white",
            textAlign: "center",
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage:
                'url("https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              Dành cho Nhà tuyển dụng
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
                opacity: 0.9,
              }}
            >
              Đăng tin tuyển dụng và tiếp cận hàng ngàn ứng viên tiềm năng một cách nhanh chóng và hiệu quả.
            </Typography>

            <Button
              variant="contained"
              component={RouterLink}
              to="/employer/post-job"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#f57c00",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: alpha("#fff", 0.9),
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              Đăng tin ngay
            </Button>
          </Box>
        </Paper>

        {/* === Featured Companies Section === */}
        <Card
          elevation={2}
          sx={{
            my: 5,
            p: 3,
            borderRadius: 2,
            background: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              fontWeight="medium"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <BusinessIcon color="primary" /> Công ty hàng đầu
            </Typography>

            <Button
              variant="outlined"
              component={RouterLink}
              to="/companies"
              size="small"
              sx={{
                borderRadius: "20px",
                fontWeight: 500,
              }}
            >
              Xem tất cả
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loadingCompanies ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <LoadingSpinner />
            </Box>
          ) : (
            <Grid
              container
              spacing={3}
              justifyContent="center"
              alignItems="center"
              sx={{
                mx: "auto",
                maxWidth: "100%",
              }}
            >
              {featuredCompanies.length > 0 ? (
                featuredCompanies.map((company) => (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={2}
                    key={company.id || company._id}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ width: "100%", maxWidth: "220px" }}>
                      <CompanyCard company={company} />
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Typography sx={{ fontStyle: "italic" }}>Hiện chưa có thông tin công ty.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Card>
      </Container>
    </Box>
  )
}

export default HomePage

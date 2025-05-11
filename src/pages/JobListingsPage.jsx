"use client"

// src/pages/JobListingsPage.jsx
import { useState, useEffect, useCallback } from "react"
import apiService from "../services/api" // Import service API
import { useLocation, useNavigate } from "react-router-dom"
import JobCard from "../components/jobs/JobCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"

// MUI Components
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Button from "@mui/material/Button"
import Pagination from "@mui/material/Pagination"
import Checkbox from "@mui/material/Checkbox" // Vẫn dùng cho MenuItem
import InputAdornment from "@mui/material/InputAdornment"
import Container from "@mui/material/Container"
import Alert from "@mui/material/Alert"
import OutlinedInput from "@mui/material/OutlinedInput" // Dùng cho Select multiple
import Chip from "@mui/material/Chip" // Dùng để hiển thị giá trị đã chọn trong Select
import ListItemText from "@mui/material/ListItemText" // Dùng trong Select multiple

// Icons
import SearchIcon from "@mui/icons-material/Search"
import ClearAllIcon from "@mui/icons-material/ClearAll"
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined"
import SortIcon from "@mui/icons-material/Sort"

// Mock data for filter options (vẫn cần để hiển thị các lựa chọn filter)
const mockJobTypes = ["Full-time", "Part-time", "Hợp đồng", "Thực tập", "Remote", "Freelance"]
const mockLocations = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote", "Khác"]
const mockExperiences = ["Chưa có kinh nghiệm", "Dưới 1 năm", "1 năm", "2 năm", "3 năm", "4 năm", "5 năm", "Trên 5 năm"]
const mockSalaryRanges = [
  { value: "0-10", label: "Dưới 10 triệu" },
  { value: "10-15", label: "10 - 15 triệu" },
  { value: "15-20", label: "15 - 20 triệu" },
  { value: "20-30", label: "20 - 30 triệu" },
  { value: "30-50", label: "30 - 50 triệu" },
  { value: "50+", label: "Trên 50 triệu" },
  { value: "thoathuan", label: "Thương lượng" },
]

// ITEM_HEIGHT và ITEM_PADDING_TOP dùng để tính chiều cao Menu của Select multiple
const ITEM_HEIGHT = 56 // Increased from 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 280, // Increased from 250
    },
  },
}

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

// --- Component Chính ---
function JobListingsPage() {
  const navigate = useNavigate()
  const query = useQuery()

  // --- STATE ---
  const [allJobs, setAllJobs] = useState([])
  const [displayJobs, setDisplayJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    keyword: query.get("keyword") || "",
    locations: query.getAll("location") || [],
    jobTypes: query.getAll("jobType") || [],
    experienceLevels: query.getAll("experience") || [],
    salaryRanges: query.getAll("salary") || [],
  })
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 9

  // --- Hàm cập nhật Query Params ---
  const updateQueryParams = useCallback(
    (newFilters) => {
      const params = new URLSearchParams()
      if (newFilters.keyword) params.set("keyword", newFilters.keyword)
      newFilters.locations.forEach((loc) => params.append("location", loc))
      newFilters.jobTypes.forEach((type) => params.append("jobType", type))
      newFilters.experienceLevels.forEach((exp) => params.append("experience", exp))
      newFilters.salaryRanges.forEach((sal) => params.append("salary", sal))
      navigate(`?${params.toString()}`, { replace: true })
    },
    [navigate],
  )

  // --- Hàm kiểm tra khoảng lương (Client-side - Cần hoàn thiện logic) ---
  const checkSalaryRange = useCallback((jobSalary, selectedRanges) => {
    if (selectedRanges.length === 0) return true
    if (selectedRanges.includes("thoathuan") && (jobSalary || "").toLowerCase() === "thương lượng") {
      return true
    }
    // TODO: Hoàn thiện logic kiểm tra các khoảng lương số
    console.warn("Logic checkSalaryRange client-side chưa hoàn thiện!")
    return selectedRanges.some((range) => range !== "thoathuan")
  }, [])

  // --- Hàm áp dụng bộ lọc và sắp xếp (Xử lý phía Client) ---
  const applyFiltersAndSort = useCallback(() => {
    console.log("Applying filters/sort (Client-side):", filters, sortBy)
    let filtered = [...allJobs]

    // Lọc theo keyword
    if (filters.keyword) {
      const keywordLower = filters.keyword.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(keywordLower) ||
          job.companyName.toLowerCase().includes(keywordLower) ||
          job.requiredSkills?.some((skill) => skill.toLowerCase().includes(keywordLower)),
      )
    }
    // Lọc theo địa điểm
    if (filters.locations.length > 0) {
      filtered = filtered.filter(
        (job) =>
          filters.locations.includes(job.location) ||
          (filters.locations.includes("Khác") && !mockLocations.slice(0, -1).includes(job.location)),
      )
    }
    // Lọc theo loại hình
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter((job) => filters.jobTypes.includes(job.type))
    }
    // Lọc theo kinh nghiệm
    if (filters.experienceLevels.length > 0) {
      filtered = filtered.filter((job) => job.experienceLevel && filters.experienceLevels.includes(job.experienceLevel))
    }
    // Lọc theo mức lương
    if (filters.salaryRanges.length > 0) {
      filtered = filtered.filter((job) => checkSalaryRange(job.salary, filters.salaryRanges))
    }

    // Sắp xếp
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt || b.datePosted) - new Date(a.createdAt || a.datePosted))
    }

    console.log("Filtered/Sorted jobs count:", filtered.length)
    setDisplayJobs(filtered)
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allJobs, filters, sortBy, checkSalaryRange])

  // --- useEffect: Load jobs từ API khi component mount ---
  useEffect(() => {
    const loadJobsFromApi = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiService.getPublicJobs()
        if (response && Array.isArray(response.data)) {
          setAllJobs(response.data)
        } else {
          setAllJobs([])
          setError("Dữ liệu việc làm trả về không hợp lệ.")
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách việc làm."
        setError(errorMsg)
        setAllJobs([])
      } finally {
        setLoading(false)
      }
    }
    loadJobsFromApi()
  }, []) // Chỉ chạy 1 lần

  // --- useEffect: Áp dụng filter/sort khi allJobs, filters, hoặc sortBy thay đổi ---
  useEffect(() => {
    applyFiltersAndSort()
  }, [allJobs, filters, sortBy, applyFiltersAndSort])

  // --- Handlers ---
  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
    // Không cập nhật URL ngay lập tức, đợi nhấn nút Tìm kiếm (nếu có) hoặc để useEffect tự xử lý
  }

  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: typeof value === "string" ? value.split(",") : value,
    }))
  }

  const handleClearFilters = () => {
    const clearedFilters = { keyword: "", locations: [], jobTypes: [], experienceLevels: [], salaryRanges: [] }
    setFilters(clearedFilters)
    updateQueryParams(clearedFilters) // Reset URL
  }

  const handleSortChange = (event) => {
    setSortBy(event.target.value)
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
    window.scrollTo(0, 0)
  }

  // --- Tính toán jobs cho trang hiện tại ---
  const indexOfLastJob = currentPage * jobsPerPage
  const indexOfFirstJob = indexOfLastJob - jobsPerPage
  const currentJobs = displayJobs.slice(indexOfFirstJob, indexOfLastJob)
  const pageCount = Math.ceil(displayJobs.length / jobsPerPage)

  // --- Render ---
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* === TIÊU ĐỀ TRANG === */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
          Khám phá việc làm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm kiếm việc làm phù hợp với kỹ năng và sở thích của bạn
        </Typography>
      </Box>
      {/* === THANH FILTER NGANG === */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          background: "linear-gradient(to right, #f9f9ff, #ffffff)",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          {/* Keyword Search */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <TextField
              fullWidth
              label="Từ khóa tìm kiếm"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              size="small"
              variant="outlined"
              InputLabelProps={{
                sx: {
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "text.primary",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "10px",
                  "&:hover": {
                    boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.15)",
                  },
                },
              }}
            />
          </Grid>

          {/* Location Select */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="location-filter-label"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "text.primary",
                  padding: "0 8px 0 0", // Thêm padding bên phải
                  backgroundColor: "white", // Đảm bảo nền trắng để text hiển thị rõ
                  borderRadius: "4px",
                }}
              >
                Địa điểm
              </InputLabel>
              <Select
                labelId="location-filter-label"
                multiple
                value={filters.locations}
                onChange={handleMultiSelectChange}
                input={
                  <OutlinedInput
                    label="Địa điểm"
                    sx={{
                      width: "7em",
                      borderRadius: "10px",
                      "&:hover": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                      },
                    }}
                  />
                }
                name="locations"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{
                          background: "rgba(25, 118, 210, 0.08)",
                          borderRadius: "6px",
                        }}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {mockLocations.map((location) => (
                  <MenuItem
                    key={location}
                    value={location}
                    sx={{
                      py: 1.2, // Increased padding
                      "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                    }}
                  >
                    <Checkbox
                      checked={filters.locations.indexOf(location) > -1}
                      size="medium" // Changed from small
                      color="primary"
                    />
                    <ListItemText
                      primary={location}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Job Type Select */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="jobtype-filter-label"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "text.primary",
                  padding: "0 8px 0 0", // Thêm padding bên phải
                  backgroundColor: "white", // Đảm bảo nền trắng để text hiển thị rõ
                  borderRadius: "4px",
                }}
              >
                Loại hình
              </InputLabel>
              <Select
                labelId="jobtype-filter-label"
                multiple
                value={filters.jobTypes}
                onChange={handleMultiSelectChange}
                input={
                  <OutlinedInput
                    label="Loại hình"
                    sx={{
                      width: "7.3em",
                      borderRadius: "10px",
                      "&:hover": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                      },
                    }}
                  />
                }
                name="jobTypes"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{
                          background: "rgba(25, 118, 210, 0.08)",
                          borderRadius: "6px",
                        }}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {mockJobTypes.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{
                      py: 1.2, // Increased padding
                      "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                    }}
                  >
                    <Checkbox
                      checked={filters.jobTypes.indexOf(type) > -1}
                      size="medium" // Changed from small
                      color="primary"
                    />
                    <ListItemText
                      primary={type}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Experience Select */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="experience-filter-label"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "text.primary",
                  padding: "0 8px 0 0", // Thêm padding bên phải
                  backgroundColor: "white", // Đảm bảo nền trắng để text hiển thị rõ
                  borderRadius: "4px",
                }}
              >
                Kinh nghiệm
              </InputLabel>
              <Select
                labelId="experience-filter-label"
                multiple
                value={filters.experienceLevels}
                onChange={handleMultiSelectChange}
                input={
                  <OutlinedInput
                    label="Kinh nghiệm"
                    sx={{
                      width: "8.7em",
                      borderRadius: "10px",
                      "&:hover": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                      },
                    }}
                  />
                }
                name="experienceLevels"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{
                          background: "rgba(25, 118, 210, 0.08)",
                          borderRadius: "6px",
                        }}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {mockExperiences.map((level) => (
                  <MenuItem
                    key={level}
                    value={level}
                    sx={{
                      py: 1.2, // Increased padding
                      "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                    }}
                  >
                    <Checkbox
                      checked={filters.experienceLevels.indexOf(level) > -1}
                      size="medium" // Changed from small
                      color="primary"
                    />
                    <ListItemText
                      primary={level}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Salary Select */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="salary-filter-label"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "text.primary",
                  padding: "0 8px 0 0", // Thêm padding bên phải
                  backgroundColor: "white", // Đảm bảo nền trắng để text hiển thị rõ
                  borderRadius: "4px",
                }}
              >
                Mức lương
              </InputLabel>
              <Select
                labelId="salary-filter-label"
                multiple
                value={filters.salaryRanges}
                onChange={handleMultiSelectChange}
                input={
                  <OutlinedInput
                    label="Mức lương"
                    sx={{
                      width: "8.4em",
                      borderRadius: "10px",
                      "&:hover": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                      },
                    }}
                  />
                }
                name="salaryRanges"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const selectedLabel = mockSalaryRanges.find((r) => r.value === value)?.label || value
                      return (
                        <Chip
                          key={value}
                          label={selectedLabel}
                          size="small"
                          sx={{
                            background: "rgba(25, 118, 210, 0.08)",
                            borderRadius: "6px",
                          }}
                        />
                      )
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {mockSalaryRanges.map((range) => (
                  <MenuItem
                    key={range.value}
                    value={range.value}
                    sx={{
                      py: 1.2, // Increased padding
                      "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                    }}
                  >
                    <Checkbox
                      checked={filters.salaryRanges.indexOf(range.value) > -1}
                      size="medium" // Changed from small
                      color="primary"
                    />
                    <ListItemText
                      primary={range.label}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Nút Clear Filters */}
          <Grid item xs={12} sm={6} md={4} lg={0.8} sx={{ textAlign: { xs: "right", lg: "center" } }}>
            <Button
              onClick={handleClearFilters}
              variant="outlined"
              size="medium"
              sx={{
                height: "40px",
                borderRadius: "10px",
                borderColor: "rgba(25, 118, 210, 0.5)",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
              startIcon={<ClearAllIcon fontSize="small" />}
            >
              Xóa lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* === KẾT THÚC THANH FILTER NGANG === */}
      {/* === KHU VỰC HIỂN THỊ KẾT QUẢ === */}
      <Grid container spacing={3}>
        {" "}
        {/* Grid container bao ngoài kết quả */}
        <Grid item xs={12}>
          {" "}
          {/* Grid item chiếm toàn bộ chiều rộng */}
          {/* Header kết quả ("Tìm thấy X việc làm" + Sắp xếp) */}
          <Paper
            sx={{
              width: "140%",
              p: 2.5,
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              backgroundColor: "#f8fafc",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="600"
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                "&::before": {
                  content: '""',
                  display: "inline-block",
                  width: "4px",
                  height: "24px",
                  backgroundColor: "primary.main",
                  borderRadius: "2px",
                  marginRight: "12px",
                },
              }}
            >
              Tìm thấy {loading ? "..." : displayJobs.length} việc làm
            </Typography>
            <FormControl size="small" variant="outlined" sx={{ minWidth: 160 }}>
              <InputLabel
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "text.primary",
                  padding: "0 8px 0 0", // Thêm padding bên phải
                  backgroundColor: "white", // Đảm bảo nền trắng để text hiển thị rõ
                  borderRadius: "4px",
                }}
              >
                Sắp xếp
              </InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={handleSortChange}
                startAdornment={<SortIcon sx={{ mr: 0.5, ml: -0.5, color: "primary.light" }} />}
                sx={{
                  borderRadius: "10px",
                  "&:hover": {
                    boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                  },
                }}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          {/* Hiển thị Loading, Lỗi hoặc Kết quả */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <LoadingSpinner />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: "10px",
                padding: "16px 20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
            >
              {error}
            </Alert>
          ) : (
            <Box>
              {/* Grid chứa Job Cards */}
              <Grid container spacing={3}>
                {currentJobs.length > 0 ? (
                  currentJobs.map((job) => (
                    <Grid item xs={12} sm={6} md={4} key={job._id || job.id}>
                      {" "}
                      {/* Giữ 3 cột trên md */}
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          transition: "transform 0.2s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        <JobCard job={job} />
                      </Box>
                    </Grid>
                  ))
                ) : (
                  // "No results" display
                  <Grid item xs={12} sx={{ textAlign: "center", py: 8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: { xs: 3, sm: 5 },
                        borderRadius: "16px",
                        bgcolor: "#f8fafc",
                        maxWidth: "550px",
                        mx: "auto",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <FindInPageOutlinedIcon
                        sx={{
                          fontSize: 80,
                          color: "primary.light",
                          mb: 3,
                          opacity: 0.7,
                        }}
                      />
                      <Typography variant="h5" gutterBottom fontWeight="600" color="primary.dark">
                        Không tìm thấy việc làm phù hợp
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Vui lòng thử thay đổi hoặc xóa bớt bộ lọc.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleClearFilters}
                        startIcon={<ClearAllIcon />}
                        sx={{
                          borderRadius: "10px",
                          py: 1.2,
                          px: 3,
                          boxShadow: "0 4px 14px rgba(25, 118, 210, 0.25)",
                          "&:hover": {
                            boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
                          },
                        }}
                      >
                        Xóa tất cả bộ lọc
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Phân trang */}
              {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 3 }}>
                  <Pagination
                    count={pageCount}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    size="large"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "8px",
                        mx: 0.5,
                        minWidth: "40px",
                        height: "40px",
                        fontWeight: 500,
                      },
                      "& .Mui-selected": {
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Grid>{" "}
        {/* Kết thúc Grid item chứa kết quả */}
      </Grid>{" "}
      {/* Kết thúc Grid container bao ngoài kết quả */}
    </Container>
  )
}

export default JobListingsPage

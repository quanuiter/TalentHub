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
import Divider from "@mui/material/Divider"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import FormGroup from "@mui/material/FormGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import Stack from "@mui/material/Stack"
import InputAdornment from "@mui/material/InputAdornment"
import Container from "@mui/material/Container"
import Alert from "@mui/material/Alert"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import Chip from "@mui/material/Chip"
import Badge from "@mui/material/Badge"
import { alpha } from "@mui/material/styles"

// Icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FilterListIcon from "@mui/icons-material/FilterList"
import SearchIcon from "@mui/icons-material/Search"
import ClearAllIcon from "@mui/icons-material/ClearAll"
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined"
import CloseIcon from "@mui/icons-material/Close"
import SortIcon from "@mui/icons-material/Sort"
import TuneIcon from "@mui/icons-material/Tune"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import WorkIcon from "@mui/icons-material/Work"
import SchoolIcon from "@mui/icons-material/School"
import PaidIcon from "@mui/icons-material/Paid"

// Mock data for filter options (giữ nguyên)
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

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

// --- Component Chính ---
function JobListingsPage() {
  const navigate = useNavigate()
  const query = useQuery()

  // --- STATE ---
  const [allJobs, setAllJobs] = useState([]) // State lưu tất cả jobs gốc từ API
  const [displayJobs, setDisplayJobs] = useState([]) // State lưu jobs đã lọc/sắp xếp để hiển thị
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const jobsPerPage = 9

  // Calculate total active filters for badge
  const totalActiveFilters =
    filters.locations.length +
    filters.jobTypes.length +
    filters.experienceLevels.length +
    filters.salaryRanges.length +
    (filters.keyword ? 1 : 0)

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
    // Tạm thời trả về true nếu có chọn khoảng lương số nhưng chưa xử lý được
    return selectedRanges.some((range) => range !== "thoathuan")
  }, [])

  // --- Hàm áp dụng bộ lọc và sắp xếp (Xử lý phía Client) ---
  const applyFiltersAndSort = useCallback(() => {
    console.log("Applying filters/sort (Client-side):", filters, sortBy)
    let filtered = [...allJobs] // Bắt đầu với tất cả jobs gốc

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
      // Sử dụng createdAt nếu API trả về, nếu không thì dùng datePosted
      filtered.sort((a, b) => new Date(b.createdAt || b.datePosted) - new Date(a.createdAt || a.datePosted))
    }
    // Thêm các kiểu sắp xếp khác nếu cần

    console.log("Filtered/Sorted jobs count:", filtered.length)
    setDisplayJobs(filtered) // Cập nhật state để hiển thị
    setCurrentPage(1) // Luôn reset về trang 1 khi lọc/sắp xếp lại
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allJobs, filters, sortBy, checkSalaryRange]) // Thêm checkSalaryRange vào dependencies

  // --- useEffect: Load jobs từ API khi component mount ---
  useEffect(() => {
    const loadJobsFromApi = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiService.getPublicJobs()
        if (response && Array.isArray(response.data)) {
          console.log("Jobs fetched from API:", response.data)
          setAllJobs(response.data) // Lưu dữ liệu gốc từ API vào allJobs
        } else {
          console.error("API response is not an array:", response)
          setAllJobs([])
          setError("Dữ liệu việc làm trả về không hợp lệ.")
        }
      } catch (err) {
        console.error("Lỗi tải jobs từ API:", err)
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
    // Chỉ chạy applyFiltersAndSort khi đã có dữ liệu trong allJobs
    applyFiltersAndSort()
  }, [allJobs, filters, sortBy, applyFiltersAndSort]) // Phụ thuộc vào các state này

  // --- Handlers cho Bộ lọc ---
  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
    // Không cần gọi applyFiltersAndSort ở đây, useEffect sẽ tự xử lý
  }
  const handleCheckboxChange = (event) => {
    const { name, value, checked } = event.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked ? [...prevFilters[name], value] : prevFilters[name].filter((item) => item !== value),
    }))
    // Không cần gọi applyFiltersAndSort ở đây, useEffect sẽ tự xử lý
  }

  // Handler cho nút "Áp dụng bộ lọc" (Cập nhật URL)
  const handleApplyFiltersClick = () => {
    // useEffect đã tự động lọc/sort rồi, nút này chỉ cần cập nhật URL
    updateQueryParams(filters)
    setMobileFilterOpen(false) // Close mobile filter drawer after applying
  }

  // Handler cho nút "Xóa bộ lọc"
  const handleClearFilters = () => {
    const clearedFilters = { keyword: "", locations: [], jobTypes: [], experienceLevels: [], salaryRanges: [] }
    setFilters(clearedFilters)
    // useEffect sẽ tự động áp dụng lại filter trống
    updateQueryParams(clearedFilters)
  }

  // Handler cho thay đổi sắp xếp
  const handleSortChange = (event) => {
    setSortBy(event.target.value)
    // useEffect sẽ tự động sắp xếp lại
  }

  // Handler cho thay đổi trang
  const handlePageChange = (event, value) => {
    setCurrentPage(value)
    window.scrollTo(0, 0)
  }

  // Tính toán jobs cho trang hiện tại và tổng số trang (dựa trên displayJobs)
  const indexOfLastJob = currentPage * jobsPerPage
  const indexOfFirstJob = indexOfLastJob - jobsPerPage
  const currentJobs = displayJobs.slice(indexOfFirstJob, indexOfLastJob)
  const pageCount = Math.ceil(displayJobs.length / jobsPerPage)

  // --- Component Nội dung Bộ lọc (Tách ra để dùng lại cho Mobile Drawer) ---
  const FilterContent = () => (
    <>
      {/* Header cho mobile drawer */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" }, // Only show on mobile
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Bộ lọc
        </Typography>
        <IconButton onClick={() => setMobileFilterOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Title cho desktop sidebar */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          display: { xs: "none", md: "flex" }, // Only show on desktop
          alignItems: "center",
          fontWeight: "bold",
          color: "primary.main",
          mb: 1,
        }}
      >
        <FilterListIcon sx={{ mr: 1 }} /> Bộ lọc
      </Typography>
      <Divider sx={{ mb: 2, display: { xs: "none", md: "block" } }} />

      {/* Nút Áp dụng / Xóa */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleApplyFiltersClick} // Apply và đóng drawer
          startIcon={<SearchIcon />}
          sx={{ borderRadius: "8px", py: 1, fontWeight: 500 }}
        >
          Áp dụng
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleClearFilters}
          startIcon={<ClearAllIcon />}
          sx={{ borderRadius: "8px", py: 1 }}
        >
          Xóa bộ lọc
        </Button>
      </Stack>

      {/* Bộ lọc Keyword */}
      <TextField
        fullWidth
        label="Từ khóa"
        name="keyword"
        value={filters.keyword}
        onChange={handleFilterChange}
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          sx: { borderRadius: "8px" },
        }}
      />
      <Divider sx={{ mb: 2 }} />

      {/* Các Accordion filter */}
      {[
        {
          title: "Địa điểm",
          icon: <LocationOnIcon sx={{ mr: 1, color: "primary.main", fontSize: "1.2rem" }} />,
          items: mockLocations,
          filterKey: "locations",
          defaultExpanded: true,
        },
        {
          title: "Loại hình công việc",
          icon: <WorkIcon sx={{ mr: 1, color: "primary.main", fontSize: "1.2rem" }} />,
          items: mockJobTypes,
          filterKey: "jobTypes",
        },
        {
          title: "Kinh nghiệm",
          icon: <SchoolIcon sx={{ mr: 1, color: "primary.main", fontSize: "1.2rem" }} />,
          items: mockExperiences,
          filterKey: "experienceLevels",
        },
        {
          title: "Mức lương",
          icon: <PaidIcon sx={{ mr: 1, color: "primary.main", fontSize: "1.2rem" }} />,
          items: mockSalaryRanges,
          filterKey: "salaryRanges",
          isSalary: true,
        },
      ].map((filterGroup) => (
        <Accordion
          key={filterGroup.filterKey}
          defaultExpanded={filterGroup.defaultExpanded || false}
          elevation={0}
          disableGutters // Remove spacing between accordions
          sx={{ "&:before": { display: "none" }, bgcolor: "transparent" /* Transparent background */ }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              p: 0, // Remove padding
              minHeight: "auto", // Adjust height
              "& .MuiAccordionSummary-content": { my: 1 }, // Margin for content
              "&:hover": { bgcolor: alpha("#1976d2", 0.04) },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              {filterGroup.icon}
              <Typography variant="subtitle1" fontWeight="medium">
                {filterGroup.title}
              </Typography>
              {/* Display count of selected items */}
              {filters[filterGroup.filterKey].length > 0 && (
                <Chip
                  label={filters[filterGroup.filterKey].length}
                  size="small"
                  sx={{ ml: "auto", mr: 1, height: 20, fontSize: "0.7rem" }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              p: 1,
              pt: 0,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <FormGroup>
              {filterGroup.items.map((item) => {
                const value = filterGroup.isSalary ? item.value : item
                const label = filterGroup.isSalary ? item.label : item
                return (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        checked={filters[filterGroup.filterKey].includes(value)}
                        onChange={handleCheckboxChange}
                        name={filterGroup.filterKey}
                        value={value}
                        size="small"
                        color="primary"
                      />
                    }
                    label={label}
                    sx={{ mb: 0 }} // Reduce margin bottom
                  />
                )
              })}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )

  // --- Render ---
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "85%",
            maxWidth: "320px",
            p: 2,
            boxSizing: "border-box",
          },
        }}
      >
        <FilterContent />
      </Drawer>

      {/* Mobile Filter & Sort Controls */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          mb: 2,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          startIcon={<TuneIcon />}
          onClick={() => setMobileFilterOpen(true)}
          sx={{
            borderRadius: "8px",
            py: 1,
            justifyContent: "flex-start",
            borderColor: "divider",
          }}
        >
          <Badge
            badgeContent={totalActiveFilters}
            color="primary"
            sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem", transform: "scale(0.9) translate(50%, -50%)" } }} // Adjust badge
          >
            Bộ lọc
          </Badge>
        </Button>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 120, flexGrow: 1 }}>
          <InputLabel>Sắp xếp</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Sắp xếp"
            startAdornment={<SortIcon sx={{ mr: 0.5, ml: -0.5, color: "action.active" }} />}
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="newest">Mới nhất</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Active Filters Display (Mobile) */}
      {totalActiveFilters > 0 && (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
          }}
        >
          {filters.keyword && (
            <Chip
              label={`Từ khóa: ${filters.keyword}`}
              onDelete={() => setFilters((prev) => ({ ...prev, keyword: "" }))}
              size="small"
            />
          )}

          {filters.locations.map((loc) => (
            <Chip
              key={`loc-${loc}`}
              label={loc}
              onDelete={() =>
                setFilters((prev) => ({
                  ...prev,
                  locations: prev.locations.filter((l) => l !== loc),
                }))
              }
              size="small"
            />
          ))}

          {filters.jobTypes.map((type) => (
            <Chip
              key={`type-${type}`}
              label={type}
              onDelete={() =>
                setFilters((prev) => ({
                  ...prev,
                  jobTypes: prev.jobTypes.filter((t) => t !== type),
                }))
              }
              size="small"
            />
          ))}

          {totalActiveFilters > 5 && (
            <Chip
              label={`+${totalActiveFilters - 5} bộ lọc khác`}
              size="small"
              onClick={() => setMobileFilterOpen(true)}
            />
          )}
        </Box>
      )}

      <Grid container spacing={3} alignItems="flex-start">
        {/* === Filters Sidebar (Desktop) === */}
        <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper
            sx={{
              p: 2,
              position: "sticky",
              top: 80, // Adjust based on your header height
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <FilterContent />
          </Paper>
        </Grid>

        {/* === Job Listings Area (Cột Phải) === */}
        <Grid item xs={12} md={9} sx={{width: "30em"}}>
          {/* Header kết quả */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight="medium" color="text.primary"sx={{ width:'100%' }}>
              Tìm thấy {loading ? "..." : displayJobs.length} việc làm
            </Typography>

            <FormControl
              size="small"
              variant="outlined"
              sx={{
                minWidth: 150,
                display: { xs: "none", md: "block" }, // Hide on mobile header
              }}
            >
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={handleSortChange}
                startAdornment={<SortIcon sx={{ mr: 0.5, ml: -0.5, color: "action.active" }} />}
                sx={{ borderRadius: "8px" }}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Hiển thị Loading, Lỗi hoặc Kết quả */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <LoadingSpinner />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {error}
            </Alert>
          ) : (
            <Box>
              <Grid container spacing={2}>
                {currentJobs.length > 0 ? (
                  currentJobs.map((job) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      lg={4} // 3 columns on large screens
                      key={job._id || job.id}
                      sx={{
                        display: "flex",
                      }}
                    >
                      <Box sx={{ width: "100%" }}>
                        <JobCard job={job} />
                      </Box>
                    </Grid>
                  ))
                ) : (
                  // Improved "No results" display
                  <Grid item xs={12} sx={{ textAlign: "center", py: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: { xs: 2, sm: 4 },
                        borderRadius: "12px",
                        bgcolor: "background.paper", // Use paper background
                        maxWidth: "500px",
                        mx: "auto",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <FindInPageOutlinedIcon sx={{ fontSize: 70, color: "text.secondary", mb: 2, opacity: 0.7 }} />
                      <Typography variant="h6" gutterBottom fontWeight="medium">
                        Không tìm thấy việc làm phù hợp
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Vui lòng thử thay đổi hoặc xóa bớt bộ lọc.
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={handleClearFilters}
                        startIcon={<ClearAllIcon />}
                        sx={{ borderRadius: "8px" }}
                      >
                        Xóa tất cả bộ lọc
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Phân trang */}
              {pageCount > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
                  <Pagination
                    count={pageCount}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    size="large" // Larger pagination
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "8px",
                        mx: 0.5, // Add some horizontal margin
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export default JobListingsPage

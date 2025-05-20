// src/pages/JobListingsPage.jsx
"use client"

import { useState, useEffect, useCallback } from "react"
import apiService from "../services/api"
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
import Checkbox from "@mui/material/Checkbox"
import InputAdornment from "@mui/material/InputAdornment"
import Container from "@mui/material/Container"
import Alert from "@mui/material/Alert"
import OutlinedInput from "@mui/material/OutlinedInput"
import Chip from "@mui/material/Chip"
import ListItemText from "@mui/material/ListItemText"
import { useTheme, alpha } from "@mui/material/styles"
import Stack from "@mui/material/Stack"; // Thêm Stack


// Icons
import SearchIcon from "@mui/icons-material/Search"
import ClearAllOutlinedIcon from "@mui/icons-material/ClearAllOutlined"
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined"
import SortIcon from "@mui/icons-material/Sort"
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import StairsOutlinedIcon from '@mui/icons-material/StairsOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';


// Mock data for filter options
const mockJobTypes = ["Full-time", "Part-time", "Hợp đồng", "Thực tập", "Remote", "Freelance"]
const mockLocations = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Remote", "Toàn quốc", "Khác"]
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

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
      width: 280,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
  },
}

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function JobListingsPage() {
  const navigate = useNavigate()
  const locationHook = useLocation();
  const query = useQuery()
  const theme = useTheme()

  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    keyword: query.get("keyword") || "",
    locations: query.getAll("location") || [],
    jobTypes: query.getAll("jobType") || [],
    experienceLevels: query.getAll("experience") || [],
    salaryRanges: query.getAll("salary") || [],
    category: query.get("category") || "",
  })
  const [sortBy, setSortBy] = useState(query.get("sort") || "-createdAt")
  const [currentPage, setCurrentPage] = useState(parseInt(query.get("page") || "1", 10))
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobsFound, setTotalJobsFound] = useState(0); // State mới để lưu tổng số job từ API
  const jobsPerPage = 12

  const loadJobsFromApi = useCallback(async (pageToLoad, currentFilters, currentSortBy) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageToLoad,
        limit: jobsPerPage,
        sort: currentSortBy,
        keyword: currentFilters.keyword || undefined,
        location: currentFilters.locations.length > 0 ? currentFilters.locations.join(',') : undefined,
        type: currentFilters.jobTypes.length > 0 ? currentFilters.jobTypes.join(',') : undefined,
        experienceLevel: currentFilters.experienceLevels.length > 0 ? currentFilters.experienceLevels.join(',') : undefined,
        salary: currentFilters.salaryRanges.length > 0 ? currentFilters.salaryRanges.join(',') : undefined,
        industry: currentFilters.category || undefined,
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      console.log("[JobListingsPage] Fetching jobs with params:", params);
      const response = await apiService.getPublicJobs(params);
      
      console.log("[JobListingsPage] RAW API Response:", JSON.stringify(response, null, 2));

      if (response && response.data && Array.isArray(response.data.data)) {
        setAllJobs(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalJobsFound(response.data.totalJobs || response.data.data.length); // Lấy tổng số job từ API
      } else if (response && Array.isArray(response.data)) {
        setAllJobs(response.data);
        const calculatedTotalPages = Math.ceil(response.data.length / jobsPerPage);
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        setCurrentPage(pageToLoad);
        setTotalJobsFound(response.data.length);
      }
      else {
        console.warn("[JobListingsPage] No jobs data or invalid format in API response.", response.data);
        setAllJobs([]);
        setTotalPages(1);
        setTotalJobsFound(0);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách việc làm.";
      console.error("[JobListingsPage] Error loading jobs:", err);
      setError(errorMsg);
      setAllJobs([]);
      setTotalPages(1);
      setTotalJobsFound(0);
    } finally {
      setLoading(false);
    }
  }, [jobsPerPage]);

  useEffect(() => {
    const paramsFromUrl = new URLSearchParams(locationHook.search);
    const pageFromUrl = parseInt(paramsFromUrl.get('page') || '1', 10);
    const sortFromUrl = paramsFromUrl.get("sort") || "-createdAt";
    const currentFiltersFromUrl = {
        keyword: paramsFromUrl.get("keyword") || "",
        locations: paramsFromUrl.getAll("location") || [],
        jobTypes: paramsFromUrl.getAll("jobType") || [],
        experienceLevels: paramsFromUrl.getAll("experience") || [],
        salaryRanges: paramsFromUrl.getAll("salary") || [],
        category: paramsFromUrl.get("category") || "",
    };

    setFilters(currentFiltersFromUrl);
    setSortBy(sortFromUrl);
    loadJobsFromApi(pageFromUrl, currentFiltersFromUrl, sortFromUrl);
  }, [locationHook.search, loadJobsFromApi]);


  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const applyAllFilters = () => {
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.category) params.set("category", filters.category);
    filters.locations.forEach((loc) => params.append("location", loc));
    filters.jobTypes.forEach((type) => params.append("jobType", type));
    filters.experienceLevels.forEach((exp) => params.append("experience", exp));
    filters.salaryRanges.forEach((sal) => params.append("salary", sal));
    if (sortBy) params.set("sort", sortBy);
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: "", locations: [], jobTypes: [], experienceLevels: [], salaryRanges: [], category: "" });
    setSortBy("-createdAt");
    navigate(`?page=1&sort=-createdAt`);
  };

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    const params = new URLSearchParams(locationHook.search);
    params.set("sort", newSortBy);
    params.set("page", "1");
    navigate(`?${params.toString()}`);
  };

  const handlePageChange = (event, value) => {
    const params = new URLSearchParams(locationHook.search);
    params.set("page", value.toString());
    navigate(`?${params.toString()}`);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const currentJobs = allJobs;
  const pageCount = totalPages;

  return (
    <Container maxWidth="xl" sx={{ mt: {xs:2, md:4}, mb: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight="700" color="primary.dark" gutterBottom
          sx={{fontSize: {xs: '2rem', sm: '2.5rem', md: '3rem'}}}
        >
          Khám phá Cơ hội Việc làm
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{fontSize: {xs: '0.95rem', md: '1.15rem'}, maxWidth: '700px', mx:'auto'}}>
          Tìm kiếm và ứng tuyển hàng ngàn vị trí từ các công ty hàng đầu trên cả nước.
        </Typography>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: {xs: 2, sm: 2.5, md:3}, mb: 4, borderRadius: "12px",
          boxShadow: theme.shadows[2],
          bgcolor: 'background.paper'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{mb:2.5}}>
            <FilterListIcon color="primary" sx={{fontSize: '1.7rem'}} />
            <Typography variant="h6" fontWeight={600} color="text.primary">Bộ lọc tìm kiếm</Typography>
        </Stack>
        {/* SỬA ĐỔI GRID CHO BỘ LỌC */}
        <Grid container spacing={2} alignItems="center"> {/* Giảm spacing, alignItems center */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth label="Từ khóa (Chức danh, Công ty...)" name="keyword"
              value={filters.keyword} onChange={handleFilterChange} size="small" variant="outlined"
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>),
                sx: { borderRadius: "8px", bgcolor: alpha(theme.palette.grey[50], 0.7) }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.2} width={'10%'}> {/* Tăng lg cho Địa điểm */}
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="location-filter-label-joblist">Địa điểm</InputLabel>
              <Select
                labelId="location-filter-label-joblist" multiple value={filters.locations}
                onChange={handleMultiSelectChange} name="locations"
                input={<OutlinedInput label="Địa điểm" sx={{borderRadius: "8px", bgcolor: alpha(theme.palette.grey[50], 0.7)}}/>}
                renderValue={(selected) => (<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{selected.map((value) => (<Chip key={value} label={value} size="small" sx={{borderRadius: '6px', bgcolor: alpha(theme.palette.primary.light,0.3)}}/>))}</Box>)}
                MenuProps={MenuProps}
              >
                {mockLocations.map((location) => (
                  <MenuItem key={location} value={location} sx={{py:1.2}}>
                    <Checkbox checked={filters.locations.indexOf(location) > -1} size="small"/>
                    <ListItemText primary={location} primaryTypographyProps={{fontSize: '0.9rem'}}/>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.2} width={'10%'}> {/* Tăng lg cho Loại hình */}
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="jobtype-filter-label-joblist">Loại hình</InputLabel>
              <Select
                labelId="jobtype-filter-label-joblist" multiple value={filters.jobTypes}
                onChange={handleMultiSelectChange} name="jobTypes"
                input={<OutlinedInput label="Loại hình" sx={{borderRadius: "8px", bgcolor: alpha(theme.palette.grey[50], 0.7)}}/>}
                renderValue={(selected) => (<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{selected.map((value) => (<Chip key={value} label={value} size="small" sx={{borderRadius: '6px', bgcolor: alpha(theme.palette.primary.light,0.3)}}/>))}</Box>)}
                MenuProps={MenuProps}
              >
                {mockJobTypes.map((type) => (
                  <MenuItem key={type} value={type} sx={{py:1.2}}>
                    <Checkbox checked={filters.jobTypes.indexOf(type) > -1} size="small"/>
                    <ListItemText primary={type} primaryTypographyProps={{fontSize: '0.9rem'}}/>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.3} width={'10%'}> {/* Tăng lg cho Kinh nghiệm */}
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="experience-filter-label-joblist">Kinh nghiệm</InputLabel>
              <Select
                labelId="experience-filter-label-joblist" multiple value={filters.experienceLevels}
                onChange={handleMultiSelectChange} name="experienceLevels"
                input={<OutlinedInput label="Kinh nghiệm" sx={{borderRadius: "8px", bgcolor: alpha(theme.palette.grey[50], 0.7)}}/>}
                renderValue={(selected) => (<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{selected.map((value) => (<Chip key={value} label={value} size="small" sx={{borderRadius: '6px', bgcolor: alpha(theme.palette.primary.light,0.3)}}/>))}</Box>)}
                MenuProps={MenuProps}
              >
                {mockExperiences.map((level) => (
                  <MenuItem key={level} value={level} sx={{py:1.2}}>
                    <Checkbox checked={filters.experienceLevels.indexOf(level) > -1} size="small"/>
                    <ListItemText primary={level} primaryTypographyProps={{fontSize: '0.9rem'}}/>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.3} width={'10%'}> {/* Tăng lg cho Mức lương */}
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel id="salary-filter-label-joblist">Mức lương</InputLabel>
              <Select
                labelId="salary-filter-label-joblist" multiple value={filters.salaryRanges}
                onChange={handleMultiSelectChange} name="salaryRanges"
                input={<OutlinedInput label="Mức lương" sx={{borderRadius: "8px", bgcolor: alpha(theme.palette.grey[50], 0.7)}}/>}
                renderValue={(selected) => (<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{selected.map((value) => (<Chip key={value} label={mockSalaryRanges.find(r=>r.value===value)?.label || value} size="small" sx={{borderRadius: '6px', bgcolor: alpha(theme.palette.primary.light,0.3)}}/>))}</Box>)}
                MenuProps={MenuProps}
              >
                {mockSalaryRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value} sx={{py:1.2}}>
                    <Checkbox checked={filters.salaryRanges.indexOf(range.value) > -1} size="small"/>
                    <ListItemText primary={range.label} primaryTypographyProps={{fontSize: '0.9rem'}}/>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Các nút Lọc và Xóa lọc */}
          <Grid item xs={12} sm={12} md={12} lg sx={{ display: 'flex', gap: 1, justifyContent: {xs: 'stretch', lg: 'flex-end'}, alignItems: 'center' }}>
            <Button onClick={applyAllFilters} variant="contained" size="medium" sx={{ height: "40px", borderRadius: "8px", flexGrow: {xs:1, lg:0} }} startIcon={<SearchIcon />}>
              Lọc
            </Button>
            <Button onClick={handleClearFilters} variant="outlined" color="inherit" size="medium" sx={{ height: "40px", borderRadius: "8px", flexGrow: {xs:1, lg:0} }}>
              Xóa lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: "100%", p: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "12px", bgcolor: alpha(theme.palette.grey[50], 0.9), boxShadow: theme.shadows[1] }}>
        <Typography variant="subtitle1" fontWeight="500" color="text.secondary">
          {loading ? "Đang tìm kiếm việc làm..." : `Tìm thấy ${totalJobsFound} việc làm ${filters.keyword ? `cho "${filters.keyword}"` : '' }`}
        </Typography>
        <FormControl size="small" variant="outlined" sx={{ minWidth: 180 }}>
          <InputLabel id="sort-by-label" sx={{fontSize: '0.9rem'}}>Sắp xếp theo</InputLabel>
          <Select
            labelId="sort-by-label" value={sortBy} label="Sắp xếp theo" onChange={handleSortChange}
            startAdornment={<InputAdornment position="start"><SortIcon sx={{ color: "text.secondary", mr:0.5 }} /></InputAdornment>}
            sx={{ borderRadius: "8px", bgcolor: 'background.paper', fontSize: '0.9rem', '.MuiSelect-select': {py: 1.2, pr:1} }}
          >
            <MenuItem value="-createdAt">Mới nhất</MenuItem>
            <MenuItem value="createdAt">Cũ nhất</MenuItem>
            <MenuItem value="title">Tên (A-Z)</MenuItem>
            <MenuItem value="-title">Tên (Z-A)</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><LoadingSpinner /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2, borderRadius: "10px", p: "16px 20px", boxShadow: theme.shadows[2] }}>{error}</Alert>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={job._id || job.id}>
                  <Box sx={{ height: "100%", transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out", "&:hover": { transform: "translateY(-5px)", boxShadow: theme.shadows[6] }, borderRadius: '16px', overflow:'hidden' }}>
                    <JobCard job={job} />
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12} sx={{ textAlign: "center", py: 8 }}>
                <Paper sx={{p: { xs: 3, sm: 5 }, borderRadius: "16px", bgcolor: alpha(theme.palette.background.default, 0.7), maxWidth: "550px", mx: "auto", boxShadow: theme.shadows[1] }}>
                  <FindInPageOutlinedIcon sx={{ fontSize: 80, color: "primary.light", mb: 3, opacity: 0.7 }}/>
                  <Typography variant="h5" gutterBottom fontWeight="600" color="text.primary">Không tìm thấy việc làm phù hợp</Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>Vui lòng thử thay đổi từ khóa hoặc xóa bớt bộ lọc để có kết quả tốt hơn.</Typography>
                  <Button variant="contained" onClick={handleClearFilters} startIcon={<ClearAllOutlinedIcon />} sx={{ borderRadius: "10px", py: 1.2, px: 3, boxShadow: theme.shadows[2] }}>
                    Xóa tất cả bộ lọc
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 3 }}>
              <Pagination
                count={pageCount} page={currentPage} onChange={handlePageChange} color="primary"
                showFirstButton showLastButton size="large"
                sx={{
                  "& .MuiPaginationItem-root": { borderRadius: "8px", mx: 0.5, minWidth: "40px", height: "40px", fontWeight: 500 },
                  "& .Mui-selected": { boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}` },
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  )
}

export default JobListingsPage;

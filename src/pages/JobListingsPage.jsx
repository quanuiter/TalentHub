import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper'; // Để tạo khung cho bộ lọc
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import JobCard from '../components/jobs/JobCard';
import { fetchJobs } from '../data/mockJobs';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '@mui/material/Pagination'; // Thêm Pagination

function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    type: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6; // Số lượng job mỗi trang

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      const fetchedJobs = await fetchJobs(); // Lấy tất cả job
      // Lọc dữ liệu dựa trên filters (Logic lọc đơn giản)
      const filtered = fetchedJobs.filter(job =>
         (filters.keyword === '' || job.title.toLowerCase().includes(filters.keyword.toLowerCase()) || job.companyName.toLowerCase().includes(filters.keyword.toLowerCase())) &&
         (filters.location === '' || job.location === filters.location) &&
         (filters.type === '' || job.type === filters.type)
      );
      setJobs(filtered);
      setLoading(false);
      setCurrentPage(1); // Reset về trang 1 khi lọc
    };
    loadJobs();
  }, [filters]); // Chạy lại khi filters thay đổi

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

   // Tính toán jobs cho trang hiện tại
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const pageCount = Math.ceil(jobs.length / jobsPerPage);


  return (
    <Grid container spacing={3}>
      {/* Filters Sidebar */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}> {/* p: padding */}
          <Typography variant="h6" gutterBottom>Bộ lọc</Typography>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Từ khóa (Chức danh, công ty)"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              size="small"
            />
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Địa điểm</InputLabel>
            <Select
              label="Địa điểm"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>Tất cả</em></MenuItem>
              <MenuItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</MenuItem>
              <MenuItem value="Hà Nội">Hà Nội</MenuItem>
              <MenuItem value="Đà Nẵng">Đà Nẵng</MenuItem>
              {/* Thêm địa điểm khác */}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size="small">
             <InputLabel>Loại hình</InputLabel>
            <Select
              label="Loại hình"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <MenuItem value=""><em>Tất cả</em></MenuItem>
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Freelance">Freelance</MenuItem>
              {/* Thêm loại hình khác */}
            </Select>
          </FormControl>
           {/* Nút lọc có thể không cần nếu lọc tự động khi thay đổi */}
           {/* <Button variant="contained" fullWidth sx={{ mt: 2 }}>Lọc</Button> */}
        </Paper>
      </Grid>

      {/* Job Listings Area */}
      <Grid item xs={12} md={9}>
        <Typography variant="h5" gutterBottom>
          {jobs.length} việc làm được tìm thấy
        </Typography>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Box>
            <Grid container spacing={2}>
              {currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <Grid item xs={12} sm={6} lg={4} key={job.id}> {/* Điều chỉnh layout cột */}
                    <JobCard job={job} />
                  </Grid>
                ))
              ) : (
                 <Typography sx={{ml:2}}>Không tìm thấy việc làm phù hợp.</Typography>
              )}
            </Grid>
             {/* Pagination */}
             {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
             )}
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

export default JobListingsPage;
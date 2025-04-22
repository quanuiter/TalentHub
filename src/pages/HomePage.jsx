import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // <--- THÊM DÒNG NÀY
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; // Cho SearchBar đơn giản
import CompanyCard from '../components/companies/companyCard';
import { fetchCompanies } from '../data/mockCompanies'; // Lấy dữ liệu giả
import LoadingSpinner from '../components/ui/LoadingSpinner'; // Tạo component này

function HomePage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Ví dụ state search

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      const fetchedCompanies = await fetchCompanies();
      // Chỉ lấy vài job nổi bật cho trang chủ
      setCompanies(fetchedCompanies.slice(0, 6)); // Giả sử lấy 5 job nổi bật
      setLoading(false);
    };
    loadCompanies();
  }, []);

  const handleSearch = (event) => {
     // Xử lý tìm kiếm thực tế sẽ phức tạp hơn, có thể điều hướng
     console.log("Searching for:", searchTerm);
     // navigate(`/jobs?q=${searchTerm}`); // Ví dụ điều hướng
  };

  return (
    <Box>
      {/* Hero Section with Search */}
      <Box sx={{ textAlign: 'center', my: 4, py: 4, backgroundColor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tìm kiếm cơ hội việc làm mơ ước
        </Typography>
        <Typography variant="h6" component="p" color="inherit" sx={{ mb: 3 }}>
          Hàng ngàn việc làm đang chờ bạn tại TalentHub.
        </Typography>
        <Box component="form" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, px: 2 }} onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <TextField
            variant="outlined"
            placeholder="Nhập chức danh, công ty..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: 'white', borderRadius: 1, width: '50%' }}
          />
          {/* Thêm các bộ lọc khác nếu cần (Địa điểm...) */}
          <Button variant="contained" color="secondary" type="submit">
            Tìm kiếm
          </Button>
        </Box>
      </Box>

      {/* Featured companies Section */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Công ty nổi bật
      </Typography>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Grid container spacing={2}> {/* spacing={2} tạo khoảng cách giữa các card */}
        {companies.length > 0 ? (
          companies.map((company) => (
            // !!! QUAN TRỌNG: Mỗi CompaniesCard phải được bọc trong Grid item !!!
            <Grid item xs={12} sm={6} md={4} key={company.id}>
              <CompanyCard company={company} />
            </Grid>
          ))
        ) : (
           <Typography sx={{ml:2}}>Không có công ty làm nổi bật.</Typography> // Thêm thông báo nếu không có job
        )}
      </Grid>
      )}
       <Box sx={{ textAlign: 'center', my: 4 }}>
          <Button variant="outlined" component={RouterLink} to="/companies">
            Xem tất cả công ty
          </Button>
      </Box>
    </Box>
  );
}

export default HomePage;
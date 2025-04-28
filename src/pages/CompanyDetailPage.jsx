// src/pages/CompanyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { fetchCompanyById } from '../data/mockCompanies';
import { fetchJobs } from '../data/mockJobs';
// Bỏ import JobCard vì sẽ dùng cách hiển thị gọn hơn bên phải
// import JobCard from '../components/jobs/JobCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid'; // Sử dụng Grid để chia cột
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List'; // Dùng List cho danh sách jobs
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar'; // Cho logo nhỏ cạnh job
import Tooltip from '@mui/material/Tooltip'; // Thêm Tooltip

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import PeopleIcon from '@mui/icons-material/People'; // Bỏ nếu mock data ko có size
// import CategoryIcon from '@mui/icons-material/Category'; // Bỏ nếu mock data ko có industry
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code'; // Icon cho tech stack
import LaunchIcon from '@mui/icons-material/Launch'; // Icon mở link job


function CompanyDetailPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      setLoading(true);
      setError(null);
      setCompany(null);
      setCompanyJobs([]);

      try {
        const companyDetails = await fetchCompanyById(companyId);

        if (companyDetails) {
          setCompany(companyDetails);
          const allJobs = await fetchJobs();
          // Lọc job theo tên công ty VÀ chỉ lấy job không phải 'Closed' (nếu mock có status)
          const jobsOfCompany = allJobs.filter(
            job => job.companyName === companyDetails.name && job.status !== 'Closed' // Giả sử có status
          );
           // Sắp xếp job mới nhất lên đầu (nếu có datePosted)
           jobsOfCompany.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
          setCompanyJobs(jobsOfCompany);

        } else {
          setError(`Không tìm thấy công ty với ID: ${companyId}`);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang công ty:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyId]);

  // --- Render Logic ---
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!company) {
    // Trường hợp không loading, không lỗi nhưng không có company
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Không có thông tin công ty.</Typography>
      </Container>
    )
  }

  // --- Render UI với layout 2 cột ---
  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Sử dụng Grid container bao ngoài */}
      <Grid container spacing={4} alignItems="flex-start"> {/* alignItems="flex-start" để các cột không bị kéo dãn bằng nhau */}

        {/* === CỘT TRÁI: THÔNG TIN CHI TIẾT CÔNG TY === */}
        <Grid item xs={12} md={8} sx={{width: '60%'}}> {/* Chiếm 8/12 cột trên màn hình md trở lên */}
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header: Logo và Tên */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap:'wrap' }}>
               <Avatar
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  variant="rounded"
                  sx={{ width: 80, height: 80, objectFit: 'contain', bgcolor: '#eee' }}
                >
                   {!company.logoUrl && <BusinessIcon sx={{ fontSize: 40 }}/>}
                </Avatar>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {company.name}
                    </Typography>
                    {/* Website */}
                    {company.website && (
                      <Link href={company.website.startsWith('http') ? company.website : `http://${company.website}`} target="_blank" rel="noopener noreferrer" variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LinkIcon fontSize="small"/> {company.website}
                      </Link>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Các thông tin khác */}
            <Stack spacing={1.5}> {/* Dùng Stack để tạo khoảng cách đều */}
                {/* Địa chỉ */}
                {company.locations && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Địa chỉ"><LocationOnIcon color="action" /></Tooltip>
                        <Typography variant="body1">{company.locations}</Typography>
                    </Box>
                 )}
                 {/* Mô tả (Placeholder nếu mock data ko có) */}
                 <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <Tooltip title="Giới thiệu">
                            <DescriptionIcon color="action" sx={{ mt: 0.5 }} />
                        </Tooltip>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {/* Hiển thị description từ data, nếu không có thì hiển thị thông báo */}
                            {company.description || 'Chưa có thông tin mô tả về công ty này.'}
                        </Typography>
                 </Box>

                 {/* Tech Stack */}
                  {company.techStack && company.techStack.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <Tooltip title="Công nghệ sử dụng"><CodeIcon color="action" sx={{mt: 0.5}} /></Tooltip>
                        <Box>
                             <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>Công nghệ:</Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {company.techStack.map(tech => <Chip key={tech} label={tech} size="small" variant="outlined" color="primary"/>)}
                            </Stack>
                        </Box>
                    </Box>
                 )}

                 {/* Thêm các mục khác nếu có trong mock data (Industry, Size...) */}
            </Stack>
          </Paper>
        </Grid>

        {/* === CỘT PHẢI: DANH SÁCH VIỆC LÀM === */}
        <Grid item xs={12} md={8} sx={{width: '35%'}}> {/* Chiếm 4/12 cột trên màn hình md trở lên */}
          {/* Thêm position: 'sticky' và top để cố định khi cuộn */}
          <Paper elevation={2} sx={{ width: '100%',p: 2, position: 'right', top: 80 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="primary" /> Việc làm đang tuyển ({companyJobs.length})
            </Typography>
            <Divider sx={{mb: 1}}/>

            {companyJobs.length > 0 ? (
              // Sử dụng List để hiển thị gọn gàng
              <List dense sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}> {/* Giới hạn chiều cao và cho phép cuộn */}
                {companyJobs.map((job) => (
                  <ListItem
                    key={job.id}
                    // secondaryAction={ // Có thể thêm ngày đăng hoặc nút lưu nhanh
                    //   <Typography variant="caption" color="text.secondary">
                    //      {new Date(job.datePosted).toLocaleDateString('vi-VN')}
                    //   </Typography>
                    // }
                    divider // Thêm đường kẻ giữa các item
                    button // Cho biết có thể click
                    component={RouterLink} // Link đến trang chi tiết job
                    to={`/jobs/${job.id}`}
                    sx={{
                        alignItems:'flex-start', // Căn trên cho avatar và text
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 45, mt: 0.5 /* Căn avatar với dòng đầu */}}>
                      <Avatar src={company.logoUrl} alt={company.name} sx={{ width: 30, height: 30 }}>
                         <BusinessIcon fontSize="small"/>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {job.title}
                        </Typography>
                      }
                      secondary={
                        <>
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                {job.location}
                            </Typography>
                             {job.salary && job.salary.toLowerCase() !== 'thương lượng' && (
                                 <Typography component="span" variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                                     {job.salary}
                                 </Typography>
                             )}
                        </>
                      }
                    />
                    {/* Icon nhỏ báo hiệu link ngoài */}
                     <LaunchIcon fontSize="inherit" color="action" sx={{ alignSelf: 'center', ml: 1, opacity: 0.6 }}/>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary', textAlign:'center' }}>
                Hiện tại chưa có tin tuyển dụng.
              </Typography>
            )}
          </Paper>
        </Grid>

      </Grid> {/* Kết thúc Grid container chính */}
    </Container>
  );
}

export default CompanyDetailPage;
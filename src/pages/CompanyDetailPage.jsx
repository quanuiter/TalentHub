// src/pages/CompanyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiService from '../services/api'; // <<< SỬ DỤNG apiService
import LoadingSpinner from '../components/ui/LoadingSpinner';

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Tooltip from '@mui/material/Tooltip';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import LaunchIcon from '@mui/icons-material/Launch';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';


function CompanyDetailPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyId) {
        setError("Company ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setCompany(null);
      setCompanyJobs([]);

      try {
        // Gọi API để lấy chi tiết công ty
        const companyDetailsResponse = await apiService.getCompanyDetailsApi(companyId);
        
        if (companyDetailsResponse && companyDetailsResponse.data) {
          setCompany(companyDetailsResponse.data);

          // Sau khi có chi tiết công ty, gọi API để lấy jobs của công ty đó
          try {
            const jobsResponse = await apiService.getJobsByCompanyApi(companyId);
            if (jobsResponse && Array.isArray(jobsResponse.data)) {
              setCompanyJobs(jobsResponse.data);
            } else {
              setCompanyJobs([]); // Không có job hoặc lỗi nhẹ, không set error chính
              console.warn("No jobs found or invalid job data for company:", companyId);
            }
          } catch (jobsError) {
            console.error("Lỗi khi tải danh sách việc làm của công ty:", jobsError);
            // Có thể không set error chính ở đây nếu muốn trang vẫn hiển thị thông tin công ty
            setCompanyJobs([]);
          }

        } else {
          setError(`Không tìm thấy công ty với ID: ${companyId}`);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang công ty:", err);
        setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải dữ liệu công ty.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [companyId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
         <Button component={RouterLink} to="/companies" sx={{ mt: 2 }}>
          Quay lại danh sách công ty
        </Button>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Không có thông tin công ty.</Typography>
         <Button component={RouterLink} to="/companies" sx={{ mt: 2 }}>
          Quay lại danh sách công ty
        </Button>
      </Container>
    );
  }

  // Dữ liệu company từ API có thể có _id, cần đảm bảo các component con (nếu có) dùng đúng key
  const currentCompany = { ...company, id: company._id || company.id };


  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Grid container spacing={4} alignItems="flex-start">
        {/* === CỘT TRÁI: THÔNG TIN CHI TIẾT CÔNG TY === */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap:'wrap' }}>
               <Avatar
                  src={currentCompany.logoUrl} // Sử dụng currentCompany
                  alt={`${currentCompany.name} logo`}
                  variant="rounded"
                  sx={{ width: 80, height: 80, objectFit: 'contain', bgcolor: '#eee' }}
                >
                   {!currentCompany.logoUrl && <BusinessIcon sx={{ fontSize: 40 }}/>}
                </Avatar>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {currentCompany.name}
                    </Typography>
                    {currentCompany.website && (
                      <Link 
                        href={currentCompany.website.startsWith('http') ? currentCompany.website : `http://${currentCompany.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <LinkIcon fontSize="small"/> {currentCompany.website}
                      </Link>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}> {/* Tăng khoảng cách giữa các mục thông tin */}
                {currentCompany.address && ( // Backend trả về address, hiển thị nó như locations
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Địa chỉ"><LocationOnIcon color="action" /></Tooltip>
                        <Typography variant="body1">{currentCompany.address}</Typography>
                    </Box>
                 )}
                 {currentCompany.industry && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Ngành nghề"><CategoryIcon color="action" /></Tooltip>
                        <Typography variant="body1">{currentCompany.industry}</Typography>
                    </Box>
                 )}
                 {currentCompany.size && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Quy mô"><PeopleIcon color="action" /></Tooltip>
                        <Typography variant="body1">{currentCompany.size}</Typography>
                    </Box>
                 )}
                 <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                    <Tooltip title="Giới thiệu">
                        <DescriptionIcon color="action" sx={{ mt: 0.5 }} />
                    </Tooltip>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {currentCompany.description || 'Chưa có thông tin mô tả về công ty này.'}
                    </Typography>
                 </Box>

                 {/* Giả sử techStack là một mảng string từ backend hoặc được xử lý ở backend */}
                 {/* Nếu backend không trả về 'techStack', bạn cần xử lý nó ở controller như ví dụ trước */}
                 {Array.isArray(currentCompany.techStack) && currentCompany.techStack.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <Tooltip title="Công nghệ sử dụng"><CodeIcon color="action" sx={{mt: 0.5}} /></Tooltip>
                        <Box>
                             <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5 }}>Công nghệ nổi bật:</Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {currentCompany.techStack.map(tech => <Chip key={tech} label={tech} size="small" variant="outlined" color="primary"/>)}
                            </Stack>
                        </Box>
                    </Box>
                 )}
            </Stack>
          </Paper>
        </Grid>

        {/* === CỘT PHẢI: DANH SÁCH VIỆC LÀM === */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: 80 }}> {/* Giữ sticky top */}
            <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon color="primary" /> Việc làm đang tuyển ({companyJobs.length})
            </Typography>
            <Divider sx={{mb: 1}}/>

            {companyJobs.length > 0 ? (
              <List dense sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}> {/* Điều chỉnh maxHeight */}
                {companyJobs.map((job) => (
                  <ListItem
                    key={job._id || job.id} // Sử dụng _id từ MongoDB
                    button
                    component={RouterLink}
                    to={`/jobs/${job._id || job.id}`} // Link đến chi tiết job
                    sx={{
                        alignItems:'flex-start',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderBottom: '1px solid #eee', // Thêm đường kẻ mỏng
                        '&:last-child': { borderBottom: 0}
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 45, mt: 0.5 }}>
                      <Avatar src={currentCompany.logoUrl} alt={currentCompany.name} sx={{ width: 30, height: 30 }}>
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
                                <LocationOnIcon sx={{fontSize: '0.875rem', verticalAlign: 'middle', mr: 0.2}}/> {job.location}
                            </Typography>
                             {job.salary && (
                                 <Typography component="span" variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                                     {job.salary}
                                 </Typography>
                             )}
                        </>
                      }
                    />
                     <LaunchIcon fontSize="inherit" color="action" sx={{ alignSelf: 'center', ml: 1, opacity: 0.6 }}/>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary', textAlign:'center' }}>
                Hiện tại công ty chưa có tin tuyển dụng nào.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CompanyDetailPage;
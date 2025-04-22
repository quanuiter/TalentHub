// src/components/companies/CompanyCard.jsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Để link đến trang công ty/jobs của công ty
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link'; // MUI Link
import Avatar from '@mui/material/Avatar'; // Dùng Avatar để hiển thị logo tròn/vuông đẹp hơn
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Icon mũi tên
import Divider from '@mui/material/Divider'; // Để tạo đường phân cách giữa các phần trong card

function CompanyCard({ company }) {
  if (!company) return null;

  // Link giả định đến trang chi tiết công ty hoặc danh sách jobs của công ty
  const companyLink = `/companies/${company.id}/jobs`; // Hoặc /companies/${company.id}

  return (
    // height: '100%' RẤT QUAN TRỌNG để các card bằng chiều cao trong Grid
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.5, textAlign: 'center' }}>
      {/* Phần Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1.5, minHeight: 80 }}>
         {/* Dùng Avatar để dễ tùy chỉnh shape, size */}
        <Avatar
            src={company.logoUrl}
            alt={`${company.name} logo`}
            variant="rounded" // hoặc "square", "circular"
            sx={{ width: 70, height: 70, objectFit: 'contain', bgcolor: '#f5f5f5' }} // Thêm bgcolor nền nếu ảnh trong suốt
        />
         {/* Hoặc dùng img nếu muốn đơn giản:
         <img src={company.logoUrl} alt={`${company.name} logo`} style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
         */}
      </Box>

      {/* Phần Content chính */}
      {/* flexGrow: 1 giúp đẩy phần job count xuống dưới */}
      <CardContent sx={{ flexGrow: 1, p: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ minHeight: '3.5em' /* Giữ chỗ cho tên dài */ }}>
          {company.name}
        </Typography>

        {/* Tech Stack */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 1.5, minHeight: '3em' /* Giữ chỗ */ }}>
          {company.techStack.slice(0, 5).map((tech) => ( // Giới hạn 5 tech hiển thị
            <Chip label={tech} key={tech} size="small" variant="outlined" />
          ))}
          {company.techStack.length > 5 && <Chip label="..." size="small" variant="outlined" />}
        </Box>

        {/* Locations */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: '2.5em' /* Giữ chỗ */ }}>
          {company.locations}
        </Typography>
      </CardContent>

      {/* Phần Job Count */}
      {/* mt: 'auto' cũng giúp đẩy xuống dưới cùng của flex container */}
      <Box sx={{ mt: 'auto', p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <Link
          component={RouterLink}
          to={companyLink}
          underline="hover"
          variant="body2"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', fontWeight: 'medium' }}
        >
           {company.jobCount} Jobs <ArrowForwardIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
        </Link>
      </Box>
    </Card>
  );
}

export default CompanyCard;
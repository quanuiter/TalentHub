// src/components/jobs/JobCard.jsx
// (Đảm bảo file này tồn tại và đúng nội dung)

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PropTypes from 'prop-types'; // Thêm PropTypes

function JobCard({ job, showSaveButton = true, onUnsave }) { // Thêm props showSaveButton và onUnsave
  if (!job) return null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', mb: 2 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ '& a': { textDecoration: 'none', color: 'inherit' }, minHeight: '3em' /* Giữ chỗ title */ }}>
          <RouterLink to={`/jobs/${job.id}`}>{job.title}</RouterLink>
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {job.companyName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <LocationOnIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="body2">
            {job.location}
          </Typography>
        </Box>
         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <AttachMoneyIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="body2">
            {job.salary || 'Thương lượng'}
          </Typography>
        </Box>
         <Typography variant="body2" color="text.secondary">
           Loại hình: {job.type}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px:2, pb:2, mt: 'auto' }}>
         {/* Nút Lưu/Bỏ lưu (tùy chỉnh dựa trên onUnsave) */}
         {onUnsave ? ( // Nếu đang ở trang Saved Jobs, hiển thị nút Bỏ lưu
             <Button size="small" variant="outlined" color="error" onClick={() => onUnsave(job.id)}>
                 Bỏ lưu
             </Button>
         ) : showSaveButton && ( // Nếu ở trang khác và cho phép lưu, hiển thị nút Lưu
             <Button size="small" variant="outlined">
                 Lưu tin
             </Button>
         )}
        <Button size="small" variant="contained" component={RouterLink} to={`/jobs/${job.id}`}>
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
}

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  showSaveButton: PropTypes.bool, // Prop để kiểm soát nút Lưu
  onUnsave: PropTypes.func, // Hàm callback khi bấm Bỏ lưu
};


export default JobCard;
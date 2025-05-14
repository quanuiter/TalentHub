// src/components/employer/ViewProfileDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

// Import Icons
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link';
import CakeIcon from '@mui/icons-material/Cake'; // Ngày sinh
import SchoolIcon from '@mui/icons-material/School'; // Học vấn
import WorkIcon from '@mui/icons-material/Work';   // Kinh nghiệm

function ViewProfileDialog({ open, onClose, candidateData, loading }) {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper"> {/* scroll="paper" cho phép nội dung dài */}
      <DialogTitle>
        Hồ sơ ứng viên: {loading ? 'Đang tải...' : (candidateData?.fullName || 'Không rõ')}
      </DialogTitle>
      <DialogContent dividers> {/* dividers thêm đường kẻ phân cách */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : !candidateData ? (
          <Typography color="error" sx={{textAlign: 'center', mt: 2}}>Không tải được dữ liệu hồ sơ.</Typography>
        ) : (
          // Hiển thị chi tiết khi có data
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Thông tin liên hệ */}
            <Box>
              <Typography variant="h6" gutterBottom>Thông tin liên hệ</Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px' }}><EmailIcon color="action" fontSize="small"/> <Typography variant="body2">{candidateData.email}</Typography></Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px' }}><PhoneIcon color="action" fontSize="small"/> <Typography variant="body2">{candidateData.phone || 'Chưa cập nhật'}</Typography></Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px' }}><LocationOnIcon color="action" fontSize="small"/> <Typography variant="body2">{candidateData.address || 'Chưa cập nhật'}</Typography></Box>
                 {candidateData.dateOfBirth && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px' }}><CakeIcon  color="action" fontSize="small"/> {new Date(candidateData.dateOfBirth).toLocaleDateString('vi-VN')}</Box>}
                 {candidateData.linkedin && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px' }}><LinkedInIcon color="action" fontSize="small"/> <Link href={candidateData.linkedin} target="_blank" rel="noopener noreferrer" variant="body2">{candidateData.linkedin}</Link></Box>}
                 {candidateData.portfolio && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '250px' }}><LinkIcon color="action" fontSize="small"/> <Link href={candidateData.portfolio} target="_blank" rel="noopener noreferrer" variant="body2">{candidateData.portfolio}</Link></Box>}
                 
                  
            </Box>
            <Divider />
            {/* Giới thiệu */}
            {candidateData.summary && (
                <Box>
                  <Typography variant="h6" gutterBottom>Giới thiệu</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{candidateData.summary}</Typography>
                </Box>
            )}
            <Divider />
            {/* Kỹ năng */}
            {candidateData.skills && candidateData.skills.length > 0 && (
                <Box>
                   <Typography variant="h6" gutterBottom>Kỹ năng</Typography>
                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {candidateData.skills.map(skill => <Chip key={skill} label={skill} size="small"/>)}
                   </Box>
                </Box>
            )}
             <Divider />
            {/* Học vấn (Ví dụ: hiển thị 1-2 mục gần nhất) */}
            {candidateData.education && candidateData.education.length > 0 && (
                <Box>
                   <Typography variant="h6" gutterBottom>Học vấn gần đây</Typography>
                    {candidateData.education.slice(0, 2).map(edu => (
                        <Box key={edu.id} sx={{ mb: 1 }}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{edu.school}</Typography>
                             <Typography variant="body2" color="text.secondary">{edu.degree} ({edu.startYear} - {edu.endYear})</Typography>
                        </Box>
                    ))}
                </Box>
            )}
             <Divider />
            {/* Kinh nghiệm (Ví dụ: hiển thị 1-2 mục gần nhất) */}
            {candidateData.experience && candidateData.experience.length > 0 && (
                <Box>
                   <Typography variant="h6" gutterBottom>Kinh nghiệm gần đây</Typography>
                    {candidateData.experience.slice(0, 2).map(exp => (
                        <Box key={exp.id} sx={{ mb: 1 }}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{exp.title} tại {exp.company}</Typography>
                             <Typography variant="caption" color="text.secondary">{exp.startDate} - {exp.endDate}</Typography>
                             <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line', maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.description}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
            {/* Có thể thêm link xem CV ở đây nếu muốn */}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{pb:2, pr: 2}}>
        <Button onClick={onClose}>Đóng</Button>
         {/* Có thể thêm nút "Xem Hồ sơ đầy đủ" link đến trang profile của candidate */}
         {/* <Button component={RouterLink} to={`/candidate/profile/${candidateData?.id}`} variant="outlined">Xem đầy đủ</Button> */}
      </DialogActions>
    </Dialog>
  );
}

ViewProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  candidateData: PropTypes.object, // Có thể là null ban đầu
  loading: PropTypes.bool.isRequired,
};
export default ViewProfileDialog;
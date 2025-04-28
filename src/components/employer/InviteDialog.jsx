// src/components/employer/InviteDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { sendInterviewInvite } from '../../data/mockJobs'; // Giả lập gửi lời mời (có thể thay bằng API thực tế)

function InviteDialog({ open, onClose, onSubmit, applicantName }) {
  const initialInviteData = {
    inviteType: 'Phỏng vấn', // 'Phỏng vấn' hoặc 'Test'
    dateTime: '', // Format YYYY-MM-DDTHH:mm
    location: '', // Địa chỉ hoặc 'Online'
    link: '',     // Link meeting/test
    notes: '',
  };
  const [inviteData, setInviteData] = useState(initialInviteData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset form khi dialog mở ra
  useEffect(() => {
    if (open) {
      setInviteData(initialInviteData);
      setFormError('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInviteData(prev => ({ ...prev, [name]: value }));
    setFormError(''); // Xóa lỗi khi nhập
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    // Validation cơ bản
    if (!inviteData.inviteType || !inviteData.dateTime || !inviteData.location) {
      setFormError('Vui lòng điền Loại mời, Thời gian và Địa điểm/Hình thức.');
      return;
    }
    if (inviteData.location.toLowerCase() === 'online' && !inviteData.link) {
        setFormError('Vui lòng cung cấp Link nếu hình thức là Online.');
        return;
    }
     try {
         if(inviteData.link) new URL(inviteData.link); // Kiểm tra link nếu có
     } catch (_) {
         setFormError('Link không hợp lệ.');
         return;
     }

    setIsSubmitting(true);
    // Gọi hàm onSubmit từ props, truyền dữ liệu form
    onSubmit(inviteData)
      .catch(() => { /* Lỗi đã được xử lý và hiển thị bởi ApplicantsPage */})
      .finally(() => setIsSubmitting(false)); // Luôn tắt loading dù thành công hay lỗi
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gửi lời mời cho: {applicantName || 'Ứng viên'}</DialogTitle>
      <Box component="form" onSubmit={handleFormSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl component="fieldset" required>
              <FormLabel component="legend">Loại lời mời</FormLabel>
              <RadioGroup row name="inviteType" value={inviteData.inviteType} onChange={handleChange}>
                <FormControlLabel value="Phỏng vấn" control={<Radio size="small" />} label="Phỏng vấn" />
                <FormControlLabel value="Test" control={<Radio size="small" />} label="Làm bài test" />
              </RadioGroup>
            </FormControl>

            <TextField
              required
              fullWidth
              label="Thời gian"
              name="dateTime"
              type="datetime-local" // Input chuẩn cho ngày giờ
              value={inviteData.dateTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
            />

            <TextField
              required
              fullWidth
              label="Địa điểm / Hình thức"
              name="location"
              value={inviteData.location}
              onChange={handleChange}
              variant="outlined"
              size="small"
              placeholder="Ví dụ: Online, hoặc Tầng 5, Tòa nhà ABC..."
            />

            <TextField
              fullWidth
              label="Link Meeting / Link Test (nếu Online)"
              name="link"
              type="url"
              value={inviteData.link}
              onChange={handleChange}
              variant="outlined"
              size="small"
              placeholder="https://..."
            />

            <TextField
              fullWidth
              label="Ghi chú thêm (tùy chọn)"
              name="notes"
              multiline
              rows={3}
              value={inviteData.notes}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />

            {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}

          </Stack>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>Hủy</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit"/> : null}
           >
            Gửi lời mời
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

InviteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  applicantName: PropTypes.string,
};

export default InviteDialog;
// src/components/candidate/ApplyJobDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

// MUI Components
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

function ApplyJobDialog({ open, onClose, jobTitle, jobId }) {
  const { authState } = useAuth();
  const currentUser = authState.user;
  // Luôn đảm bảo availableCVs là mảng, kể cả khi currentUser.uploadedCVs không tồn tại
  const availableCVs = Array.isArray(currentUser?.uploadedCVs) ? currentUser.uploadedCVs : [];

  const [selectedCvId, setSelectedCvId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      // <<< SỬA Ở ĐÂY: Dùng _id và kiểm tra availableCVs[0] có tồn tại không >>>
      setSelectedCvId(availableCVs.length > 0 && availableCVs[0]?._id ? availableCVs[0]._id : '');
      setCoverLetter('');
      setError('');
      setSuccess('');
      setIsSubmitting(false);
    }
  }, [open, availableCVs]); // availableCVs được thêm vào dependency array là đúng

  const handleCvChange = (event) => {
    setSelectedCvId(event.target.value);
    setError('');
  };

  const handleCoverLetterChange = (event) => {
    setCoverLetter(event.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    // Nút đã có điều kiện disabled là !selectedCvId, nên ở đây selectedCvId chắc chắn có giá trị nếu nút được nhấn
    // Tuy nhiên, kiểm tra lại cho chắc chắn
    if (!selectedCvId) {
        setError('Vui lòng chọn một CV để ứng tuyển.');
        return;
    }
    console.log("Inside ApplyJobDialog - handleSubmit:");
    console.log("Job ID being submitted:", jobId);
    console.log("Selected CV ID being submitted:", selectedCvId);
    setIsSubmitting(true);
    try {
        const applicationData = {
            jobId: jobId,
            cvId: selectedCvId, // selectedCvId này phải là _id của CV
            coverLetter: coverLetter
        };
        const response = await apiService.createApplicationApi(applicationData);

        setSuccess(response.data?.message || "Ứng tuyển thành công!");
        setTimeout(() => { onClose(); }, 1500);
        // TODO: Cập nhật UI (disable nút Apply trên trang JobDetail, làm mới danh sách AppliedJobs...)
    } catch (err) {
         const errorMsg = err.response?.data?.message || err.message || 'Không thể gửi đơn ứng tuyển.';
         setError(errorMsg);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ứng tuyển vào vị trí: {jobTitle || '...'}</DialogTitle>
      <DialogContent dividers>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2.5}>
          <FormControl component="fieldset" required disabled={isSubmitting || !!success}>
            <FormLabel component="legend">Chọn CV để ứng tuyển *</FormLabel>
            {availableCVs.length > 0 ? (
              <RadioGroup
                aria-label="select-cv"
                name="select-cv-radio-group"
                value={selectedCvId}
                onChange={handleCvChange}
              >
                {availableCVs.map((cv) => (
                  <FormControlLabel
                    // <<< SỬA Ở ĐÂY: Dùng _id làm key và value >>>
                    key={cv._id || cv.id} // Ưu tiên _id
                    value={cv._id || cv.id} // Ưu tiên _id
                    control={<Radio size="small" />}
                    label={`${cv.fileName} (Tải lên: ${cv.uploadDate ? new Date(cv.uploadDate).toLocaleDateString('vi-VN') : 'N/A'})`}
                  />
                ))}
              </RadioGroup>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                Bạn chưa tải lên CV nào. Vui lòng{' '}
                <Link component={RouterLink} to="/candidate/profile">
                  cập nhật hồ sơ
                </Link>
                {' '}và tải lên CV.
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Thư giới thiệu (tùy chọn)"
            multiline
            rows={4}
            fullWidth
            value={coverLetter}
            onChange={handleCoverLetterChange}
            variant="outlined"
            placeholder="Viết một vài lời giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
            disabled={isSubmitting || !!success}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ pb: 2, pr: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          // Điều kiện disable: đang submit, HOẶC (chưa chọn CV NẾU có CV để chọn), HOẶC không có CV nào, HOẶC đã thành công
          disabled={isSubmitting || (availableCVs.length > 0 && !selectedCvId) || availableCVs.length === 0 || !!success}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Gửi ứng tuyển
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ApplyJobDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  jobTitle: PropTypes.string,
  jobId: PropTypes.string,
};

export default ApplyJobDialog;
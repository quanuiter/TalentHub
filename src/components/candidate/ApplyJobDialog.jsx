// src/components/candidate/ApplyJobDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext'; // Để lấy thông tin CV của user
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
import Link from '@mui/material/Link'; // MUI Link
import { Link as RouterLink } from 'react-router-dom'; // Router Link

// Giả lập hàm submit (sau này thay bằng API call)
const submitApplicationMock = async (candidateId, jobId, cvId, coverLetter) => {
  console.log("Submitting application (mock):", { candidateId, jobId, cvId, coverLetter });
  await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ mạng
  // Giả lập lỗi nếu không chọn CV
  if (!cvId) {
    throw new Error("Vui lòng chọn một CV để ứng tuyển.");
  }
  // Giả lập thành công
  return { success: true, message: "Ứng tuyển thành công!" };
};


function ApplyJobDialog({ open, onClose, jobTitle, jobId }) {
  const { authState } = useAuth();
  const currentUser = authState.user;
  const availableCVs = currentUser?.uploadedCVs || []; // Lấy CV từ context

  const [selectedCvId, setSelectedCvId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset state khi dialog mở/đóng hoặc user thay đổi
  useEffect(() => {
    if (open) {
      setSelectedCvId(availableCVs.length > 0 ? availableCVs[0].id : ''); // Chọn CV đầu tiên mặc định nếu có
      setCoverLetter('');
      setError('');
      setSuccess('');
      setIsSubmitting(false);
    }
  }, [open, availableCVs]);

  const handleCvChange = (event) => {
    setSelectedCvId(event.target.value);
    setError(''); // Xóa lỗi khi chọn lại
  };

  const handleCoverLetterChange = (event) => {
    setCoverLetter(event.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!selectedCvId) {
        setError('Vui lòng chọn một CV để ứng tuyển.');
        return;
    }

    setIsSubmitting(true);
    try {
         // <<< GỌI API THẬT >>>
        const applicationData = {
            jobId: jobId,
            cvId: selectedCvId,
            coverLetter: coverLetter
        };
        const response = await apiService.createApplicationApi(applicationData);

        setSuccess(response.data?.message || "Ứng tuyển thành công!");
        setTimeout(() => { onClose(); }, 1500);
        // TODO: Cập nhật UI (disable nút Apply, ...)

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
      <DialogContent dividers> {/* Thêm dividers */}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2.5}>
           {/* Phần chọn CV */}
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
                    key={cv.id}
                    value={cv.id}
                    control={<Radio size="small" />}
                    label={`${cv.fileName} (Tải lên: ${new Date(cv.uploadDate).toLocaleDateString('vi-VN')})`}
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

           {/* Phần Thư giới thiệu (Cover Letter) - Tùy chọn */}
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
          disabled={isSubmitting || !selectedCvId || availableCVs.length === 0 || !!success}
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
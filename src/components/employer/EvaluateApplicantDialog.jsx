// src/components/employer/EvaluateApplicantDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Rating from '@mui/material/Rating'; // Component đánh giá sao
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Định nghĩa các nhãn cho điểm rating (tùy chọn)
const ratingLabels = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Trung bình',
  4: 'Tốt',
  5: 'Rất tốt',
};

function EvaluateApplicantDialog({ open, onClose, onSubmit, applicantName, currentEvaluation, loading }) {
  const [rating, setRating] = useState(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Cập nhật form khi currentEvaluation thay đổi (ví dụ: khi mở dialog để sửa)
  useEffect(() => {
    if (open && currentEvaluation) {
      setRating(currentEvaluation.rating || null);
      setNotes(currentEvaluation.notes || '');
      setFormError(''); // Reset lỗi khi mở dialog
    } else if (open) {
      // Reset form khi mở để tạo mới
      setRating(null);
      setNotes('');
      setFormError('');
    }
  }, [open, currentEvaluation]);

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
    if (newValue !== null) {
        setFormError(''); // Xóa lỗi khi chọn rating
    }
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleInternalSubmit = () => {
    // Validation cơ bản
    if (rating === null) {
      setFormError('Vui lòng chọn điểm đánh giá.');
      return;
    }
    setFormError('');
    // Gọi hàm onSubmit từ props với dữ liệu đánh giá
    onSubmit({ rating, notes });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Đánh giá ứng viên: {applicantName || '...'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Phần Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
             <Typography component="legend" sx={{ mb: 1 }}>Điểm đánh giá tổng quan *</Typography>
              <Rating
                name="applicant-rating"
                value={rating}
                onChange={handleRatingChange}
                size="large" // Kích thước sao lớn hơn
              />
             {rating !== null && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {ratingLabels[rating]}
                </Typography>
             )}
          </Box>

          {/* Phần Ghi chú */}
          <TextField
            fullWidth
            label="Ghi chú đánh giá"
            name="notes"
            multiline
            rows={5}
            value={notes}
            onChange={handleNotesChange}
            variant="outlined"
            placeholder="Nhập nhận xét chi tiết về ứng viên (điểm mạnh, điểm yếu, sự phù hợp...)"
          />

          {formError && <Alert severity="error" sx={{ mt: 1 }}>{formError}</Alert>}

        </Stack>
      </DialogContent>
      <DialogActions sx={{ pb: 2, pr: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>Hủy</Button>
        <Button
          onClick={handleInternalSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit"/> : null}
         >
          Lưu đánh giá
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EvaluateApplicantDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired, // Hàm xử lý khi lưu
  applicantName: PropTypes.string,
  currentEvaluation: PropTypes.shape({ // Dữ liệu đánh giá hiện tại (nếu có)
    rating: PropTypes.number,
    notes: PropTypes.string,
  }),
  loading: PropTypes.bool, // Trạng thái loading từ bên ngoài
};

export default EvaluateApplicantDialog;
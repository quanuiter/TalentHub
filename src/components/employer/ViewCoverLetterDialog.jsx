// src/components/employer/ViewCoverLetterDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function ViewCoverLetterDialog({ open, onClose, applicantName, coverLetterContent }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        Thư giới thiệu của: {applicantName || 'Ứng viên'}
      </DialogTitle>
      <DialogContent dividers>
        {coverLetterContent ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {coverLetterContent}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
            Ứng viên này không gửi thư giới thiệu.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 2, pr: 2 }}>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

ViewCoverLetterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicantName: PropTypes.string,
  coverLetterContent: PropTypes.string,
};

export default ViewCoverLetterDialog;
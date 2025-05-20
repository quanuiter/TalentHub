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
import Link from '@mui/material/Link';
import LinkIcon from '@mui/icons-material/Link';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

function InviteDialog({
    open,
    onClose,
    onSubmit,
    applicantName,
    availableTests = [],
    loadingTests = false,
}) {
    const initialInviteData = {
        inviteType: 'Phỏng vấn', // Luôn mặc định là 'Phỏng vấn' khi dialog mở
        // Thông tin cho phỏng vấn
        dateTime: '',
        location: '',
        link: '',
        notes: '',
        // Thông tin cho gửi test
        selectedTestId: '',
        testDeadline: '',
        notesForTest: '',
    };
    const [inviteData, setInviteData] = useState(initialInviteData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // useEffect để reset form khi dialog mở hoặc đóng
    useEffect(() => {
        if (open) {
            // Reset về "Phỏng vấn" làm mặc định và xóa các trường khác
            setInviteData({
                ...initialInviteData, // Reset toàn bộ về initial
                inviteType: 'Phỏng vấn', // Đảm bảo inviteType là Phỏng vấn
                 // selectedTestId sẽ được xử lý bởi useEffect khác hoặc khi người dùng chọn "Test"
            });
            setFormError('');
            setIsSubmitting(false);
        }
    }, [open]); // Chỉ phụ thuộc vào `open`

    // useEffect để tự động chọn test đầu tiên NẾU inviteType LÀ 'Test' VÀ selectedTestId đang rỗng
    useEffect(() => {
        if (inviteData.inviteType === 'Test') {
            if (availableTests.length > 0 && !inviteData.selectedTestId) {
                // Chỉ set selectedTestId nếu nó chưa được set và có test khả dụng
                setInviteData(prev => ({ ...prev, selectedTestId: availableTests[0]._id }));
            } else if (availableTests.length === 0 && inviteData.selectedTestId) {
                // Nếu không có test nào, xóa test đã chọn (nếu có)
                setInviteData(prev => ({ ...prev, selectedTestId: '' }));
            }
        }
    }, [inviteData.inviteType, availableTests, inviteData.selectedTestId]); // Phụ thuộc vào các giá trị này


    const handleChange = (event) => {
        const { name, value } = event.target;
        // console.log("handleChange triggered. Name:", name, "Value:", value);

        setInviteData(prev => {
            const newState = { ...prev, [name]: value };

            // Khi thay đổi inviteType, reset các trường không liên quan
            if (name === 'inviteType') {
                if (value === 'Phỏng vấn') {
                    // Đặt lại các trường của Test về giá trị ban đầu
                    newState.selectedTestId = initialInviteData.selectedTestId;
                    newState.testDeadline = initialInviteData.testDeadline;
                    newState.notesForTest = initialInviteData.notesForTest;
                } else if (value === 'Test') {
                    // Đặt lại các trường của Phỏng vấn về giá trị ban đầu
                    newState.dateTime = initialInviteData.dateTime;
                    newState.location = initialInviteData.location;
                    newState.link = initialInviteData.link;
                    newState.notes = initialInviteData.notes;
                    // Tự động chọn test đầu tiên nếu có (useEffect ở trên cũng làm nhưng set ở đây cho nhanh)
                    if (availableTests.length > 0) {
                        newState.selectedTestId = availableTests[0]._id;
                    } else {
                        newState.selectedTestId = '';
                    }
                }
            }
            // console.log("New inviteData state (after potential reset):", newState);
            return newState;
        });
        setFormError('');
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        if (inviteData.inviteType === 'Phỏng vấn') {
            if (!inviteData.dateTime || !inviteData.location) {
                setFormError('Vui lòng điền Thời gian và Địa điểm/Hình thức cho phỏng vấn.');
                return;
            }
            if (inviteData.location.toLowerCase() === 'online' && !inviteData.link) {
                setFormError('Vui lòng cung cấp Link nếu phỏng vấn Online.');
                return;
            }
            if (inviteData.link) {
                try { new URL(inviteData.link); } catch (_) { setFormError('Link phỏng vấn không hợp lệ.'); return; }
            }
        } else if (inviteData.inviteType === 'Test') {
            if (!inviteData.selectedTestId) {
                setFormError('Vui lòng chọn một bài test để gửi.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit(inviteData);
            // Không gọi onClose() ở đây, để component cha quyết định sau khi onSubmit thành công
        } catch (error) {
            // Lỗi đã được xử lý và hiển thị bởi ApplicantsPage qua snackbar
            // Nếu muốn hiển thị lỗi ngay trong dialog, có thể setFormError ở đây
            // setFormError(error.message || 'Thao tác thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTestDetails = availableTests.find(t => t._id === inviteData.selectedTestId);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle>Gửi lời mời cho: {applicantName || 'Ứng viên'}</DialogTitle>
            <Box component="form" onSubmit={handleFormSubmit}>
                <DialogContent dividers sx={{pt: 2}}>
                    <Stack spacing={3}>
                        <FormControl component="fieldset" required>
                            <FormLabel component="legend">Loại lời mời *</FormLabel>
                            <RadioGroup row name="inviteType" value={inviteData.inviteType} onChange={handleChange}>
                                <FormControlLabel value="Phỏng vấn" control={<Radio size="small" />} label="Lên lịch Phỏng vấn" />
                                <FormControlLabel value="Test" control={<Radio size="small" />} label="Gửi Bài Test" />
                            </RadioGroup>
                        </FormControl>
                        <Divider />

                        {inviteData.inviteType === 'Phỏng vấn' && (
                            <Stack spacing={2.5}>
                                <Typography variant="subtitle1" sx={{fontWeight: 'medium'}}>Chi tiết Lịch Phỏng vấn</Typography>
                                <TextField
                                    required
                                    fullWidth
                                    label="Thời gian phỏng vấn"
                                    name="dateTime"
                                    type="datetime-local"
                                    value={inviteData.dateTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    size="small"
                                    disabled={isSubmitting}
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
                                    helperText="Nhập 'Online' nếu là phỏng vấn trực tuyến có link."
                                    disabled={isSubmitting}
                                />
                                <TextField
                                    fullWidth
                                    label="Link Meeting (nếu Online)"
                                    name="link"
                                    type="url"
                                    value={inviteData.link}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    placeholder="https://..."
                                    disabled={isSubmitting || inviteData.location?.toLowerCase() !== 'online'}
                                />
                                <TextField
                                    fullWidth
                                    label="Ghi chú thêm cho phỏng vấn (tùy chọn)"
                                    name="notes"
                                    multiline
                                    rows={3}
                                    value={inviteData.notes}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    disabled={isSubmitting}
                                />
                            </Stack>
                        )}

                        {inviteData.inviteType === 'Test' && (
                            <Stack spacing={2.5}>
                                <Typography variant="subtitle1" sx={{fontWeight: 'medium'}}>Chi tiết Bài Test</Typography>
                                <FormControl component="fieldset" required error={!!formError && !inviteData.selectedTestId && inviteData.inviteType === 'Test'}>
                                    <FormLabel component="legend">Chọn bài test để gửi *</FormLabel>
                                    {loadingTests ? (
                                        <CircularProgress size={24} sx={{my:1}} />
                                    ) : availableTests.length > 0 ? (
                                        <RadioGroup
                                            name="selectedTestId"
                                            value={inviteData.selectedTestId}
                                            onChange={handleChange}
                                        >
                                            {availableTests.map((test) => (
                                                <FormControlLabel
                                                    key={test._id}
                                                    value={test._id}
                                                    control={<Radio size="small" />}
                                                    disabled={isSubmitting}
                                                    label={
                                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {test.name}
                                                            {test.link && (
                                                                <Tooltip title={`Xem link test: ${test.link}`} sx={{ml: 0.5}}>
                                                                    <Link href={test.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                                        <LinkIcon sx={{fontSize: '1rem', verticalAlign:'middle', color:'text.secondary'}}/>
                                                                    </Link>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <Typography color="text.secondary" sx={{mt:1}}>
                                            Không có bài test nào được tạo. Vui lòng vào trang "Quản lý Bài Test" để thêm.
                                        </Typography>
                                    )}
                                </FormControl>

                                {inviteData.inviteType === 'Test' && selectedTestDetails && (
                                    <Typography variant="caption" color="text.secondary">
                                        Link bài test đã chọn sẽ được gửi: <Link href={selectedTestDetails.link} target="_blank" rel="noopener noreferrer">{selectedTestDetails.link}</Link>
                                    </Typography>
                                )}

                                <TextField
                                    fullWidth
                                    label="Hạn chót làm bài (tùy chọn)"
                                    name="testDeadline"
                                    type="datetime-local"
                                    value={inviteData.testDeadline}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    size="small"
                                    disabled={isSubmitting}
                                />
                                <TextField
                                    fullWidth
                                    label="Ghi chú cho ứng viên về bài test (tùy chọn)"
                                    name="notesForTest"
                                    multiline
                                    rows={3}
                                    value={inviteData.notesForTest}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    disabled={isSubmitting}
                                />
                            </Stack>
                        )}

                        {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ pb: 2, pr: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={isSubmitting}>Hủy</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || (inviteData.inviteType === 'Test' && (loadingTests || availableTests.length === 0 || !inviteData.selectedTestId))}
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit"/> : null}
                    >
                        {inviteData.inviteType === 'Phỏng vấn' ? 'Gửi Lịch Phỏng vấn' : 'Gửi Bài Test'}
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
    availableTests: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
    })),
    loadingTests: PropTypes.bool,
};

export default InviteDialog;
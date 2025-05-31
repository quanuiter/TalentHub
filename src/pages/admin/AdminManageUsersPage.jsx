// src/pages/admin/AdminManageUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
// import CircularProgress from '@mui/material/CircularProgress'; // Đã có LoadingSpinner
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Container from '@mui/material/Container';
import { useTheme, alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '@mui/material/Button'; // Thêm Button cho nút "Thử lại"

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

function AdminManageUsersPage() {
    console.log('[AdminManageUsersPage] Component function CALLED.');
    console.log('[AdminManageUsersPage] Component RENDERED / Re-rendered.');
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = useCallback(async () => {
        console.log('[AdminManageUsersPage] fetchUsers CALLED. Params:', { page: page + 1, limit: rowsPerPage, search: searchTerm || undefined, role: roleFilter || undefined });
        // Không set setLoading(true) ở đây vì nó sẽ được set bởi useEffect hoặc khi người dùng retry
        setError(null); // Reset lỗi trước mỗi lần fetch
        try {
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                search: searchTerm || undefined,
                role: roleFilter || undefined,
            };
            const response = await apiService.adminGetAllUsers(params);
            console.log('[AdminManageUsersPage] API Response:', JSON.stringify(response.data, null, 2));

            if (response && response.data && response.data.success) {
                setUsers(response.data.data || []);
                setTotalUsers(response.data.totalUsers || 0);
                console.log('[AdminManageUsersPage] Users set. Count:', (response.data.data || []).length);
            } else {
                const errorMessage = response?.data?.message || 'Không thể tải danh sách người dùng. Định dạng phản hồi không đúng.';
                console.error('[AdminManageUsersPage] API Error or unsuccessful:', errorMessage);
                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error("[AdminManageUsersPage] Error in fetchUsers catch block:", err);
            setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu người dùng.');
            setUsers([]); // Reset users khi có lỗi
            setTotalUsers(0); // Reset totalUsers khi có lỗi
        } finally {
            setLoading(false);
            console.log('[AdminManageUsersPage] Fetching complete. Loading set to false.');
        }
    }, [page, rowsPerPage, searchTerm, roleFilter]);

    useEffect(() => {
        console.log('[AdminManageUsersPage] useEffect for fetchUsers TRIGGERED.');
        setLoading(true); // Set loading true khi component mount hoặc dependencies thay đổi
        fetchUsers();
    }, [fetchUsers]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset về trang đầu khi thay đổi tìm kiếm
    };

    const handleRoleFilterChange = (event) => {
        setRoleFilter(event.target.value);
        setPage(0); // Reset về trang đầu khi thay đổi bộ lọc
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getRoleChipColor = (role) => {
        if (role === 'admin') return 'secondary';
        if (role === 'employer') return 'primary';
        if (role === 'candidate') return 'info';
        return 'default';
    };

    const handleRetryFetch = () => {
        console.log('[AdminManageUsersPage] Retrying fetchUsers...');
        setLoading(true); // Quan trọng: Set loading lại là true
        setError(null);
        fetchUsers();
    };


    console.log('[AdminManageUsersPage] States before return: loading=', loading, 'Error=', error, 'Users count=', users.length);

    if (loading) {
        console.log('[AdminManageUsersPage] Rendering LoadingSpinner because loading is true.');
        return <LoadingSpinner />;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.dark', display:'flex', alignItems:'center', gap:1 }}>
                <PeopleOutlineIcon fontSize="large"/> Quản lý Người dùng
            </Typography>

            {error && (
                <Alert severity="error" sx={{ my: 2, p: 2, borderRadius: '8px' }}>
                    {error}
                    <Button onClick={handleRetryFetch} size="small" sx={{ml: 2, textTransform: 'none'}}>Thử lại</Button>
                </Alert>
            )}

            {!error && (
                <Paper sx={{ p: {xs: 2, md: 3}, borderRadius: '12px', boxShadow: theme.shadows[3] }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            label="Tìm kiếm (Tên, Email, Công ty)"
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            sx={{ flexGrow: 1, minWidth: {xs: '100%', sm:'250px'}, bgcolor: alpha(theme.palette.grey[50], 0.9) }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl variant="outlined" size="small" sx={{ minWidth: {xs: '100%', sm: 180}, bgcolor: alpha(theme.palette.grey[50], 0.9) }}>
                            <InputLabel>Lọc theo vai trò</InputLabel>
                            <Select
                                value={roleFilter}
                                onChange={handleRoleFilterChange}
                                label="Lọc theo vai trò"
                            >
                                <MenuItem value=""><em>Tất cả vai trò</em></MenuItem>
                                <MenuItem value="candidate">Ứng viên</MenuItem>
                                <MenuItem value="employer">Nhà tuyển dụng</MenuItem>
                                {/* <MenuItem value="admin">Quản trị viên</MenuItem> */}
                            </Select>
                        </FormControl>
                    </Box>

                    <TableContainer sx={{maxHeight: 600 /* Giới hạn chiều cao cho bảng nếu cần */}}>
                        <Table stickyHeader aria-label="user management table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Họ và Tên</TableCell>
                                    <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Email</TableCell>
                                    <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Vai trò</TableCell>
                                    <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Tên công ty (NTD)</TableCell>
                                    <TableCell sx={{fontWeight:'bold', bgcolor: alpha(theme.palette.primary.light, 0.1)}}>Ngày đăng ký</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length > 0 ? users.map((user) => (
                                    <TableRow hover key={user._id || user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {user.fullName || 'N/A'}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'} 
                                                size="small" 
                                                color={getRoleChipColor(user.role)}
                                                sx={{fontWeight: 500, borderRadius: '6px'}}
                                            />
                                        </TableCell>
                                        <TableCell>{user.role === 'employer' ? (user.companyName || 'Chưa cập nhật') : 'N/A'}</TableCell>
                                        <TableCell>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{py:3}}>
                                            <Typography color="text.secondary" fontStyle="italic">Không tìm thấy người dùng nào phù hợp với tiêu chí.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {totalUsers > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={totalUsers}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số dòng mỗi trang:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
                        />
                    )}
                </Paper>
            )}
        </Container>
    );
}

export default AdminManageUsersPage;
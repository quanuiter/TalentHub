// src/components/common/Header.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";

// MUI Components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import { alpha, useTheme } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Popover from '@mui/material/Popover';
import CircularProgress from '@mui/material/CircularProgress';
import ListSubheader from '@mui/material/ListSubheader';
import useMediaQuery from "@mui/material/useMediaQuery"; // This was missing in the previous version I saw in context

// Icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined"; // <<< ENSURED IMPORT
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CloseIcon from '@mui/icons-material/Close';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Helper format thời gian tương đối
const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};


function Header() {
  const navigate = useNavigate();
  const { authState, logout, fetchUserProfile } = useAuth();
  const { isAuthenticated, user } = authState;
  const userRole = user?.role;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Corrected: useMediaQuery was missing

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const toggleMobileMenu = (open) => () => { // Simplified toggleMobileMenu
    // Close user menu if open, to prevent overlap or confusion
    if (anchorElUser) {
        handleCloseUserMenu();
    }
    // Close notification popover if open
    if (anchorElNotif) {
        handleCloseNotifMenu();
    }
    setMobileMenuOpen(open);
  };


  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseUserMenu();
    setMobileMenuOpen(false);
  };

  const dashboardPath = userRole === "employer" ? "/employer/dashboard" : "/candidate/dashboard";
  const settingsPath = userRole === "employer" ? "/employer/settings" : "/candidate/settings";
  const profilePath = userRole === "employer" ? "/employer/company-profile" : "/candidate/profile";

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 });
  const navLinkStyles = { fontWeight: 500, borderRadius: "8px", px: 1.5, py: 0.8, textTransform: 'none', fontSize: '0.95rem', color: 'text.secondary', '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main',}, '&.active': { color: 'primary.main', fontWeight: 600,}};
  const mainNavLinks = (isDrawer = false) => ( <> {(!isAuthenticated || userRole === "candidate") && ( <> <Button color="inherit" component={RouterLink} to="/jobs" startIcon={<WorkOutlineIcon />} sx={{ ...navLinkStyles, ...(isDrawer && { justifyContent: 'flex-start', width: '100%', py:1.5 })}} onClick={() => isDrawer && setMobileMenuOpen(false)} > Tìm việc làm </Button> <Button color="inherit" component={RouterLink} to="/companies" startIcon={<BusinessOutlinedIcon />} sx={{ ...navLinkStyles, ...(isDrawer && { justifyContent: 'flex-start', width: '100%', py:1.5 })}} onClick={() => isDrawer && setMobileMenuOpen(false)} > Công ty </Button> </> )} {userRole === "employer" && ( <> <Button color="inherit" component={RouterLink} to="/employer/manage-jobs" startIcon={<WorkOutlineIcon />} sx={{ ...navLinkStyles, ...(isDrawer && { justifyContent: 'flex-start', width: '100%', py:1.5 })}} onClick={() => isDrawer && setMobileMenuOpen(false)} > Quản lý Tin </Button> <Button color="inherit" component={RouterLink} to="/employer/applicants" startIcon={<PeopleIcon />} sx={{ ...navLinkStyles, ...(isDrawer && { justifyContent: 'flex-start', width: '100%', py:1.5 })}} onClick={() => isDrawer && setMobileMenuOpen(false)} > Ứng viên </Button> </> )} </> );

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingNotifs(true);
    try {
        const response = await apiService.getNotificationsApi({ page: 1, limit: 7 });
        if (response.data) {
            setNotifications(response.data.data || []);
            setUnreadCount(response.data.unreadCount || 0);
        }
    } catch (error) {
        console.error("Lỗi tải thông báo:", error);
    } finally {
        setLoadingNotifs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if(isAuthenticated){ // Only fetch if authenticated
        fetchNotifications();
        // Optional: Set up an interval to refresh notifications
        // const intervalId = setInterval(fetchNotifications, 60000); // every 1 minute
        // return () => clearInterval(intervalId);
    } else {
        // Clear notifications if user logs out
        setNotifications([]);
        setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]); // Rerun if isAuthenticated changes

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
    if(isAuthenticated) fetchNotifications(); // Refresh on open if authenticated
  };
  const handleCloseNotifMenu = () => setAnchorElNotif(null);

  const handleNotificationClick = async (notification) => {
    handleCloseNotifMenu();
    if (notification.link) {
        navigate(notification.link);
    }
    if (!notification.isRead) {
        try {
            const res = await apiService.markNotificationAsReadApi(notification._id);
            setUnreadCount(res.data.unreadCount);
            setNotifications(prev => prev.map(n => n._id === notification._id ? {...n, isRead: true} : n));
            // Optionally, refetch user profile if unread count is part of user object for other UI elements
            // if (fetchUserProfile) fetchUserProfile();
        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      handleCloseNotifMenu(); // Still close menu if no unread
      return;
    }
    // No need to call handleCloseNotifMenu() here if we want the popover to remain open
    // and show the updated (all read) notifications.
    // Or, close it and let the user reopen to see changes. For now, let's keep it open.
    try {
        const res = await apiService.markAllNotificationsAsReadApi();
        // The API should return the updated list and new unreadCount (which should be 0)
        if(res.data){
            setNotifications(res.data.data || []); // Update with potentially new list (e.g., if API returns latest after marking all read)
            setUnreadCount(res.data.unreadCount || 0); // Should be 0
        }
        // If you want to close the popover after marking all as read:
        // handleCloseNotifMenu();
    } catch (error) {
        console.error("Lỗi đánh dấu tất cả đã đọc:", error);
    }
  };

  const NotificationIconComponent = unreadCount > 0 ? NotificationsActiveIcon : NotificationsNoneOutlinedIcon;


  return (
    <AppBar
      position="sticky"
      elevation={trigger ? 3 : 0}
      sx={{
        bgcolor: trigger ? alpha(theme.palette.background.paper, 0.85) : theme.palette.background.paper,
        backdropFilter: trigger ? "blur(8px)" : "none",
        color: "text.primary",
        borderBottom: trigger ? "none" : `1px solid ${theme.palette.divider}`,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", minHeight: {xs: 56, sm: 64} }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: {xs: 1, sm: 2, md:3},
                fontWeight: 700,
                fontSize: { xs: "1.2rem", sm: "1.35rem" },
                color: "primary.main",
                textDecoration: "none",
                '&:hover': { opacity: 0.9 }
              }}
            >
              TalentHub
            </Typography>
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
                {mainNavLinks()}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: {xs: 0.5, sm:1} }}>
             {(!isAuthenticated || userRole === "employer") && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<PostAddIcon />}
                  component={RouterLink}
                  to={isAuthenticated ? "/employer/post-job" : "/login?redirect=/employer/post-job"}
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    borderRadius: "20px",
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 2.5
                  }}
                >
                  {userRole === "employer" ? "Đăng tin" : "Nhà tuyển dụng"}
                </Button>
              )}

            {isAuthenticated ? (
              <>
                {userRole && !isMobile && (
                  <Chip
                    avatar={<Avatar sx={{bgcolor: userRole === "employer" ? 'info.light' : 'success.light', color: userRole === "employer" ? 'info.dark' : 'success.dark' }}>
                              {userRole === "employer" ? <BusinessOutlinedIcon fontSize="small"/> : <AccountCircle fontSize="small"/>}
                           </Avatar>}
                    label={userRole === "employer" ? "Nhà tuyển dụng" : "Ứng viên"}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      display: { xs: 'none', md: 'inline-flex' },
                      mr: 1,
                      bgcolor: alpha(userRole === "employer" ? theme.palette.info.main : theme.palette.success.main, 0.1),
                      color: userRole === "employer" ? 'info.dark' : 'success.dark',
                      border: `1px solid ${alpha(userRole === "employer" ? theme.palette.info.main : theme.palette.success.main, 0.3)}`
                    }}
                  />
                )}

                <Tooltip title="Thông báo">
                  <IconButton color="inherit" sx={{ '&:hover': { backgroundColor: alpha(theme.palette.action.active, 0.04) } }} onClick={handleOpenNotifMenu}>
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                      {/* Using the pre-assigned component variable */}
                      <NotificationIconComponent />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Tài khoản">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{ p: 0, ml: 1, '&:hover': { opacity: 0.8 } }}
                  >
                    <Avatar
                        src={user?.avatar}
                        alt={user?.fullName || "User"}
                        sx={{ width: {xs: 32, sm: 36}, height: {xs: 32, sm: 36}, bgcolor: 'primary.main' }}
                    >
                        {!user?.avatar && user?.fullName ? user.fullName.charAt(0).toUpperCase() : <AccountCircle />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      minWidth: 220,
                      borderRadius: '10px',
                      '& .MuiAvatar-root': { width: 42, height: 42, ml: -0.5, mr: 1.5, },
                      '&:before': {
                        content: '""', display: 'block', position: 'absolute',
                        top: 0, right: 14, width: 10, height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        borderTop: `1px solid ${theme.palette.divider}`,
                      },
                    },
                  }}
                >
                  {user?.fullName && (
                    <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {user.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                  )}
                  <MenuItem onClick={() => handleNavigate(dashboardPath)} sx={{ py: 1.2, px:2 }}>
                    <DashboardIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} /> Bảng điều khiển
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate(profilePath)} sx={{ py: 1.2, px:2 }}>
                    <AccountCircle fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} /> Hồ sơ
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate(settingsPath)} sx={{ py: 1.2, px:2 }}>
                    <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} /> Cài đặt
                  </MenuItem>
                  <Divider light />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.2, px:2, color: "error.main", fontWeight: 500 }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                <Button color="inherit" component={RouterLink} to="/login" sx={navLinkStyles}>Đăng nhập</Button>
                <Button variant="contained" color="primary" component={RouterLink} to="/register" size="small" sx={{ borderRadius: "20px", fontWeight: 600, textTransform: 'none', px:2.5 }}>Đăng ký</Button>
              </Box>
            )}

            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={toggleMobileMenu(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu(false)}
        PaperProps={{ sx: { width: '80%', maxWidth: 300, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, bgcolor: 'background.default' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`}}>
          <Typography variant="h6" color="primary" fontWeight={600}>Menu</Typography>
          <IconButton onClick={toggleMobileMenu(false)}><CloseIcon /></IconButton>
        </Box>
        <List onClick={toggleMobileMenu(false)} onKeyDown={toggleMobileMenu(false)} sx={{p:1}}>
            {mainNavLinks(true)}
            {(!isAuthenticated || userRole === "employer") && (
                <ListItemButton component={RouterLink} to={isAuthenticated ? "/employer/post-job" : "/login?redirect=/employer/post-job"} sx={{py:1.5, borderRadius: '8px', my:0.5}}>
                  <ListItemIcon><PostAddIcon color="primary"/></ListItemIcon>
                  <ListItemText primary={userRole === "employer" ? "Đăng tin tuyển dụng" : "Dành cho Nhà tuyển dụng"} primaryTypographyProps={{fontWeight:500}}/>
                </ListItemButton>
            )}
            <Divider sx={{my:1}}/>
            {!isAuthenticated && (
                <>
                    <ListItemButton component={RouterLink} to="/login" sx={{py:1.5, borderRadius: '8px', my:0.5}}>
                        <ListItemIcon><AccountCircle color="primary"/></ListItemIcon>
                        <ListItemText primary="Đăng nhập" primaryTypographyProps={{fontWeight:500}}/>
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/register" sx={{py:1.5, borderRadius: '8px', my:0.5}}>
                         <ListItemIcon><PostAddIcon color="primary"/></ListItemIcon>
                        <ListItemText primary="Đăng ký" primaryTypographyProps={{fontWeight:500}}/>
                    </ListItemButton>
                </>
            )}
        </List>
      </Drawer>

      <Popover
        id="notifications-popover"
        open={Boolean(anchorElNotif)}
        anchorEl={anchorElNotif}
        onClose={handleCloseNotifMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.1))', // Softer shadow
                mt: 1.5,
                width: 380, // Slightly wider
                borderRadius: '12px', // Softer radius
                border: `1px solid ${theme.palette.divider}`,
                '&:before': {
                    content: '""', display: 'block', position: 'absolute',
                    top: 0, right: 14, width: 10, height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    borderTop: `1px solid ${theme.palette.divider}`,
                },
            },
        }}
      >
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle1" fontWeight="600">Thông báo</Typography>
            {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllAsRead} startIcon={<MarkChatReadOutlinedIcon fontSize="small"/>} sx={{textTransform: 'none', fontSize: '0.8rem', color: 'text.secondary', '&:hover': {bgcolor: alpha(theme.palette.action.active, 0.04)}}}>
                    Đánh dấu đã đọc ({unreadCount})
                </Button>
            )}
        </Box>
        {loadingNotifs ? (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120}}>
                <CircularProgress size={28} />
            </Box>
        ) : notifications.length > 0 ? (
            <List dense sx={{ maxHeight: 380, overflow: 'auto', p:0 }}>
                {notifications.map((notif) => (
                    <ListItemButton
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        sx={{
                            alignItems: 'flex-start',
                            py: 1.2, px: 2,
                            bgcolor: !notif.isRead ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) },
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            '&:last-child': {borderBottom: 'none'}
                        }}
                    >
                        <ListItemIcon sx={{minWidth: 24, mt: 0.7, mr: 1}}>
                            {!notif.isRead && <FiberManualRecordIcon sx={{ fontSize: 10, color: 'primary.main' }} />}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2" component="span" sx={{fontWeight: !notif.isRead ? 500 : 400, color: 'text.primary', lineHeight: 1.4}}>
                                    {notif.message}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary" sx={{mt:0.3, display:'block'}}>
                                    {formatRelativeTime(notif.createdAt)}
                                    {notif.sender?.fullName && ` • từ ${notif.sender.fullName}`}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                ))}
            </List>
        ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2.5, textAlign: 'center', fontStyle: 'italic' }}>
                Bạn không có thông báo nào mới.
            </Typography>
        )}
        {notifications.length > 0 && ( // Always show "View All" if there are any notifications loaded
             <Box sx={{ p: 1, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button size="small" component={RouterLink} to="/notifications" onClick={handleCloseNotifMenu} sx={{textTransform: 'none', fontWeight: 500}}>
                    Xem tất cả thông báo
                </Button>
            </Box>
        )}
      </Popover>
    </AppBar>
  )
}

export default Header;

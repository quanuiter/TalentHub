"use client"

// src/components/common/Header.jsx
import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext" // Import useAuth

// MUI Components
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Link from "@mui/material/Link" // MUI Link
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Tooltip from "@mui/material/Tooltip" // Thêm Tooltip cho icon
import Chip from "@mui/material/Chip" // Thêm Chip để hiển thị vai trò
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter" // Icon cho chip vai trò
import Container from "@mui/material/Container"
import Divider from "@mui/material/Divider"
import Avatar from "@mui/material/Avatar"
import { alpha } from "@mui/material/styles"
import Badge from "@mui/material/Badge"
import useScrollTrigger from "@mui/material/useScrollTrigger"

// Icons
import AccountCircle from "@mui/icons-material/AccountCircle"
import LogoutIcon from "@mui/icons-material/Logout"
import DashboardIcon from "@mui/icons-material/Dashboard"
import SettingsIcon from "@mui/icons-material/Settings"
import PostAddIcon from "@mui/icons-material/PostAdd"
import PeopleIcon from "@mui/icons-material/People" // Icon cho NTD
import MenuIcon from "@mui/icons-material/Menu"
import NotificationsIcon from "@mui/icons-material/Notifications"
import WorkIcon from "@mui/icons-material/Work"
import BusinessIcon from "@mui/icons-material/Business"

function Header() {
  const navigate = useNavigate()
  const { authState, logout } = useAuth() //
  const { isAuthenticated, user } = authState //
  const userRole = user?.role // Lấy vai trò người dùng

  // State cho User Menu
  const [anchorElUser, setAnchorElUser] = useState(null)
  // State cho Mobile Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleLogout = () => {
    logout() // Gọi hàm logout từ context
    handleCloseUserMenu() // Đóng menu
    navigate("/") // Về trang chủ
  }

  // Điều hướng dựa trên vai trò
  const handleNavigate = (path) => {
    navigate(path)
    handleCloseUserMenu()
  }

  // Xác định các đường dẫn dựa trên vai trò
  const dashboardPath = userRole === "employer" ? "/employer/dashboard" : "/candidate/dashboard"
  const settingsPath = userRole === "employer" ? "/employer/settings" : "/candidate/settings"
  const profilePath = userRole === "employer" ? "/employer/company-profile" : "/candidate/profile"

  // Handle scroll effect
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })

  return (
    <AppBar
      position="sticky"
      elevation={trigger ? 4 : 0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: trigger ? "none" : "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        backdropFilter: "blur(8px)",
        background: trigger ? "rgba(255, 255, 255, 0.95)" : "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1, px: { xs: 0, sm: 2 }, justifyContent: "space-between" }}>
          {/* Left side: Logo and Navigation Links */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Logo without icon */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                mr: 4,
                fontWeight: 700,
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                color: "primary.main",
              }}
            >
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                sx={{
                  textDecoration: "none",
                  fontWeight: "bold",
                  letterSpacing: "0.5px",
                  "&:hover": {
                    color: "primary.dark",
                  },
                  transition: "color 0.2s ease",
                }}
              >
                TalentHub
              </Link>
            </Typography>

            {/* Navigation Links based on role - visible on desktop */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {/* Links for everyone (not logged in or candidate) */}
              {(!isAuthenticated || userRole === "candidate") && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/jobs"
                    startIcon={<WorkIcon />}
                    sx={{
                      fontWeight: 500,
                      borderRadius: "8px",
                      px: 2,
                      "&:hover": {
                        backgroundColor: alpha("#1976d2", 0.08),
                      },
                    }}
                  >
                    Tìm việc làm
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/companies"
                    startIcon={<BusinessIcon />}
                    sx={{
                      fontWeight: 500,
                      borderRadius: "8px",
                      px: 2,
                      "&:hover": {
                        backgroundColor: alpha("#1976d2", 0.08),
                      },
                    }}
                  >
                    Công ty
                  </Button>
                </>
              )}

              {/* Links for Employers */}
              {userRole === "employer" && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/employer/manage-jobs"
                    startIcon={<WorkIcon />}
                    sx={{
                      fontWeight: 500,
                      borderRadius: "8px",
                      px: 2,
                      "&:hover": {
                        backgroundColor: alpha("#1976d2", 0.08),
                      },
                    }}
                  >
                    Quản lý tin đăng
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/employer/applicants"
                    startIcon={<PeopleIcon />}
                    sx={{
                      fontWeight: 500,
                      borderRadius: "8px",
                      px: 2,
                      "&:hover": {
                        backgroundColor: alpha("#1976d2", 0.08),
                      },
                    }}
                  >
                    Quản lý ứng viên
                  </Button>
                </>
              )}

              {/* Post Job Button - moved to left side */}
              {(!isAuthenticated || userRole === "employer") && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PostAddIcon />}
                  component={RouterLink}
                  to={isAuthenticated ? "/employer/post-job" : "/login?redirect=/employer/post-job"}
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    borderRadius: "8px",
                    fontWeight: 600,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {userRole === "employer" ? "Đăng tin" : "Nhà tuyển dụng Đăng tin"}
                </Button>
              )}
            </Box>
          </Box>

          {/* Mobile menu button */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton color="inherit" aria-label="open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Right side: User-related elements (Role chip, Notifications, User menu) */}
          <Box
            sx={{
              display: { xs: mobileMenuOpen ? "flex" : "none", md: "flex" },
              alignItems: "center",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
              position: { xs: "absolute", md: "static" },
              top: { xs: "100%", md: "auto" },
              left: { xs: 0, md: "auto" },
              right: { xs: 0, md: "auto" },
              bgcolor: { xs: "background.paper", md: "transparent" },
              p: { xs: 2, md: 0 },
              boxShadow: { xs: "0 4px 8px rgba(0,0,0,0.1)", md: "none" },
              zIndex: { xs: 1000, md: "auto" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            {/* Mobile-only navigation links */}
            <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", width: "100%", mb: 2, gap: 1 }}>
              {(!isAuthenticated || userRole === "candidate") && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/jobs"
                    startIcon={<WorkIcon />}
                    fullWidth
                    sx={{ justifyContent: "flex-start" }}
                  >
                    Tìm việc làm
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/companies"
                    startIcon={<BusinessIcon />}
                    fullWidth
                    sx={{ justifyContent: "flex-start" }}
                  >
                    Công ty
                  </Button>
                </>
              )}

              {userRole === "employer" && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/employer/manage-jobs"
                    startIcon={<WorkIcon />}
                    fullWidth
                    sx={{ justifyContent: "flex-start" }}
                  >
                    Quản lý tin đăng
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/employer/applicants"
                    startIcon={<PeopleIcon />}
                    fullWidth
                    sx={{ justifyContent: "flex-start" }}
                  >
                    Quản lý ứng viên
                  </Button>
                </>
              )}

              {/* Post Job Button on mobile */}
              {(!isAuthenticated || userRole === "employer") && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PostAddIcon />}
                  component={RouterLink}
                  to={isAuthenticated ? "/employer/post-job" : "/login?redirect=/employer/post-job"}
                  fullWidth
                >
                  {userRole === "employer" ? "Đăng tin" : "Nhà tuyển dụng Đăng tin"}
                </Button>
              )}

              <Divider sx={{ my: 1 }} />
            </Box>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <>
                {/* Role Chip */}
                {userRole && (
                  <Chip
                    icon={
                      userRole === "employer" ? (
                        <BusinessCenterIcon fontSize="small" />
                      ) : (
                        <AccountCircle fontSize="small" />
                      )
                    }
                    label={userRole === "employer" ? "Nhà tuyển dụng" : "Ứng viên"}
                    color={userRole === "employer" ? "info" : "success"}
                    size="small"
                    sx={{
                      display: "inline-flex",
                      fontWeight: 500,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                )}

                {/* Notifications icon */}
                <Tooltip title="Thông báo">
                  <IconButton
                    color="inherit"
                    sx={{
                      display: { xs: "none", md: "flex" },
                      "&:hover": {
                        backgroundColor: alpha("#1976d2", 0.08),
                      },
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* User Menu */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: { xs: "100%", md: "auto" },
                  }}
                >
                  <Tooltip title="Tài khoản">
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{
                        p: 0.5,
                        border: "2px solid",
                        borderColor: "primary.main",
                        width: { xs: "100%", md: "auto" },
                        display: "flex",
                        justifyContent: "center",
                        borderRadius: "50%",
                      }}
                    >
                      {user?.avatar ? (
                        <Avatar src={user.avatar} alt={user.fullName || "User"} sx={{ width: 32, height: 32 }} />
                      ) : (
                        <AccountCircle sx={{ color: "primary.main", fontSize: 32 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{
                      mt: "45px",
                      "& .MuiPaper-root": {
                        borderRadius: 2,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        minWidth: 200,
                      },
                    }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    keepMounted
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {user?.fullName && (
                      <>
                        <Box sx={{ px: 2, py: 1.5, textAlign: "center" }}>
                          <Avatar
                            src={user.avatar}
                            alt={user.fullName}
                            sx={{
                              width: 60,
                              height: 60,
                              mx: "auto",
                              mb: 1,
                              border: "2px solid",
                              borderColor: "primary.main",
                            }}
                          >
                            {!user.avatar && user.fullName.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                      </>
                    )}
                    <MenuItem onClick={() => handleNavigate(dashboardPath)} sx={{ py: 1.5 }}>
                      <DashboardIcon fontSize="small" sx={{ mr: 2, color: "primary.main" }} /> Bảng điều khiển
                    </MenuItem>
                    {/* Các menu item khác như cũ (Hồ sơ, Cài đặt, Đăng xuất) */}
                    <MenuItem onClick={() => handleNavigate(profilePath)} sx={{ py: 1.5 }}>
                      <AccountCircle fontSize="small" sx={{ mr: 2, color: "primary.main" }} /> Hồ sơ
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate(settingsPath)} sx={{ py: 1.5 }}>
                      <SettingsIcon fontSize="small" sx={{ mr: 2, color: "primary.main" }} /> Cài đặt
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
                      <LogoutIcon fontSize="small" sx={{ mr: 2 }} /> Đăng xuất
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <>
                {/* Login/Register Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    width: { xs: "100%", md: "auto" },
                    gap: 1,
                  }}
                >
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      fontWeight: 500,
                      width: { xs: "100%", md: "auto" },
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: alpha("#1976d2", 0.08),
                      },
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/register"
                    sx={{
                      fontWeight: 600,
                      width: { xs: "100%", md: "auto" },
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    Đăng ký
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header

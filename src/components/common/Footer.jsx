import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import Button from "@mui/material/Button"

// Icons
import FacebookIcon from "@mui/icons-material/Facebook"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import TwitterIcon from "@mui/icons-material/Twitter"
import InstagramIcon from "@mui/icons-material/Instagram"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import WorkIcon from "@mui/icons-material/Work"

function Footer() {
  // Footer links organized by category
  const footerLinks = {
    forJobSeekers: [
      { name: "Tìm việc làm", url: "/jobs" },
      { name: "Tạo hồ sơ", url: "/profile/create" },
      { name: "Cẩm nang nghề nghiệp", url: "/career-guide" },
      { name: "Tính lương", url: "/salary-calculator" },
      { name: "Đánh giá công ty", url: "/company-reviews" },
    ],
    forEmployers: [
      { name: "Đăng tin tuyển dụng", url: "/employer/post-job" },
      { name: "Tìm ứng viên", url: "/employer/search-candidates" },
      { name: "Giải pháp tuyển dụng", url: "/employer/solutions" },
      { name: "Bảng giá dịch vụ", url: "/employer/pricing" },
    ],
    aboutUs: [
      { name: "Giới thiệu", url: "/about" },
      { name: "Liên hệ", url: "/contact" },
      { name: "Điều khoản sử dụng", url: "/terms" },
      { name: "Chính sách bảo mật", url: "/privacy" },
      { name: "Quy chế hoạt động", url: "/regulations" },
    ],
  }

  // Social media links
  const socialLinks = [
    { icon: <FacebookIcon />, url: "https://facebook.com" },
    { icon: <LinkedInIcon />, url: "https://linkedin.com" },
    { icon: <TwitterIcon />, url: "https://twitter.com" },
    { icon: <InstagramIcon />, url: "https://instagram.com" },
  ]

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
        borderTop: "1px solid",
        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info & Logo */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                TalentHub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nền tảng kết nối nhân tài hàng đầu Việt Nam, giúp ứng viên tìm kiếm cơ hội việc làm và doanh nghiệp tìm
                kiếm nhân tài phù hợp.
              </Typography>
            </Box>

            {/* Contact Info */}
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOnIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Tầng 12, Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  (028) 3822 9999
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  contact@talenthub.vn
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Links Sections */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <WorkIcon fontSize="small" color="primary" />
              Dành cho ứng viên
            </Typography>
            <Stack spacing={1} component="ul" sx={{ pl: 0, listStyle: "none" }}>
              {footerLinks.forJobSeekers.map((link, index) => (
                <Box component="li" key={index}>
                  <Link
                    href={link.url}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: "0.875rem",
                      transition: "all 0.2s",
                      "&:hover": { color: "primary.main", pl: 0.5 },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <WorkIcon fontSize="small" color="primary" />
              Nhà tuyển dụng
            </Typography>
            <Stack spacing={1} component="ul" sx={{ pl: 0, listStyle: "none" }}>
              {footerLinks.forEmployers.map((link, index) => (
                <Box component="li" key={index}>
                  <Link
                    href={link.url}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: "0.875rem",
                      transition: "all 0.2s",
                      "&:hover": { color: "primary.main", pl: 0.5 },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <WorkIcon fontSize="small" color="primary" />
              Về chúng tôi
            </Typography>
            <Stack spacing={1} component="ul" sx={{ pl: 0, listStyle: "none" }}>
              {footerLinks.aboutUs.map((link, index) => (
                <Box component="li" key={index}>
                  <Link
                    href={link.url}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: "0.875rem",
                      transition: "all 0.2s",
                      "&:hover": { color: "primary.main", pl: 0.5 },
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter Signup */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Kết nối với chúng tôi
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    minWidth: "auto",
                    p: 1,
                    borderRadius: "50%",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  {social.icon}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TalentHub. Tất cả quyền được bảo lưu.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Link href="/terms" color="text.secondary" underline="hover" variant="body2">
              Điều khoản
            </Link>
            <Link href="/privacy" color="text.secondary" underline="hover" variant="body2">
              Quyền riêng tư
            </Link>
            <Link href="/cookies" color="text.secondary" underline="hover" variant="body2">
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer

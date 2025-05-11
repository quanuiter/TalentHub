"use client"
import { Link as RouterLink } from "react-router-dom"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import PropTypes from "prop-types"
import EventIcon from "@mui/icons-material/Event" // Thêm icon ngày đăng nếu muốn
import BusinessIcon from "@mui/icons-material/Business"
import WorkIcon from "@mui/icons-material/Work"
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder"
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove"
import Avatar from "@mui/material/Avatar"
import Chip from "@mui/material/Chip"
import { alpha } from "@mui/material/styles"

function JobCard({ job, showSaveButton = true, onUnsave }) {
  if (!job) return null

  return (
    // === THAY ĐỔI Ở ĐÂY ===
    // Thêm display: 'flex', flexDirection: 'column'
    <Card
      sx={{
        height: "100%",
        width: "16.1em",
        display: "flex",
        flexDirection: "column",
        mb: 2,
        borderRadius: 2,
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        },
        overflow: "visible",
        position: "relative",
      }}
    >

      {/* Phần nội dung chính */}
      {/* Thêm flexGrow: 1 để nó chiếm không gian */}
      <CardContent sx={{ flexGrow: 1, pt: 3, px: 3 }}>
        {/* Có thể đặt minHeight cho Title nếu muốn đảm bảo ít nhất 2 dòng */}
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            "& a": {
              textDecoration: "none",
              color: "inherit",
              transition: "color 0.2s ease",
              "&:hover": {
                color: "primary.main",
              },
            },
            // TÙY CHỌN: Giới hạn số dòng và thêm dấu ... nếu quá dài
            maxHeight: "3.2em", // Giới hạn chiều cao tối đa cho 2 dòng
            maxWidth: "100%", // Giới hạn chiều rộng tối đa
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: "2", // Giới hạn 2 dòng
            WebkitBoxOrient: "vertical",
            minHeight: "3.2em", // Đảm bảo chiều cao tối thiểu cho 2 dòng (điều chỉnh nếu cần)
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.4,
          }}
        >
          <RouterLink to={`/jobs/${job._id || job.id}`}>{job.title}</RouterLink>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <BusinessIcon sx={{ mr: 0.5, fontSize: "1rem", color: "text.secondary" }} />
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              minHeight: "1.5em" /* Giữ chỗ tên cty */,
              fontWeight: 500,
            }}
          >
            {job.companyName}
          </Typography>
        </Box>

        {/* Job type chip - new element */}
        <Chip
          label={job.type}
          size="small"
          icon={<WorkIcon />}
          sx={{
            mb: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            fontWeight: 500,
            "& .MuiChip-icon": {
              color: "primary.main",
            },
          }}
        />

        {/* Các thông tin khác */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "text.secondary", minHeight: "1.5em" }}>
          <LocationOnIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
          <Typography variant="body2" noWrap>
            {" "}
            {/* noWrap để tránh tràn nếu địa chỉ quá dài */}
            {job.location}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "text.secondary", minHeight: "1.5em" }}>
          <AttachMoneyIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 500,
              color: "success.main",
            }}
          >
            {job.salary || "Thương lượng"}
          </Typography>
        </Box>

        {/* Tùy chọn: Thêm ngày đăng */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.disabled",
            mt: 2,
            pt: 1,
            borderTop: "1px dashed",
            borderColor: (theme) => alpha(theme.palette.divider, 0.5),
          }}
        >
          <EventIcon sx={{ mr: 0.5, fontSize: "0.875rem" }} />
          <Typography variant="caption">
            Đăng ngày: {job.createdAt ? new Date(job.createdAt).toLocaleDateString("vi-VN") : 'N/A'}
          </Typography>
        </Box>
      </CardContent>

      {/* Phần Actions - Sẽ tự động bị đẩy xuống dưới cùng */}
      {/* Bỏ mt: 'auto' nếu dùng flexGrow ở CardContent */}
      <CardActions
        sx={{
          justifyContent: "space-between",
          px: 3,
          pb: 2,
          pt: 0,
          /* mt: 'auto' */
        }}
      >
        {/* Nút Lưu/Bỏ lưu */}
        {onUnsave ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onUnsave(job._id)}
            startIcon={<BookmarkRemoveIcon />}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
            }}
          >
            Bỏ lưu
          </Button>
        ) : (
          showSaveButton && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<BookmarkBorderIcon />}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
              }}
            >
              Lưu tin
            </Button>
          )
        )}
        <Button
          size="small"
          variant="contained"
          component={RouterLink}
          to={`/jobs/${job._id}`}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            boxShadow: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  )
}

JobCard.propTypes = {
  job: PropTypes.object.isRequired,
  showSaveButton: PropTypes.bool,
  onUnsave: PropTypes.func,
}

export default JobCard

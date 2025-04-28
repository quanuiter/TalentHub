import { Link as RouterLink } from "react-router-dom" // Để link đến trang công ty/jobs của công ty
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Link from "@mui/material/Link" // MUI Link
import Avatar from "@mui/material/Avatar" // Dùng Avatar để hiển thị logo tròn/vuông đẹp hơn
import ArrowForwardIcon from "@mui/icons-material/ArrowForward" // Icon mũi tên
import Divider from "@mui/material/Divider" // Để tạo đường phân cách giữa các phần trong card
import BusinessIcon from "@mui/icons-material/Business"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import WorkIcon from "@mui/icons-material/Work"
import { alpha } from "@mui/material/styles"

function CompanyCard({ company }) {
  if (!company) return null

  // Link giả định đến trang chi tiết công ty hoặc danh sách jobs của công ty
  const companyLink = `/companies/${company.id}/jobs` // Hoặc /companies/${company.id}

  return (
    // height: '100%' RẤT QUAN TRỌNG để các card bằng chiều cao trong Grid
    <Card
      sx={{
        height: "280px", // Fixed height for all cards
        width: "100%", // Take full width of grid item
        display: "flex",
        flexDirection: "column",
        p: 2,
        textAlign: "center",
        borderRadius: 2,
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        },
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Phần Logo */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          height: "90px", // Fixed height
          position: "relative",
        }}
      >
        {/* Dùng Avatar để dễ tùy chỉnh shape, size */}
        <Avatar
          src={company.logoUrl}
          alt={`${company.name} logo`}
          variant="rounded" // hoặc "square", "circular"
          sx={{
            width: 80,
            height: 80,
            objectFit: "contain",
            bgcolor: "#f5f5f5",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "2px solid",
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          }} // Thêm bgcolor nền nếu ảnh trong suốt
        >
          {/* Fallback nếu không có logo */}
          {!company.logoUrl && <BusinessIcon sx={{ fontSize: 40 }} />}
        </Avatar>

        {/* Badge hiển thị số lượng jobs */}
        <Chip
          label={`${company.jobCount} Jobs`}
          size="small"
          color="primary"
          sx={{
            position: "absolute",
            top: -10,
            right: 0,
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
          icon={<WorkIcon />}
        />
        {/* Hoặc dùng img nếu muốn đơn giản:
         <img src={company.logoUrl || "/placeholder.svg"} alt={`${company.name} logo`} style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
         */}
      </Box>

      {/* Phần Content chính */}
      {/* flexGrow: 1 giúp đẩy phần job count xuống dưới */}
      <CardContent sx={{ flexGrow: 1, p: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            height: "2.8em", // Fixed height
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.4,
            color: "text.primary",
            mb: 2,
            "&:hover": {
              color: "primary.main",
            },
            transition: "color 0.2s ease",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          <Link component={RouterLink} to={`/companies/${company.id}`} underline="none" color="inherit">
            {company.name}
          </Link>
        </Typography>

        {/* Locations với icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            color: "text.secondary",
            height: "24px", // Fixed height
            overflow: "hidden",
          }}
        >
          <LocationOnIcon sx={{ mr: 0.5, fontSize: "1rem" }} />
          <Typography variant="body2" noWrap sx={{ maxWidth: "90%" }}>
            {company.locations}
          </Typography>
        </Box>

        {/* Tech Stack */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 0.8,
            mb: 2,
            height: "60px", // Fixed height
            overflow: "hidden",
          }}
        >
          {company.techStack.slice(0, 5).map(
            (
              tech, // Giới hạn 5 tech hiển thị
            ) => (
              <Chip
                label={tech}
                key={tech}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "12px",
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  color: "text.primary",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  "&:hover": {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              />
            ),
          )}
          {company.techStack.length > 5 && (
            <Chip
              label="..."
              size="small"
              variant="outlined"
              sx={{
                borderRadius: "12px",
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            />
          )}
        </Box>
      </CardContent>

      {/* Phần Job Count */}
      {/* mt: 'auto' cũng giúp đẩy xuống dưới cùng của flex container */}
      
    </Card>
  )
}

export default CompanyCard

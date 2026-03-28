import { Box, Typography } from "@mui/material";

const TabButtonComp = ({ active, label, onClick }) => {
    return (
        <Box
            className="rounded-full"
            onClick={onClick}
            sx={{
                px: 2.5,
                py: 1,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                bgcolor: active ? "#415EDE" : "#FFFFFF",
                color: active ? "#FFFFFF" : "#000000",
                border: "1px solid #e0e0e0",
                "&:hover": {
                    bgcolor: active ? "#415EDE" : "#f5f5f5",
                },
            }}
        >
            <Typography variant="body2" fontWeight={active ? 600 : 500}>
                {label}
            </Typography>
        </Box>
    );
};

export default TabButtonComp;
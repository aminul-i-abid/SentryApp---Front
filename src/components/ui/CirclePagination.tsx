import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Box, IconButton, useTheme } from "@mui/material";

type CirclePaginationProps = {
  /** Total number of items */
  count: number;
  /** Current page (0-indexed) */
  page: number;
  /** Items per page */
  rowsPerPage: number;
  /** Called when the page changes */
  onPageChange: (event: unknown, newPage: number) => void;
};

/**
 * Reusable circle-style pagination component.
 *
 * Renders page numbers inside circles with first/last navigation arrows
 * and an ellipsis for large page ranges.
 */
function CirclePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: CirclePaginationProps) {
  const theme = useTheme();
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const isDark = theme.palette.mode === "dark";

  const activeColor = "#415EDE";
  const circleSize = 36;

  // --- page number logic ---
  const buildPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always include first page
    pages.push(0);

    if (page <= 2) {
      // Near start: 0 1 2 ... last
      pages.push(1, 2, "ellipsis", totalPages - 1);
    } else if (page >= totalPages - 3) {
      // Near end: 0 ... n-3 n-2 n-1
      pages.push("ellipsis", totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      // Middle: 0 ... page-1 page page+1 ... last
      pages.push(
        "ellipsis",
        page - 1,
        page,
        page + 1,
        "ellipsis",
        totalPages - 1,
      );
    }

    return pages;
  };

  const pageNumbers = buildPageNumbers();

  // --- styles ---
  const circleBase = {
    width: circleSize,
    height: circleSize,
    minWidth: circleSize,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "all 0.15s ease",
    border: "1.5px solid",
  };

  const activeStyle = {
    ...circleBase,
    backgroundColor: activeColor,
    color: "#fff",
    borderColor: activeColor,
  };

  const inactiveStyle = {
    ...circleBase,
    backgroundColor: "transparent",
    color: isDark ? "#ccc" : "#6b7280",
    borderColor: isDark ? "#555" : "#D1D5DB",
    "&:hover": {
      backgroundColor: isDark ? "#333" : "#F3F4F6",
    },
  };

  const ellipsisStyle = {
    ...circleBase,
    backgroundColor: "transparent",
    color: isDark ? "#888" : "#9CA3AF",
    borderColor: isDark ? "#555" : "#D1D5DB",
    cursor: "default",
  };

  const arrowBtnSx = {
    width: circleSize,
    height: circleSize,
    minWidth: circleSize,
    borderRadius: "50%",
    border: `1.5px solid ${isDark ? "#555" : "#D1D5DB"}`,
    color: isDark ? "#ccc" : "#6b7280",
    "&:hover": {
      backgroundColor: isDark ? "#333" : "#F3F4F6",
    },
    "&.Mui-disabled": {
      borderColor: isDark ? "#444" : "#E5E7EB",
      color: isDark ? "#555" : "#D1D5DB",
    },
  };

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        py: 1,
        marginTop: 1,
      }}
    >
      {/* First page */}
      <IconButton
        size="small"
        disabled={page === 0}
        onClick={(e) => onPageChange(e, 0)}
        sx={arrowBtnSx}
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>

      {/* Page numbers */}
      {pageNumbers.map((item, idx) =>
        item === "ellipsis" ? (
          <Box key={`ellipsis-${idx}`} sx={ellipsisStyle}>
            ···
          </Box>
        ) : (
          <Box
            key={item}
            onClick={(e) => onPageChange(e, item)}
            sx={item === page ? activeStyle : inactiveStyle}
          >
            {pad(item)}
          </Box>
        ),
      )}

      {/* Last page */}
      <IconButton
        size="small"
        disabled={page === totalPages - 1}
        onClick={(e) => onPageChange(e, totalPages - 1)}
        sx={arrowBtnSx}
      >
        <LastPageIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default CirclePagination;

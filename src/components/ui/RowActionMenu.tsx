import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface ActionMenuItem {
  /** Unique key */
  key: string;
  /** Label text */
  label: string;
  /** MUI icon element */
  icon?: React.ReactNode;
  /** If true, renders a Switch toggle instead of a click action */
  toggle?: boolean;
  /** Current checked state for toggle items */
  checked?: boolean;
  /** Click handler (or toggle handler) */
  onClick?: () => void;
  /** Text color override (e.g. "error.main" for delete) */
  color?: string;
  /** Whether to show a divider above this item */
  dividerAbove?: boolean;
  /** Hide this item conditionally */
  hidden?: boolean;
}

export interface RowActionMenuProps {
  /** Called when the eye/view icon is clicked */
  onView?: () => void;
  /** Custom icon to replace the default eye/view icon */
  viewIcon?: React.ReactNode;
  /** Menu items for the three-dot popup */
  menuItems: ActionMenuItem[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const RowActionMenu: React.FC<RowActionMenuProps> = ({
  onView,
  viewIcon,
  menuItems,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e?: React.MouseEvent | React.SyntheticEvent) => {
    e?.stopPropagation?.();
    setAnchorEl(null);
  };

  const visibleItems = menuItems.filter((item) => !item.hidden);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 1,
      }}
    >
      {/* Eye / View icon */}
      {onView && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          sx={{
            color: "#94A3B8",
            bgcolor: "#fff",
            border: "1.5px solid #E5E7EB",
            width: 34,
            height: 34,
            borderRadius: "10px",
            "&:hover": {
              color: "#415EDE",
              bgcolor: "#fff",
              borderColor: "#415EDE",
            },
          }}
        >
          {viewIcon || <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      )}

      {/* Three-dot menu icon */}
      {visibleItems.length > 0 && (
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            color: "#94A3B8",
            bgcolor: "#fff",
            border: "1.5px solid #E5E7EB",
            width: 34,
            height: 34,
            borderRadius: "10px",
            "&:hover": {
              color: "#415EDE",
              bgcolor: "#fff",
              borderColor: "#415EDE",
            },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}

      {/* Popup menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "18px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              bgcolor: "#F3F4F6",
              border: "1px solid #E5E7EB",
              minWidth: 240,
              p: 1,
              "& .MuiList-root": {
                p: 0,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              },
            },
          },
        }}
      >
        {visibleItems.map((item) => [
          item.dividerAbove && (
            <Divider
              key={`divider-${item.key}`}
              sx={{ my: 0.25, mx: 0, borderColor: "#E5E7EB" }}
            />
          ),
          item.toggle ? (
            <MenuItem
              key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick?.();
              }}
              sx={{
                py: 1.25,
                px: 2,
                borderRadius: "12px",
                bgcolor: "#fff",
                border: "1px solid #F0F0F0",
                "&:hover": { bgcolor: "#FAFAFA" },
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    color: item.color || "#64748B",
                    minWidth: 34,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: item.color || "text.primary" }}
                >
                  {item.label}
                </Typography>
              </ListItemText>
              <Switch
                size="small"
                checked={item.checked ?? false}
                onChange={(e) => {
                  e.stopPropagation();
                  item.onClick?.();
                }}
                sx={{
                  ml: 2,
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#415EDE",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#415EDE",
                  },
                }}
              />
            </MenuItem>
          ) : (
            <MenuItem
              key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick?.();
                handleMenuClose();
              }}
              sx={{
                py: 1.25,
                px: 2,
                borderRadius: "12px",
                bgcolor: "#fff",
                border: "1px solid #F0F0F0",
                "&:hover": { bgcolor: "#FAFAFA" },
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    color: item.color || "#64748B",
                    minWidth: 34,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: item.color || "text.primary" }}
                >
                  {item.label}
                </Typography>
              </ListItemText>
            </MenuItem>
          ),
        ])}
      </Menu>
    </Box>
  );
};

export default RowActionMenu;

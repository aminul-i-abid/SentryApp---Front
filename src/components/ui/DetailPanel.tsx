import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DetailPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Panel title */
  title: string;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Empty / not-found message */
  emptyMessage?: string;
  /** Whether the main data object is present (controls empty state) */
  hasData?: boolean;
  /** Optional back button handler */
  onBack?: () => void;
  /** Panel body content */
  children?: React.ReactNode;
  /** Extra content rendered after the drawer (modals, dialogs, etc.) */
  extraContent?: React.ReactNode;
  /** Drawer width (default: responsive) */
  width?: { xs?: string; sm?: string; md?: string } | string;
  /** Max width (default: 520px) */
  maxWidth?: string | number;
}

/* ------------------------------------------------------------------ */
/*  Section sub-component                                              */
/* ------------------------------------------------------------------ */

export interface DetailSectionProps {
  /** Section title */
  title: string;
  /** Optional subtitle / description below the title */
  subtitle?: string;
  /** Right-side action element (e.g. "Show All" link) */
  action?: React.ReactNode;
  /** Section body */
  children?: React.ReactNode;
  /** Hide the bottom dotted separator (e.g. for the last section) */
  hideSeparator?: boolean;
}

/**
 * A titled section inside the DetailPanel.
 */
export function DetailSection({
  title,
  subtitle,
  action,
  children,
  hideSeparator = false,
}: DetailSectionProps) {
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid #F0F0F0",
        p: 2.5,
        mb: 0,
        // Dotted separator between sections with vertical breathing room
        ...(!hideSeparator && {
          pb: 3.5,
          mb: 2.5,
          borderBottom: "2px dashed #C5CAD4",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: children ? 2 : 0,
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.95rem" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: "#94A3B8", display: "block", mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Info row sub-component                                             */
/* ------------------------------------------------------------------ */

export interface InfoRowProps {
  /** Small icon element */
  icon?: React.ReactNode;
  /** Label text */
  label: string;
  /** Value text */
  value: React.ReactNode;
}

/**
 * A single label-value pair with an optional leading icon.
 * Use inside a <Grid> or flex container.
 */
export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
      {icon && (
        <Box sx={{ color: "#94A3B8", mt: 0.25, fontSize: 16, display: "flex" }}>
          {icon}
        </Box>
      )}
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "#94A3B8", lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3 }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini-card sub-component                                            */
/* ------------------------------------------------------------------ */

export interface MiniCardProps {
  /** Accent color on the left border */
  accentColor?: string;
  /** Card header (icon + title) */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Title color override */
  titleColor?: string;
  /** Card body */
  children?: React.ReactNode;
  /** Right-side action element */
  action?: React.ReactNode;
}

/**
 * A small card used inside sections (lock activity, reservations, contractor history, etc.)
 */
export function MiniCard({
  accentColor = "#415EDE",
  icon,
  title,
  titleColor,
  children,
  action,
}: MiniCardProps) {
  return (
    <Box
      sx={{
        bgcolor: "#FBFCFE",
        border: "1px solid #E8E8EB",
        borderRadius: "14px",
        position: "relative",
        overflow: "hidden",
        pl: 1,
      }}
    >
      {/* Left accent bar */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: "#fafafa",
        }}
      />
      <Box sx={{ p: 2, pl: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: children ? 1.5 : 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #E6EEF9",
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#000",
                fontSize: "0.9rem",
              }}
            >
              {title}
            </Typography>
          </Box>
          {action}
        </Box>
        {/* Body */}
        {children}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DetailPanel component                                         */
/* ------------------------------------------------------------------ */

function DetailPanel({
  open,
  onClose,
  title,
  loading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No data found",
  hasData = true,
  onBack,
  children,
  extraContent,
  width,
  maxWidth = 520,
}: DetailPanelProps) {
  const drawerWidth = width || { xs: "100%", sm: "480px", md: "520px" };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            },
          },
        }}
        sx={{
          zIndex: 1200,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            maxWidth,
            boxShadow: "-8px 0 30px rgba(0,0,0,0.12)",
            bgcolor: "#F3F4F6",
            border: "none",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* ---- Header ---- */}
          <Box
            sx={{
              bgcolor: "#fff",
              px: 3,
              py: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #F0F0F0",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {onBack && (
                <IconButton
                  onClick={onBack}
                  size="small"
                  sx={{
                    color: "#64748B",
                    "&:hover": { bgcolor: "#F5F6FA" },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "1.1rem" }}
              >
                {title}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "#EF4444",
                bgcolor: "#FEF2F2",
                border: "1px solid #FECACA",
                width: 32,
                height: 32,
                "&:hover": { bgcolor: "#FEE2E2" },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* ---- Body ---- */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  gap: 2,
                }}
              >
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                  {loadingMessage}
                </Typography>
              </Box>
            ) : hasData ? (
              children
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                }}
              >
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Extra content (modals / dialogs) rendered outside the drawer */}
      {extraContent}
    </>
  );
}

export default DetailPanel;

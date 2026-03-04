import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog requests to close */
  onClose: () => void;
  /** Title shown at the top of the dialog */
  title: string;
  /** Label for the submit button (default "Submit Info") */
  submitLabel?: string;
  /** Label for the cancel button (default "Cancel") */
  cancelLabel?: string;
  /** Whether to show loading spinner on submit button */
  loading?: boolean;
  /** Whether the submit button is disabled */
  submitDisabled?: boolean;
  /** Called when user clicks submit */
  onSubmit?: () => void;
  /** Max width of the dialog (default "sm") */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Dialog content */
  children: React.ReactNode;
  /** Hide the action buttons (if you want custom footer inside children) */
  hideActions?: boolean;
  /** Render as a right-side drawer instead of centered dialog */
  variant?: "dialog" | "drawer";
}

/* ------------------------------------------------------------------ */
/*  Shared inner content                                               */
/* ------------------------------------------------------------------ */
const DialogInner: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  hideActions: boolean;
  cancelLabel: string;
  submitLabel: string;
  loading: boolean;
  submitDisabled: boolean;
  onSubmit?: () => void;
  variant?: "dialog" | "drawer";
}> = ({
  title,
  onClose,
  children,
  hideActions,
  cancelLabel,
  submitLabel,
  loading,
  submitDisabled,
  onSubmit,
  variant = "dialog",
}) => (
  <>
    {/* ---- Header ---- */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        pt: 3,
        pb: 1,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        {title}
      </Typography>
      <IconButton
        onClick={onClose}
        size="small"
        sx={(t) => ({
          border: `1px solid ${t.palette.mode === "dark" ? "#444" : "#E5E7EB"}`,
          width: 36,
          height: 36,
        })}
      >
        <CloseIcon fontSize="small" sx={{ color: "red" }} />
      </IconButton>
    </Box>

    {/* ---- Content ---- */}
    <Box
      sx={{
        px: 2,
        pt: 2,
        pb: hideActions ? 3 : 2,
        // In drawer variant we don't want the content to flex-grow and push
        // actions to the bottom of the drawer. Instead limit height and
        // allow internal scrolling so actions appear right after fields.
        flex: variant === "drawer" ? "0 0 auto" : 1,
        overflowY: variant === "drawer" ? "auto" : "auto",
        maxHeight: variant === "drawer" ? "calc(100vh - 220px)" : undefined,
        backgroundColor: "#F7F7F7",
        m: 2,
        borderRadius: 2,
        // ── Global input styles for all children ──
        "&& .MuiInputBase-root": {
          backgroundColor: "#fff",
        },
        "&& .MuiOutlinedInput-root": {
          backgroundColor: "#fff",
          "&:hover": { backgroundColor: "#fff" },
          "&.Mui-focused": { backgroundColor: "#fff" },
        },
        "&& .MuiFilledInput-root": {
          backgroundColor: "#fff",
          "&:hover": { backgroundColor: "#fff" },
          "&.Mui-focused": { backgroundColor: "#fff" },
        },
        "&& .MuiSelect-select": {
          backgroundColor: "#fff",
        },
        "&& .MuiInputBase-input": {
          "&::placeholder": { color: "#9CA3AF", opacity: 1 },
          "&::-webkit-input-placeholder": { color: "#9CA3AF", opacity: 1 },
          "&::-moz-placeholder": { color: "#9CA3AF", opacity: 1 },
        },
        "&& .MuiNativeSelect-select": {
          backgroundColor: "#fff",
        },
      }}
    >
      {children}
      {/* ---- Actions ---- */}
      {!hideActions && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.primary",
              px: 3,
              py: 2.5,
              borderRadius: "30px",
              backgroundColor: "white",
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={loading || submitDisabled}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "30px",
              backgroundColor: "#415EDE",
              px: 3,
              py: 2.5,
              color: "#fff",
              "&:hover": { backgroundColor: "#3347b8" },
              "&.Mui-disabled": {
                backgroundColor: "#a0b0f0",
                color: "#fff",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              submitLabel
            )}
          </Button>
        </Box>
      )}
    </Box>
  </>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  submitLabel = "Submit Info",
  cancelLabel = "Cancel",
  loading = false,
  submitDisabled = false,
  onSubmit,
  maxWidth = "sm",
  children,
  hideActions = false,
  variant = "dialog",
}) => {
  const innerProps = {
    title,
    onClose,
    hideActions,
    cancelLabel,
    submitLabel,
    loading,
    submitDisabled,
    onSubmit,
    children,
    variant,
  };

  if (variant === "drawer") {
    return (
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
        PaperProps={{
          sx: (t) => ({
            width: { xs: "100%", sm: 520, md: 560 },
            maxWidth: "100%",
            borderRadius: 0,
            p: 0,
            backgroundColor: t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
            boxShadow: "-8px 0 30px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }),
        }}
      >
        <DialogInner {...innerProps} />
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      }}
    >
      <DialogInner {...innerProps} />
    </Dialog>
  );
};

export default FormDialog;

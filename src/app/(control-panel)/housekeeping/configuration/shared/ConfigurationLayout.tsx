import React, { useState } from 'react';
import {
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfigurationNavigation from './ConfigurationNavigation';
import ConfigurationBreadcrumbs from './ConfigurationBreadcrumbs';

/**
 * Main layout wrapper for configuration section
 * Provides consistent layout for all configuration screens
 * - Left sidebar navigation (desktop) / drawer navigation (mobile)
 * - Main content area
 * - Top breadcrumbs
 * - Responsive: sidebar collapses to drawer on mobile
 * - Active navigation highlighting based on current route
 */

interface ConfigurationLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;
const MOBILE_BREAKPOINT = 'md';

const ConfigurationLayout: React.FC<ConfigurationLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  /**
   * Handle navigation to a new path
   */
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  /**
   * Render drawer/sidebar content
   */
  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        pt: isMobile ? 2 : 3,
        px: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          px: 2,
          mb: 2,
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        Configuration
      </Typography>
      <ConfigurationNavigation
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar with menu button */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Configuration
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            backgroundColor: 'background.default',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{
            keepMounted: false,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: 'background.default',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configuration
            </Typography>
            <IconButton
              onClick={() => setMobileDrawerOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {drawerContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isMobile ? 2 : 3,
          pt: isMobile ? 10 : 3,
          backgroundColor: 'background.paper',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Breadcrumbs */}
        <ConfigurationBreadcrumbs />

        {/* Page content */}
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ConfigurationLayout;

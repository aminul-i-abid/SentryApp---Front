import React, { useMemo } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RuleIcon from '@mui/icons-material/Rule';

/**
 * Reusable navigation component for configuration section
 * Displays navigation items with icons and labels
 * Can be used in sidebar or drawer
 */

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface ConfigurationNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const ConfigurationNavigation: React.FC<ConfigurationNavigationProps> = ({
  currentPath,
  onNavigate,
}) => {
  /**
   * Define navigation items
   */
  const navigationItems: NavigationItem[] = useMemo(
    () => [
      {
        id: 'templates',
        label: 'Templates',
        icon: <AssignmentIcon />,
        path: '/housekeeping/templates',
      },
      {
        id: 'rules',
        label: 'Rules',
        icon: <RuleIcon />,
        path: '/housekeeping/rules',
      },
    ],
    []
  );

  /**
   * Check if item is currently active
   */
  const isItemActive = (itemPath: string): boolean => {
    return currentPath.startsWith(itemPath);
  };

  /**
   * Handle navigation item click
   */
  const handleItemClick = (path: string) => {
    onNavigate(path);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <List component="nav" sx={{ py: 1 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={isItemActive(item.path)}
            onClick={() => handleItemClick(item.path)}
            sx={{
              py: 1.5,
              px: 2,
              mb: 0.5,
              borderRadius: 1,
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isItemActive(item.path) ? 'primary.main' : 'inherit',
                transition: 'color 0.2s ease-in-out',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: isItemActive(item.path) ? 500 : 400,
              }}
              sx={{
                '& .MuiTypography-root': {
                  transition: 'font-weight 0.2s ease-in-out',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default ConfigurationNavigation;

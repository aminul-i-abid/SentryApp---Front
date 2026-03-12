import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

/**
 * Breadcrumb navigation component for configuration section
 * Displays: Home > Housekeeping > Configuration > [Current Screen]
 */

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface ConfigurationBreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const ConfigurationBreadcrumbs: React.FC<ConfigurationBreadcrumbsProps> = ({ items = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Generate breadcrumb items based on current pathname
   */
  const breadcrumbItems = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];

    // Map path segments to breadcrumb labels
    const pathLabelMap: Record<string, string> = {
      housekeeping: 'Housekeeping',
      configuration: 'Configuration',
      templates: 'Templates',
      rules: 'Rules',
      categories: 'Categories',
    };

    // Build breadcrumbs from path parts
    let currentPath = '';
    pathParts.forEach((part) => {
      currentPath += `/${part}`;
      const label = pathLabelMap[part];
      if (label && part !== 'control-panel') {
        generatedItems.push({ label, path: currentPath });
      }
    });

    return generatedItems.length > 0 ? generatedItems : items;
  }, [location.pathname, items]);

  /**
   * Handle breadcrumb link click
   */
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  /**
   * Get the last breadcrumb item (current page)
   */
  const currentPage = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" separator="/">
        {/* Home button */}
        <Link
          component="button"
          variant="body2"
          onClick={() => handleNavigate('/dashboard')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <HomeIcon sx={{ fontSize: '1.2rem' }} />
          Home
        </Link>

        {/* Breadcrumb items */}
        {breadcrumbItems.slice(0, -1).map((item, index) => (
          <Link
            key={`${item.path}-${index}`}
            component="button"
            variant="body2"
            onClick={() => handleNavigate(item.path)}
            sx={{
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {item.label}
          </Link>
        ))}

        {/* Current page (non-clickable) */}
        {currentPage && (
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
            {currentPage.label}
          </Typography>
        )}
      </Breadcrumbs>
    </Box>
  );
};

export default ConfigurationBreadcrumbs;

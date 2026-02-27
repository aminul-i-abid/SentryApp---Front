import React from 'react';
import { Button, Box } from '@mui/material';
import { Download } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface DownloadButtonProps {
  totalSelected: number;
  onDownload: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  totalSelected,
  onDownload
}) => {
  const theme = useTheme();

  return (
    <Box display="flex" justifyContent="center" pt={4}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<Download />}
        onClick={onDownload}
        disabled={totalSelected === 0}
        sx={{
          borderRadius: 1,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&:disabled': {
            backgroundColor: '#e5e7eb',
            color: '#9ca3af',
          }
        }}
      >
        {totalSelected > 0
          ? `Descargar Excel (${totalSelected} opción${totalSelected !== 1 ? 'es' : ''})`
          : 'Selecciona opciones para descargar'
        }
      </Button>
    </Box>
  );
};

export default DownloadButton;
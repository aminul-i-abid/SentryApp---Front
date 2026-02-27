import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

interface LoadingScreenProps {
  open: boolean;
  message?: string;
  showBackdrop?: boolean;
}

// Animación de pulso para el spinner
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animación de fade in para el texto
const fadeInAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: theme.zIndex.modal + 1000,
  backdropFilter: 'blur(8px)',
}));

const LoadingContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${fadeInAnimation} 0.6s ease-out`,
}));

const SpinnerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
}));

const MessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  textAlign: 'center',
  maxWidth: 400,
  fontSize: '1.1rem',
  fontWeight: 400,
  lineHeight: 1.5,
  opacity: 0.9,
  animation: `${fadeInAnimation} 0.8s ease-out 0.2s both`,
}));

const SubMessageText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: 300,
  fontSize: '0.9rem',
  fontWeight: 300,
  marginTop: theme.spacing(1),
  opacity: 0.7,
  animation: `${fadeInAnimation} 0.8s ease-out 0.4s both`,
}));

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  open, 
  message = 'Procesando...', 
  showBackdrop = true 
}) => {
  if (!open) return null;

  return (
    <>
      {showBackdrop && (
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.modal + 999,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
          open={open}
        />
      )}
      <LoadingContainer>
        <LoadingContent>
          <SpinnerContainer>
            <CircularProgress 
              size={80} 
              thickness={3}
              sx={{
                color: (theme) => theme.palette.primary.main,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
          </SpinnerContainer>
          <MessageText variant="h5">
            {message}
          </MessageText>
          <SubMessageText variant="body2">
            Por favor, no cierre esta ventana
          </SubMessageText>
        </LoadingContent>
      </LoadingContainer>
    </>
  );
};

export default LoadingScreen; 
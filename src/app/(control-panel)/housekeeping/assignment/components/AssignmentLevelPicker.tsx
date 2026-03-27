import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { alpha, useTheme } from '@mui/material/styles';
import type { AssignmentLevel } from '@/store/housekeeping/housekeepingTypes';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssignmentLevelPickerProps {
  selectedLevel: AssignmentLevel;
  onLevelChange: (level: AssignmentLevel) => void;
  campName: string;
  disabled?: boolean;
}

// ─── Card definition ──────────────────────────────────────────────────────────

interface LevelCardDef {
  value: AssignmentLevel;
  label: string;
  description: (campName: string) => string;
  icon: React.ReactNode;
}

const LEVEL_CARDS: LevelCardDef[] = [
  {
    value: 'camp',
    label: 'Campamento Completo',
    description: (campName) => `Asigna todas las habitaciones de ${campName}`,
    icon: <BusinessIcon fontSize="large" />,
  },
  {
    value: 'block',
    label: 'Por Pabellón',
    description: () => 'Asigna habitaciones de un pabellón específico',
    icon: <ApartmentIcon fontSize="large" />,
  },
  {
    value: 'rooms',
    label: 'Habitaciones Específicas',
    description: () => 'Selecciona habitaciones individuales',
    icon: <MeetingRoomIcon fontSize="large" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AssignmentLevelPicker: React.FC<AssignmentLevelPickerProps> = ({
  selectedLevel,
  onLevelChange,
  campName,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        border: '8px solid #f7f7f7',
        borderRadius: "6px",
        backgroundColor: "#f7f7f7",
        padding: 1
      }}
    >
      {LEVEL_CARDS.map((card) => {
        const isSelected = selectedLevel === card.value;

        return (
          <Card
            key={card.value}
            sx={{
              flex: 1,
              bgcolor: "#fff",
              transition: 'border-color 0.2s, background-color 0.2s',
              opacity: disabled ? 0.6 : 1,
              boxShadow: "none",
              borderRadius: "6px",
              border: isSelected ? "2px solid #415EDE" : "2px solid #f7f7f7",
              "&:hover": {
                bgcolor: "#f7f7f7",
                cursor: "pointer",
              }
            }}
          >
            <CardActionArea
              onClick={() => {
                if (!disabled) {
                  onLevelChange(card.value);
                }
              }}
              disabled={disabled}
              sx={{ height: '100%' }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 1,
                  py: 3,
                }}
              >
                <Box
                  sx={{
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.2s',
                  }}
                >
                  {card.icon}
                </Box>

                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color={isSelected ? 'primary.main' : 'text.primary'}
                >
                  {card.label}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {card.description(campName)}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
};

export default AssignmentLevelPicker;

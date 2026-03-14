import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { genericService } from '@/utils/apiService';
import type { OperatorOption } from '@/store/housekeeping/housekeepingTypes';

// ─── Local search result shape returned by /Users/search-by-rut/ ──────────────

interface UserSearchResult {
  id: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  email?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface OperatorMultiSelectorProps {
  campId: string;
  selectedOperators: OperatorOption[];
  onOperatorsChange: (operators: OperatorOption[]) => void;
  disabled?: boolean;
}

// ─── Helper: convert search result to OperatorOption ──────────────────────────

function toOperatorOption(result: UserSearchResult): OperatorOption {
  const fullName = [result.firstName, result.lastName].filter(Boolean).join(' ');
  return {
    id: result.id,
    fullName: fullName || result.dni || result.id,
    rut: result.dni ?? '',
    email: result.email ?? '',
  };
}

// ─── Helper: compute Avatar initials ──────────────────────────────────────────

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

const OperatorMultiSelector: React.FC<OperatorMultiSelectorProps> = ({
  selectedOperators,
  onOperatorsChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [options, setOptions] = useState<OperatorOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Debounced search ─────────────────────────────────────────────────────

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      const response = await genericService.get<UserSearchResult[]>(
        `/Users/search-by-rut/${encodeURIComponent(query)}`
      );

      if (response.succeeded && Array.isArray(response.data)) {
        const mapped = response.data.map(toOperatorOption);
        // Filter out already-selected operators
        const filtered = mapped.filter(
          (opt) => !selectedOperators.some((sel) => sel.id === opt.id)
        );
        setOptions(filtered);
      } else {
        setOptions([]);
      }
    } catch {
      setSearchError('Error al buscar operarios. Intente nuevamente.');
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOperators]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (inputValue.length < 3) {
      setOptions([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      void performSearch(inputValue);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, performSearch]);

  // ─── Handle operator selection from Autocomplete ──────────────────────────

  const handleSelectOperator = (
    _event: React.SyntheticEvent,
    newValue: OperatorOption | null
  ) => {
    if (!newValue) return;

    // Prevent duplicates
    const alreadySelected = selectedOperators.some((op) => op.id === newValue.id);
    if (alreadySelected) return;

    onOperatorsChange([...selectedOperators, newValue]);
    setInputValue('');
    setOptions([]);
  };

  // ─── Handle chip deletion ─────────────────────────────────────────────────

  const handleRemoveOperator = (operatorId: string) => {
    onOperatorsChange(selectedOperators.filter((op) => op.id !== operatorId));
  };

  return (
    <Box>
      <Autocomplete<OperatorOption>
        options={options}
        getOptionLabel={(option) =>
          `${option.fullName} — RUT: ${option.rut}`
        }
        inputValue={inputValue}
        value={null}
        onChange={handleSelectOperator}
        onInputChange={(_event, value) => {
          setInputValue(value);
        }}
        filterOptions={(x) => x}
        loading={isLoading}
        loadingText="Buscando..."
        noOptionsText={
          inputValue.length >= 3
            ? `Sin resultados para '${inputValue}'`
            : 'Ingrese al menos 3 caracteres'
        }
        disabled={disabled}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar operario por RUT"
            placeholder="Ingrese RUT o nombre..."
            size="small"
            fullWidth
            error={Boolean(searchError)}
            helperText={searchError ?? undefined}
            sx={{
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover fieldset': {
                  borderColor: '#415EDE',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#415EDE',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#415EDE',
              },
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'white',
              border: '6px solid #f3f4f6',
            },
          },
        }}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id}>
            <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.75rem' }}>
              {getInitials(option.fullName)}
            </Avatar>
            <Box>
              <Typography variant="body2">{option.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                RUT: {option.rut}
              </Typography>
            </Box>
          </Box>
        )}
      />

      {selectedOperators.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mt: 2,
          }}
        >
          {selectedOperators.map((op) => (
            <Chip
              key={op.id}
              label={op.fullName}
              avatar={
                <Avatar>
                  <PersonIcon fontSize="small" />
                </Avatar>
              }
              onDelete={disabled ? undefined : () => handleRemoveOperator(op.id)}
              disabled={disabled}
              size="medium"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OperatorMultiSelector;

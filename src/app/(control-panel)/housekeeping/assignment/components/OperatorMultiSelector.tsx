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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
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
            placeholder="Buscar operario por RUT"
            size="medium"
            fullWidth
            error={Boolean(searchError)}
            helperText={searchError ?? undefined}
            sx={{
              bgcolor: '#F9FAFB',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F9FAFB',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: '#E5E7EB',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E5E7EB',
                  borderWidth: '1px',
                },
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
              border: '1px solid #f3f4f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 3,
          }}
        >
          <Box
            sx={{
              width: '2px',
              height: '36px',
              bgcolor: '#E5E7EB',
              borderRadius: '2px',
              mr: 0.5,
            }}
          />
          {selectedOperators.map((op) => (
            <Chip
              key={op.id}
              label={op.fullName}
              icon={<PersonOutlineIcon style={{ color: '#000000ff', fontSize: '22px', marginLeft: '10px', backgroundColor: "#fff", padding: 2, borderRadius: "4px", marginRight: "2px" }} />}
              deleteIcon={<img src="./assets/icons/cancel-circle.png" className='ml-1 mr-2' alt="" />}
              onDelete={disabled ? undefined : () => handleRemoveOperator(op.id)}
              disabled={disabled}
              sx={{
                bgcolor: '#FAFAFA',
                border: '1px solid #E5E7EB',
                color: '#000',
                fontWeight: 400,
                borderRadius: '8px',
                height: '36px',
                '& .MuiChip-label': {
                  px: 1,
                },
                '& .MuiChip-deleteIcon': {
                  '&:hover': {
                    color: '#6B7280',
                  }
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OperatorMultiSelector;

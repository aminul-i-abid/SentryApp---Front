/**
 * ChecklistItemsEditor Component
 *
 * Advanced drag & drop editor for checklist items
 * - Reorder items via react-beautiful-dnd with automatic displayOrder update
 * - Real-time validation with min 1 item, at least 1 mandatory requirement
 * - Visual feedback for drag operations and validation states
 * - Empty state handling with helpful CTA button
 * - Performance optimized with memoization
 * - Accessibility features (ARIA labels, keyboard navigation)
 *
 * @component
 * @example
 * <ChecklistItemsEditor
 *   items={checklistItems}
 *   onItemsChange={handleItemsChange}
 *   onAddItem={handleAddItem}
 *   errors={validationErrors}
 * />
 */

import React, { useMemo, useCallback, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Button,
  Typography,
  Alert,
  AlertTitle,
  Icon,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ChecklistItemForm from './ChecklistItemForm';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';
import type { HousekeepingTarea } from '@/store/housekeeping/housekeepingTypes';
import { useAppSelector } from '@/store/hooks';

interface ChecklistItemsEditorProps {
  /** Array of checklist items in the template */
  items: ChecklistItemEditor[];
  /** Callback when items order or state changes */
  onItemsChange: (items: ChecklistItemEditor[]) => void;
  /** Callback to add a new item */
  onAddItem: () => void;
  /** Validation errors map for the entire list */
  errors?: Record<string, string>;
  /** Optional disabled state (prevents all interactions) */
  disabled?: boolean;
  /** Optional callback for item-specific changes */
  onItemChange?: (index: number, fieldName: string, value: any) => void;
  /** Optional callback for item removal */
  onRemoveItem?: (index: number) => void;
  /** Optional callback for item duplication */
  onDuplicateItem?: (index: number) => void;
  /** Optional callback to add an item pre-populated from a Tarea maestra */
  onAddItemFromTarea?: (tarea: HousekeepingTarea) => void;
}

/**
 * ChecklistItemsEditor Component
 *
 * Provides a drag-and-drop interface for reordering checklist items
 * with real-time validation and visual feedback.
 * Memoized for performance optimization.
 */
const ChecklistItemsEditor = React.memo<ChecklistItemsEditorProps>(
  ({
    items,
    onItemsChange,
    onAddItem,
    errors = {},
    disabled = false,
    onItemChange,
    onRemoveItem,
    onDuplicateItem,
    onAddItemFromTarea,
  }) => {
    // State for Tareas selection dialog
    const [openTareasDialog, setOpenTareasDialog] = useState(false);

    // Read tareas maestras from Redux store
    const tareas = useAppSelector((state) => state.housekeeping.tareas);

    // Compute validation state for the list
    const validationState = useMemo(() => {
      const activeItems = items.filter((item) => !item.isDeleted);
      const mandatoryItems = activeItems.filter((item) => item.isMandatory);
      const hasMinItems = activeItems.length >= 1;
      const hasMandatoryItem = mandatoryItems.length >= 1;

      return {
        hasMinItems,
        hasMandatoryItem,
        isValid: hasMinItems && hasMandatoryItem,
        itemCount: activeItems.length,
        mandatoryCount: mandatoryItems.length,
      };
    }, [items]);

    // Compute warning messages
    const warnings = useMemo(() => {
      const w: string[] = [];
      if (!validationState.hasMinItems) {
        w.push('Se requiere al menos 1 elemento en la lista');
      }
      if (!validationState.hasMandatoryItem) {
        w.push('Se requiere al menos 1 elemento obligatorio');
      }
      return w;
    }, [validationState]);

    // Handle drag end event
    const handleDragEnd = useCallback(
      (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // If dropped outside a valid zone, do nothing
        if (!destination) return;

        // If dropped in the same position, do nothing
        if (
          source.index === destination.index &&
          source.droppableId === destination.droppableId
        ) {
          return;
        }

        // Create new array with reordered items
        const newItems = Array.from(items);
        const [draggedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, draggedItem);

        // Update order for all items after reorder
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
          isModified: item.isNew ? item.isModified : true,
        }));

        // Call the change handler
        onItemsChange(updatedItems);
      },
      [items, onItemsChange]
    );

    // Handle item change (for form field updates)
    const handleItemChange = useCallback(
      (index: number, fieldName: string, value: any) => {
        if (onItemChange) {
          onItemChange(index, fieldName, value);
        } else {
          // Fallback: update items directly
          const updatedItems = [...items];
          updatedItems[index] = {
            ...updatedItems[index],
            [fieldName]: value,
            isModified: true,
          };
          onItemsChange(updatedItems);
        }
      },
      [items, onItemsChange, onItemChange]
    );

    // Handle item removal (mark as deleted)
    const handleRemoveItem = useCallback(
      (index: number) => {
        if (onRemoveItem) {
          onRemoveItem(index);
        } else {
          // Fallback: mark as deleted
          const updatedItems = [...items];
          updatedItems[index] = {
            ...updatedItems[index],
            isDeleted: true,
            isModified: true,
          };
          onItemsChange(updatedItems);
        }
      },
      [items, onItemsChange, onRemoveItem]
    );

    // Handle item duplication
    const handleDuplicateItem = useCallback(
      (index: number) => {
        if (onDuplicateItem) {
          onDuplicateItem(index);
        } else {
          // Fallback: create a copy
          const itemToDuplicate = items[index];
          const dupTempId = `temp_${crypto.randomUUID()}`;
          const newItem: ChecklistItemEditor = {
            ...itemToDuplicate,
            id: dupTempId,
            tempId: dupTempId,
            order: items.filter((i) => !i.isDeleted).length + 1,
            isNew: true,
            isModified: true,
            isDeleted: false,
            errors: {},
          };
          const updatedItems = [...items, newItem];
          onItemsChange(updatedItems);
        }
      },
      [items, onItemsChange, onDuplicateItem]
    );

    // Empty state UI
    if (items.length === 0 || items.every((item) => item.isDeleted)) {
      return (
        <Box>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: 'action.hover',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
                opacity: 0.5,
              }}
            >
              <Icon sx={{ fontSize: 48 }}>list_alt</Icon>
            </Box>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Sin elementos de verificación
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Comienza agregando elementos a tu plantilla de verificación. Cada elemento
              puede ser obligatorio u opcional.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              {onAddItemFromTarea && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenTareasDialog(true)}
                  disabled={disabled}
                  size="large"
                  sx={{
                    backgroundColor: "#415EDE",
                    color: "white"
                  }}
                >
                  Agregar desde Tareas
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Tareas Selection Dialog (shared — rendered here for empty state) */}
          {onAddItemFromTarea && (
            <Dialog
              open={openTareasDialog}
              onClose={() => setOpenTareasDialog(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: { backgroundColor: 'white' }
              }}
            >
              <DialogTitle sx={{ backgroundColor: 'white' }}>Seleccionar Tarea</DialogTitle>
              <DialogContent sx={{ p: 0, backgroundColor: 'white' }}>
                {tareas.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay tareas de limpieza configuradas. Crea tareas en la sección de Configuración &gt; Tareas.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {tareas.map((tarea) => (
                      <ListItem key={tarea.id} disablePadding divider>
                        <ListItemButton
                          onClick={() => {
                            onAddItemFromTarea(tarea);
                            setOpenTareasDialog(false);
                          }}
                        >
                          <ListItemText
                            primary={tarea.nombre}
                            secondary={tarea.descripcion || undefined}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </DialogContent>
              <DialogActions sx={{ backgroundColor: 'white' }}>
                <Button onClick={() => setOpenTareasDialog(false)}>
                  Cancelar
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </Box>
      );
    }

    // Active items (not deleted)
    const activeItems = items.filter((item) => !item.isDeleted);
    const deletedItems = items.filter((item) => item.isDeleted);

    return (
      <Box>
        {/* Validation Summary */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: validationState.isValid ? 'success.lighter' : 'warning.lighter',
            borderLeft: '4px solid',
            borderColor: validationState.isValid ? 'success.main' : 'warning.main',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            {validationState.isValid ? (
              <CheckCircleIcon color="success" />
            ) : (
              <WarningIcon color="warning" />
            )}
            <Box flex={1}>
              <Typography variant="body2" fontWeight={600}>
                {validationState.itemCount} elemento{validationState.itemCount !== 1 ? 's' : ''}
                {validationState.mandatoryCount > 0 && (
                  <>
                    {' '}
                    ({validationState.mandatoryCount} obligatorio
                    {validationState.mandatoryCount !== 1 ? 's' : ''})
                  </>
                )}
              </Typography>
              {validationState.isValid ? (
                <Typography variant="caption" color="success.dark">
                  ✓ Cumple los requisitos mínimos
                </Typography>
              ) : (
                <Typography variant="caption" color="warning.dark">
                  ⚠ Faltan elementos requeridos
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`Total: ${validationState.itemCount}`}
                size="small"
                variant="outlined"
              />
              {validationState.mandatoryCount > 0 && (
                <Chip
                  label={`Requeridos: ${validationState.mandatoryCount}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Validation Warnings */}
        {warnings.length > 0 && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
            <AlertTitle>Validación incompleta</AlertTitle>
            {warnings.map((warning, index) => (
              <Typography key={index} variant="body2" sx={{ mt: index > 0 ? 1 : 0 }}>
                • {warning}
              </Typography>
            ))}
          </Alert>
        )}

        {/* Info Alert - Drag & Drop Instructions */}
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Instrucciones:</strong> Arrastra los elementos usando el ícono de
            {' '}
            <DragIndicatorIcon sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
            {' '}
            para reordenarlos. El orden se actualizará automáticamente.
          </Typography>
        </Alert>

        {/* Drag & Drop List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="checklist-items" type="ITEM">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  backgroundColor: snapshot.isDraggingOver
                    ? 'action.hover'
                    : 'transparent',
                  borderRadius: 1,
                  transition: 'background-color 0.2s ease',
                  minHeight: '200px',
                }}
              >
                {activeItems.map((item, index) => (
                  <Draggable
                    key={item.tempId || item.id}
                    draggableId={item.tempId || item.id}
                    index={index}
                    isDragDisabled={disabled}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{
                          opacity: snapshot.isDragging ? 0.5 : 1,
                          transition: 'opacity 0.2s ease',
                          mb: 2,
                        }}
                      >
                        <div {...provided.dragHandleProps}>
                          <ChecklistItemForm
                            item={item}
                            index={index}
                            onItemChange={(fieldName, value) =>
                              handleItemChange(index, fieldName, value)
                            }
                            onRemoveItem={() => handleRemoveItem(index)}
                            onDuplicate={() => handleDuplicateItem(index)}
                            errors={errors}
                            disabled={disabled}
                          />
                        </div>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Item Buttons */}
        <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 3, mb: 2, flexWrap: 'wrap' }}>
          {onAddItemFromTarea && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenTareasDialog(true)}
              disabled={disabled}
              size="large"
              sx={{
                backgroundColor: "#415EDE",
                color: "white"
              }}
            >
              Agregar desde Tareas
            </Button>
          )}
        </Box>

        {/* Tareas Selection Dialog */}
        {onAddItemFromTarea && (
          <Dialog
            open={openTareasDialog}
            onClose={() => setOpenTareasDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { backgroundColor: 'white' }
            }}
          >
            <DialogTitle sx={{ backgroundColor: 'white' }}>Seleccionar Tarea</DialogTitle>
            <DialogContent sx={{ p: 0, backgroundColor: 'white' }}>
              {tareas.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay tareas de limpieza configuradas. Crea tareas en la sección de Configuración &gt; Tareas.
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {tareas.map((tarea) => (
                    <ListItem key={tarea.id} disablePadding divider>
                      <ListItemButton
                        onClick={() => {
                          onAddItemFromTarea(tarea);
                          setOpenTareasDialog(false);
                        }}
                      >
                        <ListItemText
                          primary={tarea.nombre}
                          secondary={tarea.descripcion || undefined}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: 'white' }}>
              <Button onClick={() => setOpenTareasDialog(false)}>
                Cancelar
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Deleted Items Section */}
        {deletedItems.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Elementos marcados para eliminar ({deletedItems.length})
            </Typography>
            <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2">
                Los siguientes elementos serán eliminados cuando guardes la plantilla:
              </Typography>
            </Alert>
            {deletedItems.map((item, index) => (
              <Paper
                key={item.tempId || item.id}
                sx={{
                  p: 2,
                  mb: 1,
                  opacity: 0.6,
                  backgroundColor: 'error.lighter',
                  border: '1px dashed',
                  borderColor: 'error.light',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <ErrorIcon color="error" fontSize="small" />
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'textSecondary',
                      flex: 1,
                    }}
                  >
                    #{index + 1} - {item.description || '(Elemento vacío)'}
                  </Typography>
                  <Chip label="Eliminado" size="small" color="error" />
                </Box>
              </Paper>
            ))}
          </>
        )}

        {/* Progress Indicator */}
        {validationState.itemCount > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="textSecondary" display="block" mb={1}>
              Progreso de validación
            </Typography>
            <LinearProgress
              variant="determinate"
              value={validationState.isValid ? 100 : 50}
              sx={{
                height: 8,
                borderRadius: 4,
              }}
            />
          </Box>
        )}
      </Box>
    );
  }
);

ChecklistItemsEditor.displayName = 'ChecklistItemsEditor';

export default ChecklistItemsEditor;

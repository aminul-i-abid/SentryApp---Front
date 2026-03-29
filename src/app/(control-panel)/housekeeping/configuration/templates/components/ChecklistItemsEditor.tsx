/**
 * ChecklistItemsEditor Component - Redesigned to match Image 3
 * Horizontal card grid layout for items, validation summary, progress bar
 */

import React, { useMemo, useCallback, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Button,
  Typography,
  Alert,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ChecklistItemForm from './ChecklistItemForm';
import type { ChecklistItemEditor } from '../types/templateEditorTypes';
import type { HousekeepingTarea } from '@/store/housekeeping/housekeepingTypes';
import { useAppSelector } from '@/store/hooks';

interface ChecklistItemsEditorProps {
  items: ChecklistItemEditor[];
  onItemsChange: (items: ChecklistItemEditor[]) => void;
  onAddItem: () => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  onItemChange?: (index: number, fieldName: string, value: any) => void;
  onRemoveItem?: (index: number) => void;
  onDuplicateItem?: (index: number) => void;
  onAddItemFromTarea?: (tarea: HousekeepingTarea) => void;
}

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
    const [openTareasDialog, setOpenTareasDialog] = useState(false);
    const tareas = useAppSelector((state) => state.housekeeping.tareas);

    const validationState = useMemo(() => {
      const activeItems = items.filter((item) => !item.isDeleted);
      const mandatoryItems = activeItems.filter((item) => item.isMandatory);
      return {
        hasMinItems: activeItems.length >= 1,
        hasMandatoryItem: mandatoryItems.length >= 1,
        isValid: activeItems.length >= 1 && mandatoryItems.length >= 1,
        itemCount: activeItems.length,
        mandatoryCount: mandatoryItems.length,
      };
    }, [items]);

    const handleDragEnd = useCallback(
      (result: DropResult) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        const newItems = Array.from(items);
        const [draggedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, draggedItem);
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
          isModified: item.isNew ? item.isModified : true,
        }));
        onItemsChange(updatedItems);
      },
      [items, onItemsChange]
    );

    const handleItemChange = useCallback(
      (index: number, fieldName: string, value: any) => {
        if (onItemChange) {
          onItemChange(index, fieldName, value);
        } else {
          const updatedItems = [...items];
          updatedItems[index] = { ...updatedItems[index], [fieldName]: value, isModified: true };
          onItemsChange(updatedItems);
        }
      },
      [items, onItemsChange, onItemChange]
    );

    const handleRemoveItem = useCallback(
      (index: number) => {
        if (onRemoveItem) {
          onRemoveItem(index);
        } else {
          const updatedItems = [...items];
          updatedItems[index] = { ...updatedItems[index], isDeleted: true, isModified: true };
          onItemsChange(updatedItems);
        }
      },
      [items, onItemsChange, onRemoveItem]
    );

    const handleDuplicateItem = useCallback(
      (index: number) => {
        if (onDuplicateItem) {
          onDuplicateItem(index);
        } else {
          const itemToDuplicate = items[index];
          const dupTempId = `temp_${crypto.randomUUID()}`;
          const newItem: ChecklistItemEditor = {
            ...itemToDuplicate,
            id: dupTempId,
            tempId: dupTempId,
            order: items.filter((i) => !i.isDeleted).length + 1,
            isNew: true, isModified: true, isDeleted: false, errors: {},
          };
          onItemsChange([...items, newItem]);
        }
      },
      [items, onItemsChange, onDuplicateItem]
    );

    const activeItems = items.filter((item) => !item.isDeleted);

    // Empty state
    if (activeItems.length === 0) {
      return (
        <Box>
          <Box
            sx={{
              p: 6, textAlign: 'center', borderRadius: '12px',
              border: '2px dashed #E5E7EB', bgcolor: 'white',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: '#6B7280' }}>
              Sin elementos de verificación
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              Comienza agregando elementos a tu plantilla de verificación.
            </Typography>
            {onAddItemFromTarea && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenTareasDialog(true)}
                disabled={disabled}
                sx={{
                  bgcolor: '#415EDE', textTransform: 'none', borderRadius: '8px',
                  fontWeight: 500, boxShadow: 'none',
                  '&:hover': { bgcolor: '#354BB1', boxShadow: 'none' },
                }}
              >
                Agregar desde Tareas
              </Button>
            )}
          </Box>

          {/* Tareas Dialog */}
          {onAddItemFromTarea && (
            <Dialog open={openTareasDialog} onClose={() => setOpenTareasDialog(false)} maxWidth="sm" fullWidth
              PaperProps={{ sx: { bgcolor: 'white', borderRadius: '12px' } }}
            >
              <DialogTitle sx={{ bgcolor: 'white' }}>Seleccionar Tarea</DialogTitle>
              <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
                {tareas.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay tareas configuradas.
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {tareas.map((tarea) => (
                      <ListItem key={tarea.id} disablePadding divider>
                        <ListItemButton onClick={() => { onAddItemFromTarea(tarea); setOpenTareasDialog(false); }}>
                          <ListItemText primary={tarea.nombre} secondary={tarea.descripcion || undefined} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </DialogContent>
              <DialogActions sx={{ bgcolor: 'white' }}>
                <Button onClick={() => setOpenTareasDialog(false)}>Cancelar</Button>
              </DialogActions>
            </Dialog>
          )}
        </Box>
      );
    }

    return (
      <Box>
        {/* Validation Summary */}
        <Box
          sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            mb: 3, gap: 2, flexWrap: 'wrap',
            bgcolor: "white",
            p: 1,
            borderRadius: "10px"
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box className="bg-[#FAFAFA] border-1 border-[#F2F2F2] p-1.5 rounded-[6px]">
              <CheckCircleIcon sx={{ color: validationState.isValid ? '#10B981' : '#F59E0B', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                {validationState.itemCount} elemento{validationState.itemCount !== 1 ? 's' : ''}
                {validationState.mandatoryCount > 0 && (
                  <> ({validationState.mandatoryCount} obligatorio{validationState.mandatoryCount !== 1 ? 's' : ''})</>
                )}
              </Typography>
              <Typography variant="caption" sx={{ color: validationState.isValid ? '#686868' : '#D97706' }}>
                {validationState.isValid ? '• Cumple los requisitos mínimos' : '• Faltan elementos requeridos'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography className='bg-[#FAFAFA] border-1 border-[#F7F7F7] p-1.5 rounded-[6px]' variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>Total: {validationState.itemCount}</Typography>
            <Typography className='bg-white border-1 border-[#415EDE1F] p-1.5 rounded-[6px]' variant="body2" sx={{ color: '#415EDE', fontWeight: 600 }}>Requeridos: {validationState.mandatoryCount}</Typography>
          </Box>
        </Box>

        {/* Instructions */}
        <Box
          sx={{
            mb: 3, p: 2, borderRadius: '8px',
            bgcolor: '#415EDE14', border: '1px solid #F2F2F2',
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}
        >
          <img src="./assets/icons/information-diamond.png" alt="" />
          <Typography variant="body2" sx={{ color: '#686868' }}>
            <strong className='text-black'>Instrucciones:</strong> Arrastra los elementos usando el ícono para reordenarlos. El orden se actualizará automáticamente.
          </Typography>
        </Box>

        {/* Section Title + Add Button */}
        <Box className="bg-white px-4 py-6 rounded-[12px]">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              {validationState.itemCount} elemento{validationState.itemCount !== 1 ? 's' : ''}
              {validationState.mandatoryCount > 0 && (
                <> ({validationState.mandatoryCount} obligatorio{validationState.mandatoryCount !== 1 ? 's' : ''})</>
              )}
            </Typography>
            {onAddItemFromTarea && (
              <Button
                variant="outlined"
                endIcon={<img src="./assets/icons/add-01.png" alt="" />}
                onClick={() => setOpenTareasDialog(true)}
                disabled={disabled}
                className='bg-[#F7F7F7]'
                sx={{
                  textTransform: 'none', borderRadius: '8px', fontWeight: 500,
                  color: '#415EDE', borderColor: '#F0F0F0',
                  '&:hover': { borderColor: '#D1D5DB' },
                }}
              >
                Agregar desde Tareas
              </Button>
            )}
          </Box>

          {/* Items Grid (3 columns like Image 3) */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="checklist-items" type="ITEM" direction="horizontal">
              {(provided) => (
                <Grid
                  container
                  spacing={3}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {activeItems.map((item, index) => (
                    <Draggable
                      key={item.tempId || item.id}
                      draggableId={item.tempId || item.id}
                      index={index}
                      isDragDisabled={disabled}
                    >
                      {(provided, snapshot) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Box sx={{ opacity: snapshot.isDragging ? 0.6 : 1 }}>
                            <ChecklistItemForm
                              item={item}
                              index={index}
                              onItemChange={(fieldName, value) => handleItemChange(index, fieldName, value)}
                              onRemoveItem={() => handleRemoveItem(index)}
                              onDuplicate={() => handleDuplicateItem(index)}
                              errors={errors}
                              disabled={disabled}
                            />
                          </Box>
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>

          {/* Progress Bar */}
          {validationState.itemCount > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                Progreso de validación:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={validationState.isValid ? 100 : 50}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: '#FEE2E2',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: validationState.isValid
                      ? 'linear-gradient(91.77deg, #2661EB 54.66%, #F06225 113.08%)'
                      : 'linear-gradient(90deg, #415EDE 0%, #EF4444 100%)',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Tareas Dialog */}
        {onAddItemFromTarea && (
          <Dialog open={openTareasDialog} onClose={() => setOpenTareasDialog(false)} maxWidth="sm" fullWidth
            PaperProps={{ sx: { bgcolor: 'white', borderRadius: '12px' } }}
          >
            <DialogTitle sx={{ bgcolor: 'white' }}>Seleccionar Tarea</DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
              {tareas.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay tareas configuradas.
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {tareas.map((tarea) => (
                    <ListItem key={tarea.id} disablePadding divider>
                      <ListItemButton onClick={() => { onAddItemFromTarea(tarea); setOpenTareasDialog(false); }}>
                        <ListItemText primary={tarea.nombre} secondary={tarea.descripcion || undefined} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'white' }}>
              <Button onClick={() => setOpenTareasDialog(false)}>Cancelar</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    );
  }
);

ChecklistItemsEditor.displayName = 'ChecklistItemsEditor';

export default ChecklistItemsEditor;

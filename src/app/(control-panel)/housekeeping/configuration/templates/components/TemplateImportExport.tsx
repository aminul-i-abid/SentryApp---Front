/**
 * TemplateImportExport Component
 *
 * Advanced import/export functionality for templates
 * - Export button downloads template as JSON file with timestamp
 * - Import file input accepts .json files with validation
 * - Validates imported JSON structure against schema
 * - Shows detailed preview of import before confirming
 * - Comprehensive error handling with helpful messages
 * - Progress indicators during operations
 * - Uses Dialog for confirmation workflow
 * - Supports drag & drop for file import
 *
 * @component
 * @example
 * <TemplateImportExport
 *   template={templateData}
 *   onImport={handleImport}
 *   onExport={handleExport}
 * />
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import ChecklistIcon from '@mui/icons-material/Checklist';
import InfoIcon from '@mui/icons-material/Info';
import type { TemplateExportData, ChecklistItemEditor } from '../types/templateEditorTypes';

interface TemplateImportExportProps {
  /** Template data to export */
  template?: {
    name?: string;
    categoryId?: string;
    priority?: number;
  };
  /** Items to include in export */
  items?: ChecklistItemEditor[];
  /** Callback when import is confirmed */
  onImport?: (data: TemplateExportData) => Promise<void>;
  /** Callback when export is triggered */
  onExport?: (data: TemplateExportData) => Promise<void>;
  /** Current user info for export metadata */
  exportedBy?: string;
  /** Optional CSS class name */
  className?: string;
}

interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: TemplateExportData;
}

/**
 * TemplateImportExport Component
 *
 * Provides import/export functionality with comprehensive validation,
 * preview, and error handling. Memoized for performance.
 */
const TemplateImportExport = React.memo<TemplateImportExportProps>(
  ({
    template = {},
    items = [],
    onImport,
    onExport,
    exportedBy = 'Usuario',
    className,
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importWarnings, setImportWarnings] = useState<string[]>([]);
    const [importPreview, setImportPreview] = useState<TemplateExportData | null>(null);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    // Generate export data structure
    const generateExportData = useCallback((): TemplateExportData => {
      const activeItems = items.filter((item) => !item.isDeleted);
      return {
        version: '1.0.0',
        template: {
          name: template.name || 'Sin nombre',
          categoryId: template.categoryId || '',
          priority: template.priority || 1,
          items: activeItems.map((item) => ({
            description: item.description,
            inputType: item.inputType,
            isMandatory: item.isMandatory,
            order: item.order,
          })),
        },
        exportedAt: new Date().toISOString(),
        exportedBy,
      };
    }, [template, items, exportedBy]);

    // Validate imported JSON structure
    const validateImportData = (data: any): ImportValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check version
      if (!data.version) {
        warnings.push('No se especificó versión del archivo');
      } else if (data.version !== '1.0.0') {
        warnings.push(`Versión diferente: ${data.version}. Puede haber incompatibilidades.`);
      }

      // Check template object
      if (!data.template) {
        errors.push('El archivo no contiene datos de plantilla');
        return { isValid: false, errors, warnings };
      }

      const t = data.template;

      // Validate template name
      if (!t.name || typeof t.name !== 'string') {
        errors.push('El nombre de la plantilla es requerido y debe ser texto');
      } else if (t.name.length < 3 || t.name.length > 100) {
        errors.push('El nombre debe tener entre 3 y 100 caracteres');
      }

      // Validate category
      if (!t.categoryId || typeof t.categoryId !== 'string') {
        errors.push('La categoría es requerida');
      }

      // Validate priority
      if (typeof t.priority !== 'number' || t.priority < 1 || t.priority > 10) {
        errors.push('La prioridad debe ser un número entre 1 y 10');
      }

      // Validate items array
      if (!Array.isArray(t.items)) {
        errors.push('Los elementos deben ser un arreglo');
        return { isValid: false, errors, warnings };
      }

      if (t.items.length === 0) {
        errors.push('Se requiere al menos 1 elemento en la plantilla');
      } else if (t.items.length > 100) {
        warnings.push('La plantilla contiene más de 100 elementos (recomendado máx 50)');
      }

      // Validate each item
      let hasMandatory = false;
      t.items.forEach((item: any, index: number) => {
        if (!item.description || typeof item.description !== 'string') {
          errors.push(`Elemento #${index + 1}: descripción requerida`);
        }
        if (!['checkbox', 'text', 'number'].includes(item.inputType)) {
          errors.push(`Elemento #${index + 1}: tipo de entrada inválido`);
        }
        if (typeof item.isMandatory !== 'boolean') {
          errors.push(`Elemento #${index + 1}: propiedad isMandatory debe ser booleano`);
        }
        if (item.isMandatory) {
          hasMandatory = true;
        }
      });

      if (!hasMandatory) {
        errors.push('Se requiere al menos 1 elemento obligatorio');
      }

      // Validate metadata
      if (!data.exportedAt || typeof data.exportedAt !== 'string') {
        warnings.push('Información de exportación incompleta');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: data as TemplateExportData,
      };
    };

    // Handle export action
    const handleExport = async () => {
      if (!onExport) {
        console.warn('onExport callback not provided');
        return;
      }

      setIsExporting(true);
      setExportProgress(0);

      try {
        const exportData = generateExportData();

        // Simulate progress
        setExportProgress(30);

        await onExport(exportData);

        setExportProgress(70);

        // Generate file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template-${template.name || 'export'}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportProgress(100);
        setTimeout(() => setExportProgress(0), 1500);
      } catch (error) {
        console.error('Export failed:', error);
        setExportProgress(0);
      } finally {
        setIsExporting(false);
      }
    };

    // Handle file selection
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith('.json')) {
        setImportError('El archivo debe ser de tipo JSON (.json)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImportError('El archivo no debe superar 5MB');
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const validation = validateImportData(data);

        setImportError(null);
        setImportWarnings(validation.warnings);
        setImportPreview(validation.data || null);

        if (!validation.isValid) {
          setImportError(validation.errors.join('\n'));
        } else {
          setShowImportDialog(true);
        }
      } catch (error) {
        setImportError(
          error instanceof SyntaxError
            ? 'El archivo JSON no es válido'
            : 'Error al leer el archivo'
        );
        setImportPreview(null);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // Handle import confirmation
    const handleConfirmImport = async () => {
      if (!importPreview || !onImport) return;

      setIsImporting(true);
      try {
        await onImport(importPreview);
        setShowImportDialog(false);
        setImportPreview(null);
        setImportWarnings([]);
      } catch (error) {
        console.error('Import failed:', error);
        setImportError('Error al importar la plantilla');
      } finally {
        setIsImporting(false);
      }
    };

    // Handle drag & drop
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
          handleFileSelect({
            target: { files: dataTransfer.files },
          } as any);
        }
      } else {
        setImportError('Por favor, arrastra un archivo JSON válido');
      }
    };

    return (
      <Box className={className}>
        <Grid container spacing={3}>
          {/* Export Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                avatar={<CloudDownloadIcon />}
                title="Exportar Plantilla"
                subheader="Descargar como archivo JSON"
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="body2" color="textSecondary">
                    Exporta tu plantilla actual como un archivo JSON. Podrás importarlo
                    más tarde en otra institución o para hacer respaldo.
                  </Typography>

                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="body2">
                      El archivo incluirá todos los datos de la plantilla, incluidos los elementos,
                      tipos de entrada y configuración.
                    </Typography>
                  </Alert>

                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                      Archivo a exportar:
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <DescriptionIcon color="action" />
                      <Box flex={1} minWidth={0}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {template.name || 'Sin nombre'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {items.filter((i) => !i.isDeleted).length} elementos
                        </Typography>
                      </Box>
                      <Chip
                        label="JSON"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Paper>
                  </Box>

                  {isExporting && (
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption">Exportando...</Typography>
                        <Typography variant="caption">{exportProgress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={exportProgress} />
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      isExporting ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DownloadIcon />
                      )
                    }
                    onClick={handleExport}
                    disabled={isExporting || !template.name || items.length === 0}
                    fullWidth
                  >
                    {isExporting ? 'Exportando...' : 'Exportar Plantilla'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Import Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                avatar={<CloudUploadIcon />}
                title="Importar Plantilla"
                subheader="Cargar desde archivo JSON"
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="body2" color="textSecondary">
                    Importa una plantilla desde un archivo JSON. Se validará la estructura
                    y se mostrará una vista previa antes de confirmar.
                  </Typography>

                  <Alert severity="warning" icon={<WarningIcon />}>
                    <Typography variant="body2">
                      La importación reemplazará los datos actuales. Asegúrate de exportar
                      primero si deseas guardar el estado actual.
                    </Typography>
                  </Alert>

                  {/* Drag & Drop Zone */}
                  <Paper
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'action.hover',
                      border: '2px dashed',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.lighter',
                      },
                    }}
                  >
                    <FileUploadIcon
                      sx={{
                        fontSize: 40,
                        color: 'primary.main',
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      Arrastra un archivo JSON aquí
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      o haz clic para seleccionar
                    </Typography>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      aria-label="Importar archivo JSON"
                    />
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        handleFileSelect(e);
                        e.currentTarget.click();
                      }}
                      onClick={(e) => {
                        (e.currentTarget as HTMLInputElement).click();
                      }}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                      }}
                      aria-label="Seleccionar archivo JSON"
                    />
                  </Paper>

                  {/* Manual File Selection */}
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    Seleccionar Archivo
                  </Button>

                  {/* Error Alert */}
                  {importError && (
                    <Alert severity="error" icon={<ErrorIcon />}>
                      <AlertTitle>Error de importación</AlertTitle>
                      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                        {importError}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Import Preview Dialog */}
        <Dialog
          open={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Vista previa de importación
          </DialogTitle>
          <DialogContent dividers>
            {importPreview && (
              <Stack spacing={2}>
                {/* Warnings */}
                {importWarnings.length > 0 && (
                  <Alert severity="warning" icon={<WarningIcon />}>
                    <AlertTitle>Advertencias</AlertTitle>
                    {importWarnings.map((warning, index) => (
                      <Typography key={index} variant="caption" display="block">
                        • {warning}
                      </Typography>
                    ))}
                  </Alert>
                )}

                {/* Template Info */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>Información de Plantilla</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Nombre
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {importPreview.template.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Prioridad
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {importPreview.template.priority}/10
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Elementos
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {importPreview.template.items.length}
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* Items Preview */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <ChecklistIcon sx={{ mr: 1 }} />
                    <Typography fontWeight={600}>
                      Elementos ({importPreview.template.items.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List disablePadding dense>
                      {importPreview.template.items.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="caption" fontWeight={600}>
                              #{index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.description}
                            secondary={`${item.inputType} - ${
                              item.isMandatory ? 'Obligatorio' : 'Opcional'
                            }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Metadata */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="caption">Metadatos</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" color="textSecondary">
                        Exportado: {new Date(importPreview.exportedAt).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Por: {importPreview.exportedBy}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Versión: {importPreview.version}
                      </Typography>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowImportDialog(false)}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmImport}
              color="primary"
              variant="contained"
              disabled={isImporting}
              startIcon={isImporting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {isImporting ? 'Importando...' : 'Confirmar Importación'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
);

TemplateImportExport.displayName = 'TemplateImportExport';

export default TemplateImportExport;

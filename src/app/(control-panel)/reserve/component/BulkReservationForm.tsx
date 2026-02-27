import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { downloadBulkReservationTemplate } from '../reserveService';
import { getContractors } from '../../contractors/contractorsService';
import { ContractorResponse } from '../../contractors/models/ContractorResponse';
import { FormControl, SelectChangeEvent } from '@mui/material';
import { Select } from '@mui/material';
import { InputLabel } from '@mui/material';
import { MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

interface BulkReservationFormProps {
  file: File | null;
  companyId: number;
  comments?: string;
  isSubmitting?: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCompanyChange: (companyId: number) => void;
  onCommentsChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BulkReservationForm: React.FC<BulkReservationFormProps> = ({
  file,
  companyId,
  comments = '',
  isSubmitting = false,
  onFileChange,
  onCompanyChange,
  onCommentsChange = () => {},
}) => {
  const { authState } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xls' && fileExtension !== 'xlsx') {
        enqueueSnackbar('Por favor, seleccione un archivo Excel (.xls o .xlsx)', { variant: 'warning' });
        e.target.value = ''; // Reset the input
        return;
      }
    }
    onFileChange(e);
  };

  const [isLoadingContractors, setIsLoadingContractors] = useState(false);
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);

  useEffect(() => {
    const fetchContractors = async () => {
      setIsLoadingContractors(true);
      try {
        const response = await getContractors();
        if (response.succeeded) {
          setContractors(response.data || []);
          if (authState?.user?.companyId) {
            onCompanyChange(authState.user.companyId as number);
          }
        } else {
          console.error("Error fetching contractors:", response.message);
        }
      } catch (error) {
        console.error("Error fetching contractors:", error);
      } finally {
        setIsLoadingContractors(false);
      }
    };

    fetchContractors();
  }, [authState?.user?.companyId]);

  const handleDownloadTemplate = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Only allow download if a contractor is selected
    if (!companyId) {
      enqueueSnackbar('Por favor, seleccione un contratista antes de descargar la plantilla.', { variant: 'warning' });
      return;
    }
    
    try {
      await downloadBulkReservationTemplate(companyId);
      enqueueSnackbar('Plantilla descargada exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading template:', error);
      enqueueSnackbar('Hubo un error al descargar la plantilla. Por favor, inténtelo de nuevo.', { variant: 'error' });
    }
  };

  const handleContractorChange = (event: SelectChangeEvent) => {
    // Find the contractor ID based on the selected name
    const selectedContractor = contractors.find(c => c.id.toString() === event.target.value);
    if (selectedContractor) {
      onCompanyChange(selectedContractor.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Sube tu archivo xls</div>
        <a
          href="#"
          onClick={handleDownloadTemplate}
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: companyId ? '#1976d2' : '#bdbdbd',
            textDecoration: 'none',
            cursor: companyId ? 'pointer' : 'not-allowed',
            opacity: companyId ? 1 : 0.6
          }}
        >
          Descargar Demo Excel
        </a>
      </div>
      <label htmlFor="xls-upload" style={{
        border: '1px dashed #bdbdbd',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
        cursor: 'pointer',
        marginBottom: 16
      }}>
        <CloudUploadIcon sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
        <div style={{ color: '#bdbdbd', fontSize: 15 }}>{file ? file.name : 'Subir archivo'}</div>
        <input
          id="xls-upload"
          type="file"
          accept=".xls,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </label>
      <div style={{ display: 'flex', gap: 16 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="contractor-label">Contratista</InputLabel>
          <Select
            labelId="contractor-label"
            value={companyId ? companyId.toString() : ''}
            onChange={handleContractorChange}
            label="Contratista"
            disabled={isLoadingContractors || !!authState?.user?.companyId || isSubmitting}
          >
            {contractors.map((contractor) => (
              <MenuItem key={contractor.id} value={contractor.id.toString()}>
                {contractor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Comentarios"
          value={comments}
          onChange={onCommentsChange}
          fullWidth
          size="small"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default BulkReservationForm; 
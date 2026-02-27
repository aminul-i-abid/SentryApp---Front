import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddContractorForm from './AddContractorForm';
import { ContractorResponse } from '../models/ContractorResponse';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface EditContractorModalProps {
  open: boolean;
  onClose: () => void;
  contractor: ContractorResponse | null;
  onSave: (contractorData: {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    contract?: string;
    state: boolean;
  }) => Promise<void> | void;
}

const EditContractorModal: React.FC<EditContractorModalProps> = ({ open, onClose, contractor, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contract: '',
  });
  const [state, setState] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  useEffect(() => {
    if (open && contractor) {
      setFormData({
        name: contractor.name || '',
        rut: contractor.rut || '',
        address: contractor.address || '',
        phone: contractor.phone || '',
        email: contractor.email || '',
        website: contractor.website || '',
        contract: contractor.contract || '',
      });
      setState(contractor.state ?? true);
      setResetForm(true);
      setTimeout(() => setResetForm(false), 100);
    }
  }, [open, contractor]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onSave({ ...formData, state });
      onClose();
    } catch (error) {
      console.error('Error updating contractor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>Editar Contratista</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <AddContractorForm
          name={formData.name}
          rut={formData.rut}
          address={formData.address}
          phone={formData.phone}
          email={formData.email}
          website={formData.website}
          contract={formData.contract}
          contactFirstName={''}
          contactLastName={''}
          contactRut={''}
          contactPhone={''}
          contactEmail={''}
          resetForm={resetForm}
          showContactFields={false}
          onNameChange={handleChange('name')}
          onRutChange={handleChange('rut')}
          onAddressChange={handleChange('address')}
          onPhoneChange={handleChange('phone')}
          onEmailChange={handleChange('email')}
          onWebsiteChange={handleChange('website')}
          onContractChange={handleChange('contract')}
          onContactFirstNameChange={() => {}}
          onContactLastNameChange={() => {}}
          onContactRutChange={() => {}}
          onContactPhoneChange={() => {}}
          onContactEmailChange={() => {}}
        />
        <Box sx={{ mt: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="contractor-state-label">Estado</InputLabel>
            <Select
              labelId="contractor-state-label"
              label="Estado"
              value={state ? 'true' : 'false'}
              onChange={(e) => setState(e.target.value === 'true')}
            >
              <MenuItem value={'true'}>Activo</MenuItem>
              <MenuItem value={'false'}>Inactivo</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ flex: 1, mr: 2, bgcolor: '#F5F7FA' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{ flex: 1 }}
          disabled={isLoading || !formData.name || !formData.rut}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Guardar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContractorModal;



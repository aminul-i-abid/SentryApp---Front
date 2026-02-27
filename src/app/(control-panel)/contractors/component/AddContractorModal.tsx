import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddContractorForm from './AddContractorForm';

interface AddContractorModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (contractorData: {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    contract?: string;
    contactFirstName: string;
    contactLastName: string;
    contactRut: string;
    contactPhone: string;
    contactEmail: string;
  }) => void;
}

const AddContractorModal: React.FC<AddContractorModalProps> = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contract: '',
    contactFirstName: '',
    contactLastName: '',
    contactRut: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  // Reset form data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        rut: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        contract: '0',
        contactFirstName: '',
        contactLastName: '',
        contactRut: '',
        contactPhone: '',
        contactEmail: '',
      });
      setResetForm(true);
      // Reset the resetForm flag after a short delay
      setTimeout(() => setResetForm(false), 100);
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const { contract, ...rest } = formData;
      await onAdd({ ...rest, contract: contract });
      // Reset form data after successful creation
      setFormData({
        name: '',
        rut: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        contract: '0',
        contactFirstName: '',
        contactLastName: '',
        contactRut: '',
        contactPhone: '',
        contactEmail: '',
      });
      // Trigger form reset
      setResetForm(true);
      setTimeout(() => setResetForm(false), 100);
      onClose();
    } catch (error) {
      console.error('Error adding contractor:', error);
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>Agregar Nuevo Contratista</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <AddContractorForm
          name={formData.name}
          rut={formData.rut}
          address={formData.address}
          phone={formData.phone}
          email={formData.email}
          website={formData.website}
          contract={formData.contract}
          contactFirstName={formData.contactFirstName}
          contactLastName={formData.contactLastName}
          contactRut={formData.contactRut}
          contactPhone={formData.contactPhone}
          contactEmail={formData.contactEmail}
          resetForm={resetForm}
          onNameChange={handleChange('name')}
          onRutChange={handleChange('rut')}
          onAddressChange={handleChange('address')}
          onPhoneChange={handleChange('phone')}
          onEmailChange={handleChange('email')}
          onWebsiteChange={handleChange('website')}
          onContractChange={handleChange('contract')}
          onContactFirstNameChange={handleChange('contactFirstName')}
          onContactLastNameChange={handleChange('contactLastName')}
          onContactRutChange={handleChange('contactRut')}
          onContactPhoneChange={handleChange('contactPhone')}
          onContactEmailChange={handleChange('contactEmail')}
        />
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
          disabled={
            isLoading ||
            !formData.name ||
            !formData.rut ||
            !formData.contactFirstName ||
            !formData.contactLastName ||
            !formData.contactRut ||
            !formData.contactPhone ||
            !formData.contactEmail
          }
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Agregar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContractorModal; 
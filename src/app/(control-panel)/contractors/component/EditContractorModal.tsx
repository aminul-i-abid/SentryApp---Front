import ContractorFormDialog from "@/components/ContractorFormDialog";
import React from "react";
import { ContractorResponse } from "../models/ContractorResponse";

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

const EditContractorModal: React.FC<EditContractorModalProps> = ({
  open,
  onClose,
  contractor,
  onSave,
}) => {
  const handleSubmit = async (data: {
    name: string;
    rut: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    state: boolean;
  }) => {
    await onSave(data);
    onClose();
  };

  return (
    <ContractorFormDialog
      open={open}
      onClose={onClose}
      title="Edit Contactor Info"
      submitLabel="Submit Info"
      showState
      initialData={
        contractor
          ? {
              name: contractor.name || "",
              rut: contractor.rut || "",
              email: contractor.email || "",
              phone: contractor.phone || "",
              address: contractor.address || "",
              website: contractor.website || "",
              state: contractor.state ?? true,
            }
          : undefined
      }
      onSubmit={handleSubmit}
    />
  );
};

export default EditContractorModal;

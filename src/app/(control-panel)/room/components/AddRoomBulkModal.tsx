import FormDialog from "@/components/ui/FormDialog";
import { SelectChangeEvent } from "@mui/material/Select";
import { useSnackbar } from "notistack";
import React, { useMemo, useState } from "react";
import { ContractorResponse } from "../../contractors/models/ContractorResponse";
import { createRoom } from "../roomService";
import AddRoomForm from "./AddRoomBulkForm";

interface AddRoomModalProps {
  idBlock: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractors: ContractorResponse[];
  blockFloors?: number;
  suffix?: string;
  prefix?: string;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  idBlock,
  open,
  onClose,
  onSuccess,
  contractors,
  blockFloors,
  suffix,
  prefix,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blockId: idBlock,
    roomCount: 1,
    bedsPerRoom: 1,
    isStorage: false,
    prefix: prefix || "",
    suffix: suffix || "",
    startNumber: 1,
    numberDigits: 1,
    tag: 0,
    floorNumber: 1,
    companyId: contractors.length > 0 ? contractors[0].id : 0,
  });

  // Validate if all required fields have valid values
  const isFormValid = useMemo(() => {
    return (
      formData.blockId > 0 &&
      formData.roomCount > 0 &&
      formData.bedsPerRoom > 0 &&
      formData.startNumber > 0 &&
      formData.numberDigits > 0 &&
      formData.floorNumber > 0 &&
      formData.companyId > 0
    );
  }, [formData]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await createRoom(formData);

      if (response.succeeded) {
        enqueueSnackbar("Habitación creada exitosamente", {
          variant: "success",
        });
        onSuccess();
        onClose();
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.messages?.[0] ||
          "Error al crear la habitación";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Error al crear la habitación", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.type === "number"
            ? parseInt(e.target.value, 10) || 0
            : e.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseInt(e.target.value as string, 10) || 0,
    }));
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Agregar Habitaciones Masivas"
      submitLabel="Agregar"
      cancelLabel="Cancelar"
      loading={loading}
      submitDisabled={!isFormValid}
      onSubmit={handleSubmit}
      variant="drawer"
    >
      <AddRoomForm
        roomCount={formData.roomCount}
        bedsPerRoom={formData.bedsPerRoom}
        startNumber={formData.startNumber}
        numberDigits={formData.numberDigits}
        tag={formData.tag}
        floorNumber={formData.floorNumber}
        contractorId={formData.companyId}
        contractors={contractors}
        isEdit={false}
        maxFloors={blockFloors}
        onRoomCountChange={handleInputChange("roomCount")}
        onBedsPerRoomChange={handleInputChange("bedsPerRoom")}
        onStartNumberChange={handleInputChange("startNumber")}
        onNumberDigitsChange={handleInputChange("numberDigits")}
        onTagChange={handleSelectChange("tag")}
        onFloorNumberChange={handleInputChange("floorNumber")}
        onContractorChange={handleSelectChange("companyId")}
      />
    </FormDialog>
  );
};

export default AddRoomModal;

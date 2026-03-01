import FormDialog from "@/components/ui/FormDialog";
import { SelectChangeEvent } from "@mui/material/Select";
import { useSnackbar } from "notistack";
import React, { useEffect, useMemo, useState } from "react";
import { ContractorResponse } from "../../contractors/models/ContractorResponse";
import { RoomResponse } from "../models/RoomResponse";
import { createRoomSingle, updateRoom } from "../roomService";
import AddRoomForm from "./AddRoomSingleForm";

interface AddRoomSingleModalProps {
  idBlock: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractors: ContractorResponse[];
  room?: RoomResponse;
  isEdit?: boolean;
  blockFloors?: number;
  prefix?: string;
  suffix?: string;
}

const AddRoomSingleModal: React.FC<AddRoomSingleModalProps> = ({
  idBlock,
  open,
  onClose,
  onSuccess,
  contractors,
  room,
  isEdit = false,
  blockFloors,
  prefix,
  suffix,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blockId: idBlock,
    roomNumber: "",
    beds: 1,
    isStorage: false,
    tag: 0,
    floorNumber: 1,
    companyId: contractors.length > 0 ? contractors[0].id : 0,
    disabled: false,
  });

  // Validate if all required fields have valid values
  const isFormValid = useMemo(() => {
    return (
      formData.blockId > 0 &&
      formData.roomNumber.trim() !== "" &&
      formData.beds > 0 &&
      formData.floorNumber > 0 &&
      formData.companyId > 0
    );
  }, [formData]);

  useEffect(() => {
    if (isEdit && room) {
      setFormData({
        ...formData,
        roomNumber: room.roomNumber || "",
        beds: room.beds || 1,
        isStorage: room.isStorage || false,
        tag: room.tag || 0,
        floorNumber: room.floorNumber || 1,
        companyId:
          room.companyId || (contractors.length > 0 ? contractors[0].id : 0),
        disabled: room.disabled || false,
      });
    }
  }, [isEdit, room, contractors]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let response;

      if (isEdit && room) {
        response = await updateRoom(room.id.toString(), {
          blockId: formData.blockId,
          beds: formData.beds,
          isStorage: formData.isStorage,
          tag: formData.tag,
          floorNumber: formData.floorNumber,
          companyId: formData.companyId,
          roomNumber: formData.roomNumber,
          disabled: formData.disabled,
        });
      } else {
        response = await createRoomSingle({
          blockId: formData.blockId,
          roomNumber: prefix + formData.roomNumber + suffix,
          beds: formData.beds,
          isStorage: formData.isStorage,
          tag: formData.tag,
          floorNumber: formData.floorNumber,
          companyId: formData.companyId,
        });
      }

      if (response.succeeded) {
        enqueueSnackbar(
          `Habitación ${isEdit ? "actualizada" : "creada"} exitosamente`,
          { variant: "success" },
        );
        onSuccess();
        onClose();
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.messages?.[0] ||
          `Error al ${isEdit ? "actualizar" : "crear"} la habitación`;
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(
        `Error al ${isEdit ? "actualizar" : "crear"} la habitación`,
        { variant: "error" },
      );
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
      title={isEdit ? "Editar Habitación" : "Agregar Nueva Habitación"}
      submitLabel={isEdit ? "Actualizar" : "Agregar"}
      cancelLabel="Cancelar"
      loading={loading}
      submitDisabled={!isFormValid}
      onSubmit={handleSubmit}
      variant="drawer"
    >
      <AddRoomForm
        roomNumber={formData.roomNumber}
        beds={formData.beds}
        tag={formData.tag}
        floorNumber={formData.floorNumber}
        contractorId={formData.companyId}
        contractors={contractors}
        isStorage={formData.isStorage}
        isEdit={isEdit}
        maxFloors={blockFloors}
        onRoomNumberChange={handleInputChange("roomNumber")}
        onBedsChange={handleInputChange("beds")}
        onTagChange={handleSelectChange("tag")}
        onFloorNumberChange={handleInputChange("floorNumber")}
        onContractorChange={handleSelectChange("companyId")}
        onIsStorageChange={handleInputChange("isStorage")}
      />
    </FormDialog>
  );
};

export default AddRoomSingleModal;

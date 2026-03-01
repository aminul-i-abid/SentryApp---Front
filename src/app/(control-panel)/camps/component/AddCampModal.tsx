import FormDialog from "@/components/ui/FormDialog";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { createCamp, updateCamp } from "../campsService";
import { CampResponse } from "../models/CampResponse";
import AddCampForm from "./AddCampForm";

interface AddCampModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campToEdit?: CampResponse;
}

const AddCampModal: React.FC<AddCampModalProps> = ({
  open,
  onClose,
  onSuccess,
  campToEdit,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    coordinates: "",
    capacity: 0,
  });

  // Load camp data when editing
  useEffect(() => {
    if (campToEdit) {
      setFormData({
        name: campToEdit.name || "",
        location: campToEdit.location || "",
        coordinates: campToEdit.coordinates || "",
        capacity: campToEdit.capacity || 0,
      });
    } else {
      // Reset form when adding new camp
      setFormData({
        name: "",
        location: "",
        coordinates: "",
        capacity: 0,
      });
    }
  }, [campToEdit, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let response;
      if (campToEdit) {
        response = await updateCamp(campToEdit.id, formData);
      } else {
        response = await createCamp(formData);
      }

      if (response.succeeded) {
        enqueueSnackbar(
          campToEdit
            ? "Campamento actualizado exitosamente"
            : "Campamento creado exitosamente",
          { variant: "success" },
        );
        onSuccess();
        onClose();
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.messages?.[0] ||
          (campToEdit
            ? "Error al actualizar el campamento"
            : "Error al crear el campamento");
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(
        campToEdit
          ? "Error al actualizar el campamento"
          : "Error al crear el campamento",
        { variant: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: field === "capacity" ? Number(e.target.value) : e.target.value,
      }));
    };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={campToEdit ? "Editar Campamento" : "Agregar Nuevo Campamento"}
      submitLabel={campToEdit ? "Actualizar" : "Agregar"}
      cancelLabel="Cancelar"
      loading={loading}
      submitDisabled={
        !formData.name || !formData.location || formData.capacity <= 0
      }
      onSubmit={handleSubmit}
      variant="drawer"
    >
      <AddCampForm
        name={formData.name}
        location={formData.location}
        coordinates={formData.coordinates}
        capacity={formData.capacity}
        onNameChange={handleChange("name")}
        onLocationChange={handleChange("location")}
        onCoordinatesChange={handleChange("coordinates")}
        onCapacityChange={handleChange("capacity")}
      />
    </FormDialog>
  );
};

export default AddCampModal;

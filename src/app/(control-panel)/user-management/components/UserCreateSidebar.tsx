import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import FormDialog from "@/components/ui/FormDialog";

export interface UserCreateData {
  rut: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  roles: string[];
}

interface UserCreateSidebarProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserCreateData) => void;
}

const AVAILABLE_ROLES = ["Admin", "User", "Manager", "Support", "Housekeeping"];

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-[#111827] mb-1.5">
    {children}
  </label>
);

const CustomInput = ({
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: any) => (
  <input
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    disabled={disabled}
    placeholder={placeholder}
    className={`w-full border rounded-[10px] px-3 py-2.5 text-[14px] transition-colors
      ${
        disabled
          ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
          : "bg-[#FAFAFA] border-[#E5E7EB] text-[#111827] hover:border-[#D1D5DB] focus:bg-white focus:outline-none focus:border-[#415EDE] focus:ring-1 focus:ring-[#415EDE]"
      }`}
  />
);

export default function UserCreateSidebar({
  open,
  onClose,
  onSave,
}: UserCreateSidebarProps) {
  const initialData: UserCreateData = {
    rut: "",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    roles: [],
  };

  const [formData, setFormData] = useState<UserCreateData>(initialData);

  useEffect(() => {
    if (open) {
      setFormData(initialData);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Crear Nuevo Usuario"
      variant="drawer"
      submitLabel="Crear Usuario"
      cancelLabel="Cancelar"
      onSubmit={handleSubmit}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
        
        {/* General Details Section */}
        <Box className="bg-white p-4 rounded-[12px] border border-[#F0F0F0]">
          <Box className="flex items-center gap-2 mb-4">
            <img src="./assets/icons/edit-black.png" alt="" className="w-5 h-5 opacity-70" />
            <Typography variant="h6" className="font-semibold text-[#111827] text-[16px]">
              Información General
            </Typography>
          </Box>
          
          <div className="flex flex-col gap-4">
            <div>
              <Label>RUT</Label>
              <CustomInput
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="Ej. 12.345.678-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <CustomInput
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. Juan"
                />
              </div>
              <div>
                <Label>Apellido</Label>
                <CustomInput
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div>
              <Label>Correo Electrónico</Label>
              <CustomInput
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <Label>Teléfono</Label>
              <CustomInput
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+56 9 0000 0000"
              />
            </div>

            <div>
              <Label>Empresa</Label>
              <CustomInput
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>
        </Box>

        {/* Roles Section */}
        <Box className="bg-white p-4 rounded-[12px] border border-[#F0F0F0]">
          <Box className="flex items-center gap-2 mb-4">
            <img src="./assets/icons/solar_pin-list-bold.png" alt="" className="w-5 h-5 opacity-70" />
            <Typography variant="h6" className="font-semibold text-[#111827] text-[16px]">
              Asignar Roles
            </Typography>
          </Box>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const isActive = formData.roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors border ${
                    isActive
                      ? "bg-[#EFF6FF] text-[#415EDE] border-[#415EDE]"
                      : "bg-[#FAFAFA] text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </Box>

      </Box>
    </FormDialog>
  );
}

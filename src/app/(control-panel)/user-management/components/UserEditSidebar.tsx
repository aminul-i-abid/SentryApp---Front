import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import FormDialog from "@/components/ui/FormDialog";

export interface UserEditData {
  id: string;
  rut: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  roles: string[];
  isLocked: boolean;
}

interface UserEditSidebarProps {
  open: boolean;
  onClose: () => void;
  user: UserEditData | null;
  onSave: (data: UserEditData) => void;
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
      ${disabled
        ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
        : "bg-[#FAFAFA] border-[#E5E7EB] text-[#111827] hover:border-[#D1D5DB] focus:bg-white focus:outline-none focus:border-[#415EDE] focus:ring-1 focus:ring-[#415EDE]"
      }`}
  />
);

export default function UserEditSidebar({
  open,
  onClose,
  user,
  onSave,
}: UserEditSidebarProps) {
  const [formData, setFormData] = useState<UserEditData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
      setResetPassword("");
    }
  }, [user]);

  if (!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleToggleLock = () => {
    setFormData((prev) => (prev ? { ...prev, isLocked: !prev.isLocked } : null));
  };

  const handleSubmit = () => {
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Editar Información"
      variant="drawer"
      submitLabel="Guardar Cambios"
      cancelLabel="Cancelar"
      onSubmit={handleSubmit}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>

        {/* General Edit Section */}
        <Box className="bg-white p-4 rounded-[12px] border border-[#F0F0F0]">
          <Box className="flex items-center gap-2 mb-4">
            <img src="./assets/icons/edit-black.png" alt="" className="w-5 h-5 opacity-70" />
            <Typography variant="h6" className="font-semibold text-[#111827] text-[16px]">
              Edición General
            </Typography>
          </Box>

          <div className="flex flex-col gap-4">
            <div>
              <Label>RUT</Label>
              <CustomInput name="rut" value={formData.rut} disabled />
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
                  className={`px-3 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors border ${isActive
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

        {/* Security Section (Password & Lock) */}
        <Box className="bg-white p-4 rounded-[12px] border border-[#F0F0F0]">
          <Box className="flex items-center gap-2 mb-4">
            <Typography variant="h6" className="font-semibold text-[#111827] text-[16px]">
              Seguridad
            </Typography>
          </Box>

          <div className="flex flex-col gap-4">
            <div>
              <Label>Restablecer Contraseña</Label>
              <div className="relative">
                <CustomInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={resetPassword}
                  onChange={(e: any) => setResetPassword(e.target.value)}
                  placeholder="Ingresa una nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                >
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-[10px]">
              <div>
                <Typography className="text-[14px] font-semibold text-[#111827]">
                  {formData.isLocked ? "Usuario bloqueado" : "Usuario activo"}
                </Typography>
                <Typography className="text-[12px] text-[#6B7280]">
                  {formData.isLocked
                    ? "Inhabilita el acceso al sistema."
                    : "Tiene acceso normal al sistema."}
                </Typography>
              </div>
              <button
                type="button"
                onClick={handleToggleLock}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isLocked ? "bg-[#EF4444]" : "bg-[#34A853]"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isLocked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>
        </Box>

      </Box>
    </FormDialog>
  );
}

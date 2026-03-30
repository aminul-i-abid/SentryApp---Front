import React from "react";
import { Box, Chip } from "@mui/material";
import {
  DetailSection,
  InfoRow,
  MiniCard,
} from "@/components/ui/DetailPanel";
import DetailPanel from "@/components/ui/DetailPanel";

export interface UserDetailsData {
  id: string;
  rut: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  roles: string[];
  lastReservation: string;
  creationDate: string;
  createdBy: string;
  reservations: {
    id: string;
    guest: string;
    checkIn: string;
    checkOut: string;
    status: string;
    room: string;
  }[];
}

interface UserDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  user: UserDetailsData | null;
}

export default function UserDetailsSidebar({
  open,
  onClose,
  user,
}: UserDetailsSidebarProps) {
  if (!user) return null;

  return (
    <DetailPanel
      open={open}
      onClose={onClose}
      title={`${user.name} ${user.lastName}`}
      hasData={Boolean(user)}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* User Information */}
        <DetailSection
          title="Información del usuario"
          icon={<img src="./assets/icons/info.png" alt="info" />} // Placeholder icon
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 2,
            }}
          >
            <InfoRow label="RUT" value={user.rut} />
            <InfoRow label="Empresa" value={user.company} />
            <InfoRow label="Correo" value={user.email} />
            <InfoRow label="Teléfono" value={user.phone} />
            <InfoRow label="Fecha de creación" value={user.creationDate} />
            <InfoRow label="Creado por" value={user.createdBy} />
            <InfoRow label="Última reserva" value={user.lastReservation} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 1, fontSize: '0.8rem', color: '#686868' }}>Roles del usuario:</Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {user.roles.map((role, idx) => (
                <Chip
                  key={idx}
                  label={role}
                  size="small"
                  sx={{
                    bgcolor: '#415EDE14',
                    color: '#415EDE',
                    fontWeight: 600,
                    borderRadius: '6px'
                  }}
                />
              ))}
            </Box>
          </Box>
        </DetailSection>

        {/* Reservation History */}
        <DetailSection
          title="Historial de reservas"
          icon={<img src="./assets/icons/nav/reservations.png" alt="reservations" style={{ width: 18, height: 18 }} />}
          action={<a href="#" style={{ color: "#415EDE", fontSize: "0.8rem", textDecoration: "none" }}>Ver todas</a>}
          hideSeparator
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {user.reservations.length > 0 ? (
              user.reservations.map((res) => (
                <MiniCard
                  key={res.id}
                  title={`Reserva #${res.id}`}
                  icon={<img src="./assets/icons/nav/guests.png" alt="guest" style={{ width: 16, height: 16 }} />}
                  accentColor="#415EDE"
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                    <InfoRow label="Huésped" value={res.guest} />
                    <InfoRow label="Habitación" value={res.room} />
                    <InfoRow label="Check In" value={res.checkIn} />
                    <InfoRow label="Check Out" value={res.checkOut} />
                    <InfoRow
                      label="Estado"
                      value={
                        <Chip
                          label={res.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: res.status === 'Activa' ? '#DCFCE7' : '#F1F5F9',
                            color: res.status === 'Activa' ? '#166534' : '#475569',
                            fontWeight: 600
                          }}
                        />
                      }
                    />
                  </Box>
                </MiniCard>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem', bgcolor: '#F9FAFB', borderRadius: 2 }}>
                No hay historial de reservas.
              </Box>
            )}
          </Box>
        </DetailSection>
      </Box>
    </DetailPanel>
  );
}

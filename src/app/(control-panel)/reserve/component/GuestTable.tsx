import { ConfirmationModal } from "@/components/ConfirmationModal";
import RowActionMenu from "@/components/ui/RowActionMenu";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import useUser from "@auth/useUser";
import SendIcon from "@mui/icons-material/Send";
import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Guest } from "../models/ReserveDetailResponse";
import ResendModal from "./ResendModal";

interface GuestTableProps {
  guests: Guest[];
  onDeleteGuest?: (guestId: number) => Promise<void>;
  onEditGuest?: (guest: Guest) => void;
  onRefreshData?: () => void;
  reserveInfo?: {
    campName: string;
    checkIn: string;
    checkOut: string;
    roomNumber: string;
    doorPassword?: string;
    guid: string;
    roomId: number;
  };
}

function GuestTable({
  guests,
  onDeleteGuest,
  onEditGuest,
  onRefreshData,
  reserveInfo,
}: GuestTableProps) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const { data: user } = useUser();

  const hasTTLock = user?.modules?.ttlock === true;

  if (guests.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1">
          No hay huéspedes adicionales registrados.
        </Typography>
      </Box>
    );
  }

  const handleDeleteClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedGuest && onDeleteGuest) {
      await onDeleteGuest(selectedGuest.id);
      setIsDeleteModalOpen(false);
    }
  };

  const handleResendClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsResendModalOpen(true);
  };

  const handleResendModalClose = () => {
    setIsResendModalOpen(false);
    setSelectedGuest(null);
  };

  const handleResendSuccess = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const columns: TableColumnDef<Guest>[] = useMemo(() => {
    const cols: TableColumnDef<Guest>[] = [
      {
        id: "name",
        label: "Nombre",
        render: (row) => `${row.firstName} ${row.lastName}`,
      },
      {
        id: "email",
        label: "Email",
        render: (row) => row.email,
      },
      {
        id: "phone",
        label: "Teléfono",
        render: (row) => row.mobileNumber,
      },
      {
        id: "rut",
        label: "RUT/ID",
        render: (row) => row.rutVatId,
      },
      {
        id: "jobTitle",
        label: "Cargo",
        render: (row) => row.jobTitle,
      },
    ];

    if (hasTTLock) {
      cols.push({
        id: "pin",
        label: "PIN",
        render: (row) => row.doorPassword ?? "-",
      });
    }

    return cols;
  }, [hasTTLock]);

  return (
    <>
      <div className="flex justify-between mb-5 gap-2">
        <Typography variant="h6">Huéspedes</Typography>
      </div>

      <StyledTable<Guest>
        columns={columns}
        data={guests}
        getRowId={(row) => String(row.id)}
        emptyMessage="No hay huéspedes registrados"
        renderActions={(row) => (
          <RowActionMenu
            menuItems={[
              {
                key: "resend",
                label: "Reenviar información",
                icon: <SendIcon fontSize="small" />,
                onClick: () => handleResendClick(row),
              },
            ]}
          />
        )}
        actionsLabel="Acciones"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar huésped"
        message={`¿Estás seguro que deseas eliminar al huésped ${selectedGuest?.firstName} ${selectedGuest?.lastName}?`}
        type="delete"
      />

      <ResendModal
        open={isResendModalOpen}
        onClose={handleResendModalClose}
        onSuccess={handleResendSuccess}
        guest={selectedGuest}
        reserveInfo={reserveInfo}
      />
    </>
  );
}

export default GuestTable;

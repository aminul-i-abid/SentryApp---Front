import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import { Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GuestFormData } from "./component/GuestReservationForm";
import GuestReservationModal from "./component/GuestReservationModal";
import GuestTable from "./component/GuestTable";
import ReserveDetailCard from "./component/ReserveDetailCard";
import { Guest } from "./models/ReserveDetailResponse";
import { deleteReservationGuest, getReserveById } from "./reserveService";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-content > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-header > .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    width: "100%",
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

// Fetch function
const fetchReserveData = async (id: number) => {
  try {
    const response = await getReserveById(id);
    if (response.succeeded) {
      const reserve = response.data;
      return reserve || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching reserve:", error);
    throw error;
  }
};

function ReserveDetail() {
  const { authState } = useAuth();
  const { id } = useParams();
  const [reserve, setReserve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditGuestModalOpen, setIsEditGuestModalOpen] = useState(false);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const isSentryAdmin = authState.user?.role === "Sentry_Admin";

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      if (!id) {
        console.error("No reserve ID provided in route parameters");
        setLoading(false);
        return;
      }

      const reserveId = Number(id);
      const reserveData = await fetchReserveData(reserveId);
      setReserve(reserveData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId: number) => {
    await deleteReservationGuest(guestId);
    fetchData();
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsEditGuestModalOpen(true);
  };

  const handleEditGuestClose = () => {
    setIsEditGuestModalOpen(false);
    setSelectedGuest(null);
  };

  const handleEditGuestSuccess = (updatedGuest?: GuestFormData) => {
    // La actualización ya se ha realizado en el modal, solo necesitamos refrescar los datos
    fetchData();
  };

  const handleAddGuestClick = () => {
    setIsAddGuestModalOpen(true);
  };

  const handleAddGuestClose = () => {
    setIsAddGuestModalOpen(false);
  };

  const handleGuestSuccess = () => {
    fetchData();
  };

  // Actualizar título con GUID de la reserva
  useEffect(() => {
    if ((reserve as any)?.guid) {
      document.title = `Reserva ${reserve.guid} - SentryApp`;
    } else {
      document.title = "Reserva - SentryApp";
    }
  }, [reserve]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!reserve) {
    return <div>Reserva no encontrada</div>;
  }

  return (
    <Root
      header={
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Reserva: {reserve.guid} - {reserve.companyName}
          </h2>
        </div>
      }
      content={
        <div className="p-6 w-full">
          <Grid container>
            {/* Columna Izquierda */}
            <Grid item xs={12}>
              <ReserveDetailCard reserve={reserve} fetchData={fetchData} />
            </Grid>
            {/* Columna Derecha */}
            <Grid item xs={12} mt={4}>
              <div className="flex justify-end mb-4">
                {isSentryAdmin &&
                  reserve.guests &&
                  reserve.guests.length < reserve.beds && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddGuestClick}
                    >
                      Agregar huésped
                    </Button>
                  )}
              </div>
              <GuestTable
                guests={reserve.guests}
                onDeleteGuest={handleDeleteGuest}
                onEditGuest={handleEditGuest}
              />
            </Grid>
          </Grid>

          {/* Guest Modals */}
          <GuestReservationModal
            open={isEditGuestModalOpen}
            onClose={handleEditGuestClose}
            onSuccess={handleEditGuestSuccess}
            guest={selectedGuest}
            isEdit={true}
          />

          <GuestReservationModal
            open={isAddGuestModalOpen}
            onClose={handleAddGuestClose}
            onSuccess={handleGuestSuccess}
            reservationData={reserve}
          />
        </div>
      }
    />
  );
}

export default ReserveDetail;

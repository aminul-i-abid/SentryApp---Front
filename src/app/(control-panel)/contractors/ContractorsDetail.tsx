import { ConfirmationModal } from "@/components/ConfirmationModal";
import TopbarHeader from "@/components/TopbarHeader";
import { Routes, buildRoute } from "@/utils/routesEnum";
import useUser from "@auth/useUser";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCampsByCompanyId } from "../camps/campsService";
import { CampResponse } from "../camps/models/CampResponse";
import AddContactPersonModal from "./component/AddContactPersonModal";
import EditContractorModal from "./component/EditContractorModal";
import {
  createCompanyUser,
  deleteCompanyUser,
  deleteContractor,
  getCompanyUsers,
  getContractorById,
  updateContractor,
} from "./contractorsService";
import { ContractorResponse } from "./models/ContractorResponse";
const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.default,
  },
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

function ContractorsDetail() {
  const { data: user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState<ContractorResponse | null>(null);
  const [camps, setCamps] = useState<CampResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [campsLoading, setCampsLoading] = useState(true);
  const { authState } = useAuth();
  const companyId = authState?.user?.companyId;
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    // Si companyId existe, el usuario no tiene permisos para esta página
    if (companyId) {
      navigate("/", { replace: true });
      return;
    }
    const fetchContractor = async () => {
      try {
        if (!id) {
          console.error("No contractor ID provided in route parameters");
          setLoading(false);
          return;
        }

        const response = await getContractorById(Number(id));
        if (response.succeeded) {
          setContractor(response.data);
          const usersResp = await getCompanyUsers(Number(id));
          if (usersResp.succeeded) {
            setCompanyUsers(usersResp.data);
          }
        }
      } catch (error) {
        console.error("Error fetching contractor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractor();
  }, [id]);

  const refreshContractor = async () => {
    if (!id) return;
    try {
      const response = await getContractorById(Number(id));
      if (response.succeeded) {
        setContractor(response.data);
      }
      const usersResp = await getCompanyUsers(Number(id));
      if (usersResp.succeeded) {
        setCompanyUsers(usersResp.data);
      }
    } catch (error) {
      console.error("Error refreshing contractor:", error);
    }
  };

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await getCampsByCompanyId(Number(id));
        if (response.succeeded) {
          setCamps(response.data);
        }
      } catch (error) {
        console.error("Error fetching camps:", error);
      } finally {
        setCampsLoading(false);
      }
    };

    fetchCamps();
  }, []);

  const handleCampClick = (campId) => {
    navigate(
      buildRoute(Routes.CONTRACTORS_CAMP, { campId: campId, idContractor: id }),
    );
  };

  const handleOpenEdit = () => setIsEditOpen(true);
  const handleCloseEdit = () => setIsEditOpen(false);

  const handleOpenDelete = () => setIsConfirmOpen(true);
  const handleCloseDelete = () => setIsConfirmOpen(false);

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      const response = await deleteContractor(Number(id));
      if (response.succeeded) {
        navigate(buildRoute(Routes.CONTRACTORS));
      }
    } catch (error) {
      console.error("Error deleting contractor:", error);
    }
  };

  const handleOpenAddContact = () => setIsAddContactOpen(true);
  const handleCloseAddContact = () => setIsAddContactOpen(false);
  const handleSaveContact = async (data: {
    rut: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) => {
    if (!id) return;
    try {
      const resp = await createCompanyUser(Number(id), {
        firstName: data.firstName,
        lastName: data.lastName,
        dni: data.rut,
        phoneNumber: data.phone,
        email: data.email,
      });
      if (resp.succeeded) {
        enqueueSnackbar("Persona de contacto creada correctamente", {
          variant: "success",
        });
        await refreshContractor();
      }
    } catch (error) {
      console.error("Error al crear el contacto:", error);
      enqueueSnackbar("Error al crear la persona de contacto", {
        variant: "error",
      });
    } finally {
      handleCloseAddContact();
    }
  };

  const handleOpenDeleteUser = (userToDelete: any) => {
    setSelectedUser(userToDelete);
    setIsDeleteUserOpen(true);
  };

  const handleCloseDeleteUser = () => {
    setIsDeleteUserOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (!id || !selectedUser) return;
    try {
      const resp = await deleteCompanyUser(Number(id), selectedUser.id);
      if ((resp as any).succeeded !== false) {
        enqueueSnackbar("Persona de contacto eliminada correctamente", {
          variant: "success",
        });
        await refreshContractor();
      } else {
        enqueueSnackbar("No se pudo eliminar la persona de contacto", {
          variant: "error",
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error eliminando contacto", e);
      enqueueSnackbar("Error al eliminar la persona de contacto", {
        variant: "error",
      });
    } finally {
      handleCloseDeleteUser();
    }
  };

  const handleSaveEdit = async (data: {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    contract?: string;
    state: boolean;
  }) => {
    if (!id) return;
    // Map contract field to expected API payload if needed
    const { contract, ...rest } = data;
    const payload: any = { ...rest };
    if (contract) {
      payload.Contract = contract;
    }
    const response = await updateContractor(Number(id), payload);
    if (response.succeeded) {
      await refreshContractor();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: 300,
          py: 6,
          gap: 2,
        }}
      >
        <CircularProgress size={56} thickness={4} />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
          Loading...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Por favor espere...
        </Typography>
      </Box>
    );
  }

  if (!contractor) {
    return <div>No se encontró el contratista</div>;
  }

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <Box
            sx={(t) => ({
              p: 3,
              width: "100%",
              backgroundColor:
                t.palette.mode === "dark" ? "#121212" : "#F9FAFB",
              minHeight: "100%",
            })}
          >
            {/* Page Title */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Detalles del contratista:
            </Typography>

            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
              {/* ===== LEFT COLUMN ===== */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* --- Top pills row: Name + RUT --- */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    flexWrap: { xs: "wrap", md: "nowrap" },
                  }}
                >
                  {/* Name Pill */}
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2.5,
                      py: 1.5,
                      borderRadius: "16px",
                      border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                      backgroundColor:
                        t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                      flex: 1,
                      minWidth: 0,
                    })}
                  >
                    <Box
                      sx={(t) => ({
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        backgroundColor:
                          t.palette.mode === "dark" ? "#333" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      })}
                    >
                      <BusinessIcon
                        sx={(t) => ({
                          color:
                            t.palette.mode === "dark" ? "#9ca3af" : "#6b7280",
                        })}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {contractor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Contratista
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                      {user?.role === "Sentry_Admin" && (
                        <IconButton
                          size="small"
                          onClick={handleOpenEdit}
                          sx={(t) => ({
                            border: `1px solid ${t.palette.mode === "dark" ? "#555" : "#E5E7EB"}`,
                            width: 34,
                            height: 34,
                          })}
                        >
                          <EditIcon
                            fontSize="small"
                            sx={{ color: "#415EDE" }}
                          />
                        </IconButton>
                      )}
                      {user?.role === "Sentry_Admin" && (
                        <IconButton
                          size="small"
                          onClick={handleOpenDelete}
                          sx={(t) => ({
                            border: `1px solid ${t.palette.mode === "dark" ? "#555" : "#E5E7EB"}`,
                            width: 34,
                            height: 34,
                          })}
                        >
                          <DeleteIcon
                            fontSize="small"
                            sx={{ color: "#ef4444" }}
                          />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>

                  {/* RUT Pill */}
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2.5,
                      py: 1.5,
                      borderRadius: "16px",
                      border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                      backgroundColor:
                        t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                      minWidth: 200,
                    })}
                  >
                    <Box
                      sx={(t) => ({
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        backgroundColor:
                          t.palette.mode === "dark" ? "#333" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      })}
                    >
                      <BadgeIcon
                        sx={(t) => ({
                          color:
                            t.palette.mode === "dark" ? "#9ca3af" : "#6b7280",
                        })}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          RUT
                        </Typography>
                        <Chip
                          label={contractor.state ? "Activo" : "Inactivo"}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            backgroundColor: contractor.state
                              ? "#415EDE"
                              : "#ef4444",
                            color: "#fff",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {contractor.rut}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                {/* --- Info card: Address, Mail, Phone --- */}
                <Paper
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: "16px",
                    border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                    backgroundColor:
                      t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                    px: 3,
                    py: 2.5,
                    mb: 3,
                  })}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <HomeIcon fontSize="small" sx={{ color: "#6b7280" }} />
                    <Typography variant="body2" color="text.secondary">
                      Dirección:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {contractor.address || "—"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <EmailIcon fontSize="small" sx={{ color: "#6b7280" }} />
                    <Typography variant="body2" color="text.secondary">
                      Correo:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {contractor.email || "—"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <PhoneIcon fontSize="small" sx={{ color: "#6b7280" }} />
                    <Typography variant="body2" color="text.secondary">
                      Teléfono:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {contractor.phone || "—"}
                    </Typography>
                  </Box>
                </Paper>

                {/* --- Contact Person Section --- */}
                <Paper
                  elevation={0}
                  sx={(t) => ({
                    borderRadius: "16px",
                    border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                    backgroundColor:
                      t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                    px: 3,
                    py: 2.5,
                  })}
                >
                  {/* Header row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2.5,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Persona de contacto
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total habitaciones:{" "}
                        <strong>
                          {contractor.rooms ? contractor.rooms.length : 0}
                        </strong>
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddContact}
                      sx={{
                        borderRadius: "24px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#415EDE",
                        color: "#415EDE",
                        px: 2,
                        "&:hover": {
                          borderColor: "#3347b8",
                          backgroundColor: "rgba(65,94,222,0.04)",
                        },
                      }}
                    >
                      Agregar persona
                    </Button>
                  </Box>

                  {/* Contact cards 2-column grid */}
                  {companyUsers?.length ? (
                    <Grid container spacing={2}>
                      {companyUsers.map((cu) => (
                        <Grid item xs={12} sm={6} key={cu.id}>
                          <Paper
                            elevation={0}
                            sx={(t) => ({
                              borderRadius: "14px",
                              border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                              backgroundColor:
                                t.palette.mode === "dark" ? "#252525" : "#fff",
                              p: 2.5,
                            })}
                          >
                            {/* Name + delete */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 1.5,
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight={600}>
                                {`${cu.firstName} ${cu.lastName}`}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDeleteUser(cu)}
                                sx={{
                                  border: "1px solid #fecaca",
                                  width: 30,
                                  height: 30,
                                }}
                              >
                                <DeleteIcon
                                  sx={{
                                    color: "#ef4444",
                                    fontSize: 16,
                                  }}
                                />
                              </IconButton>
                            </Box>
                            {/* Mail */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.75,
                              }}
                            >
                              <EmailIcon
                                sx={{ color: "#6b7280", fontSize: 16 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 48 }}
                              >
                                Correo:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                noWrap
                              >
                                {cu.email}
                              </Typography>
                            </Box>
                            {/* Phone */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <PhoneIcon
                                sx={{ color: "#6b7280", fontSize: 16 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 48 }}
                              >
                                Teléfono:
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {cu.phoneNumber}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 3, textAlign: "center" }}
                    >
                      No hay personas de contacto cargadas
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* ===== RIGHT SIDEBAR - Camps ===== */}
              <Box
                sx={{
                  width: { xs: "100%", md: 280 },
                  flexShrink: 0,
                }}
              >
                {campsLoading ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    Cargando campamentos...
                  </Typography>
                ) : camps.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      borderRadius: "16px",
                      border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                      backgroundColor:
                        t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                      p: 3,
                      textAlign: "center",
                    })}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron campamentos
                    </Typography>
                  </Paper>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {camps.map((camp, index) => (
                      <Card
                        key={camp.id}
                        onClick={() => handleCampClick(camp.id)}
                        sx={(t) => ({
                          borderRadius: "16px",
                          border: `1px solid ${t.palette.mode === "dark" ? "#333" : "#E5E7EB"}`,
                          backgroundColor:
                            t.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                          boxShadow: "none",
                          cursor: "pointer",
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                          },
                          overflow: "hidden",
                        })}
                      >
                        <CardMedia
                          component="img"
                          height="180"
                          image="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                          alt={camp.name}
                          sx={{ objectFit: "cover" }}
                        />
                        {/* Dots indicator */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 0.5,
                            py: 1,
                          }}
                        >
                          {camps.slice(0, 3).map((_, dotIdx) => (
                            <Box
                              key={dotIdx}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor:
                                  dotIdx === index ? "#415EDE" : "#D1D5DB",
                              }}
                            />
                          ))}
                        </Box>
                        <CardContent sx={{ pt: 0, px: 2, pb: 2 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            noWrap
                          >
                            {camp.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ mb: 1 }}
                          >
                            {camp.location}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Rooms ({camp.capacity})
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mx: 0.5 }}
                            >
                              |
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Blocks ({camp.blocks?.length ?? 0})
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        }
      />
      <EditContractorModal
        open={isEditOpen}
        onClose={handleCloseEdit}
        contractor={contractor}
        onSave={handleSaveEdit}
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar inactivación"
        message="¿Estás seguro de que quieres volver inactivo este contratista?"
        type="delete"
      />
      <AddContactPersonModal
        open={isAddContactOpen}
        onClose={handleCloseAddContact}
        onSave={handleSaveContact}
      />
      <ConfirmationModal
        isOpen={isDeleteUserOpen}
        onClose={handleCloseDeleteUser}
        onConfirm={handleConfirmDeleteUser}
        title="Eliminar persona de contacto"
        message={`¿Estás seguro que deseas eliminar a ${selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "esta persona"}?`}
        type="delete"
      />
    </>
  );
}

export default ContractorsDetail;

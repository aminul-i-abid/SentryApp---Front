import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Routes, buildRoute } from "@/utils/routesEnum";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popover,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AddContractorModal from "./component/AddContractorModal";
import EditContractorModal from "./component/EditContractorModal";

import TopbarHeader from "@/components/TopbarHeader";
import CirclePagination from "@/components/ui/CirclePagination";
import {
  createContractor,
  deleteContractor,
  getContractors,
  updateContractor,
} from "./contractorsService";

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

function Contractors() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuContractor, setMenuContractor] = useState(null);
  const { authState } = useAuth();
  const companyId = authState?.user?.companyId;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    // Si companyId existe, el usuario no tiene permisos para esta página
    if (companyId) {
      navigate("/", { replace: true });
      return;
    }

    fetchContractors();
  }, [companyId, navigate]);

  const fetchContractors = async () => {
    try {
      const response = await getContractors();

      if (response.succeeded) {
        setContractors(response.data);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (contractor) => {
    setSelectedContractor(contractor);
    setIsDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedContractor?.id) {
        await deleteContractor(selectedContractor.id);
      }

      await fetchContractors();
      enqueueSnackbar("Contratista eliminado exitosamente", {
        variant: "success",
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting contractor:", error);
      enqueueSnackbar("Error al eliminar el contratista", { variant: "error" });
    }
  };

  const handleAddContractor = async (contractorData) => {
    try {
      const response = await createContractor(contractorData);

      if (response.succeeded) {
        enqueueSnackbar("Contratista creado exitosamente", {
          variant: "success",
        });
        await fetchContractors();
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.message ||
          "Error al crear el contratista";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (error) {
      console.error("Error adding contractor:", error);
      enqueueSnackbar("Error al crear el contratista", { variant: "error" });
    }
  };

  const handleContractorClick = (contractorId) => {
    navigate(buildRoute(Routes.CONTRACTORS_DETAIL, { id: contractorId }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, contractor) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuContractor(contractor);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuContractor(null);
  };

  const handleToggleActive = async (contractor) => {
    try {
      const newState = !contractor.state;
      const response = await updateContractor(contractor.id, {
        state: newState,
      });

      if (response.succeeded) {
        enqueueSnackbar(
          newState
            ? "Contratista activado exitosamente"
            : "Contratista desactivado exitosamente",
          { variant: "success" },
        );
        await fetchContractors();
      } else {
        enqueueSnackbar("Error al actualizar el estado", { variant: "error" });
      }
    } catch (error) {
      console.error("Error toggling contractor state:", error);
      enqueueSnackbar("Error al actualizar el estado", { variant: "error" });
    }
  };

  const handleEditClick = (contractor) => {
    setSelectedContractor(contractor);
    setIsEditModalOpen(true);
    handleMenuClose();
  };

  const handleEditSave = async (contractorData) => {
    try {
      if (!selectedContractor?.id) return;

      const response = await updateContractor(
        selectedContractor.id,
        contractorData,
      );

      if (response.succeeded) {
        enqueueSnackbar("Contratista actualizado exitosamente", {
          variant: "success",
        });
        await fetchContractors();
      } else {
        enqueueSnackbar("Error al actualizar el contratista", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error updating contractor:", error);
      enqueueSnackbar("Error al actualizar el contratista", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                ¡Lista de contratistas aquí!
              </h2>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#415EDE",
                  color: "#fff",
                  borderRadius: "24px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  px: 3,
                  py: 3,
                  "&:hover": {
                    backgroundColor: "#4338ca",
                  },
                }}
                startIcon={<AddIcon />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Nuevos contratistas
              </Button>
            </div>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "none",
                boxShadow: "none",
                backgroundColor: "transparent",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                  tableLayout: "fixed",
                  minWidth: 1200,
                  width: "100%",
                }}
              >
                <colgroup>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <TableHead>
                  <TableRow
                    sx={(t) => {
                      const isDark = t.palette.mode === "dark";
                      const borderColor = isDark ? "#444" : "#e6e3e3";
                      return {
                        "& th": {
                          backgroundColor: isDark ? "#1e1e1e" : "#fff",
                          borderTop: `1px solid ${borderColor}`,
                          borderBottom: `1px solid ${borderColor}`,
                          "&:first-of-type": {
                            borderLeft: `1px solid ${borderColor}`,
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                          },
                          "&:last-of-type": {
                            borderRight: `1px solid ${borderColor}`,
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                          },
                        },
                      };
                    }}
                  >
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      Nombre
                    </TableCell>
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      RUT
                    </TableCell>
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      Persona de contacto
                    </TableCell>
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      Correo electrónico de contacto
                    </TableCell>
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      Número de teléfono de contacto
                    </TableCell>
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      Habitaciones
                    </TableCell>
                    <TableCell sx={{ color: "#415EDE", fontWeight: 600 }}>
                      Estado
                    </TableCell>
                    <TableCell
                      sx={{ color: "#415EDE", fontWeight: 600 }}
                      align="center"
                    >
                      acción
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
              <div
                style={{
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                  border: `1px solid ${theme.palette.mode === "dark" ? "#444" : "#e6e3e3"}`,
                  borderRadius: "12px",
                  padding: "6px 6px",
                  minWidth: 1200,
                }}
              >
                <Table
                  sx={{
                    borderCollapse: "separate",
                    borderSpacing: "0 4px",
                    tableLayout: "fixed",
                    minWidth: 1200,
                    width: "100%",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "10%" }} />
                  </colgroup>
                  <TableBody>
                    {contractors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "40px 0",
                            }}
                          >
                            <span style={{ color: "#888" }}>
                              No se encontraron datos
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contractors
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        )
                        .map((contractor) => (
                          <TableRow
                            key={contractor.id}
                            hover
                            sx={(t) => ({
                              "& td": {
                                backgroundColor:
                                  t.palette.mode === "dark"
                                    ? "#2a2a2a"
                                    : "#F3F4F6",
                                borderBottom: "none",
                                py: "11px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                "&:first-of-type": {
                                  borderTopLeftRadius: "12px",
                                  borderBottomLeftRadius: "12px",
                                },
                                "&:last-of-type": {
                                  borderTopRightRadius: "12px",
                                  borderBottomRightRadius: "12px",
                                },
                              },
                            })}
                          >
                            <TableCell>{contractor.name}</TableCell>
                            <TableCell>{contractor.rut}</TableCell>
                            <TableCell>{contractor.contactPerson}</TableCell>
                            <TableCell>{contractor.contactEmail}</TableCell>
                            <TableCell>{contractor.contactPhone}</TableCell>
                            <TableCell>
                              {String(contractor.rooms?.length ?? 0).padStart(
                                2,
                                "0",
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                style={{
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#e0e0e0"
                                      : "#000000",
                                }}
                              >
                                {contractor.state ? "Activos" : "Inactivos"}
                              </span>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleContractorClick(contractor.id)
                                }
                                sx={(t) => ({
                                  color:
                                    t.palette.mode === "dark"
                                      ? "#9ca3af"
                                      : "#6b7280",
                                })}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, contractor)}
                                sx={(t) => ({
                                  color:
                                    t.palette.mode === "dark"
                                      ? "#9ca3af"
                                      : "#6b7280",
                                })}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <CirclePagination
                count={contractors.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
              />
            </TableContainer>

            {/* Action menu popover */}
            <Popover
              open={Boolean(menuAnchorEl)}
              anchorEl={menuAnchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              slotProps={{
                paper: {
                  sx: (t) => {
                    const isDark = t.palette.mode === "dark";
                    return {
                      borderRadius: "16px",
                      boxShadow: isDark
                        ? "0 8px 32px rgba(0,0,0,0.45)"
                        : "0 8px 32px rgba(0,0,0,0.12)",
                      minWidth: 240,
                      p: 0,
                      backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6",
                      border: `1px solid ${isDark ? "#444" : "#E5E7EB"}`,
                      overflow: "hidden",
                    };
                  },
                },
              }}
            >
              <List
                disablePadding
                sx={(t) => {
                  const isDark = t.palette.mode === "dark";
                  return {
                    m: "6px",
                    backgroundColor: isDark ? "#1e1e1e" : "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                  };
                }}
              >
                <ListItemButton
                  onClick={() => {
                    if (menuContractor) {
                      handleToggleActive(menuContractor);
                    }
                  }}
                  sx={(t) => ({
                    px: 2,
                    py: 1.2,
                    borderBottom: `1px solid ${t.palette.mode === "dark" ? "#333" : "#F0F0F0"}`,
                    "&:hover": {
                      backgroundColor:
                        t.palette.mode === "dark" ? "#333" : "#F9FAFB",
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <InfoOutlinedIcon
                      fontSize="small"
                      sx={(t) => ({
                        color:
                          t.palette.mode === "dark" ? "#9ca3af" : "#6b7280",
                      })}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Información activa"
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                  <Switch
                    size="small"
                    checked={menuContractor?.state ?? false}
                    onChange={() => {
                      if (menuContractor) {
                        handleToggleActive(menuContractor);
                      }
                    }}
                    color="primary"
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() =>
                    menuContractor && handleEditClick(menuContractor)
                  }
                  sx={(t) => ({
                    px: 2,
                    py: 1.2,
                    borderBottom: `1px solid ${t.palette.mode === "dark" ? "#333" : "#F0F0F0"}`,
                    "&:hover": {
                      backgroundColor:
                        t.palette.mode === "dark" ? "#333" : "#F9FAFB",
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <EditIcon
                      fontSize="small"
                      sx={(t) => ({
                        color:
                          t.palette.mode === "dark" ? "#9ca3af" : "#6b7280",
                      })}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Editar información"
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() =>
                    menuContractor && handleDeleteClick(menuContractor)
                  }
                  sx={(t) => ({
                    px: 2,
                    py: 1.2,
                    "&:hover": {
                      backgroundColor:
                        t.palette.mode === "dark" ? "#333" : "#F9FAFB",
                    },
                  })}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Eliminar"
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      color: "#ef4444",
                    }}
                  />
                </ListItemButton>
              </List>
            </Popover>
          </div>
        }
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar contratista"
        message={`¿Estás seguro que deseas eliminar al contratista ${selectedContractor?.name}? Esta acción no se puede deshacer.`}
        type="delete"
      />
      <AddContractorModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContractor}
      />
      <EditContractorModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contractor={selectedContractor}
        onSave={handleEditSave}
      />
    </>
  );
}

export default Contractors;

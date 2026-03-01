import { ConfirmationModal } from "@/components/ConfirmationModal";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import authRoles from "@auth/authRoles";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import WorkIcon from "@mui/icons-material/Work";
import {
    Badge,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { getContractors } from "../contractors/contractorsService";
import { ContractorResponse } from "../contractors/models/ContractorResponse";
import tagRoleMap from "./enum/RoleTag";
import {
    approveTag,
    createTag,
    deleteTag,
    getTags,
    getTagsPending,
    rejectedTag,
    updateTag,
} from "./tagService";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

interface RoleButtonProps {
  selected?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "text" | "outlined" | "contained";
}

const RoleButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "selected",
})<RoleButtonProps>(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.main : "white",
  color: selected ? "white" : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : theme.palette.grey[100],
  },
  borderRadius: "20px",
  margin: "0 4px",
  textTransform: "none",
  boxShadow: "none",
}));

const JobTypeCard = styled(Card)<{ approved?: boolean }>(
  ({ theme, approved }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    borderRadius: "8px",
    cursor: approved ? "pointer" : "not-allowed",
    backgroundColor: "white",
    opacity: approved ? 1 : 0.7,
    position: "relative",
    "&:hover": {
      boxShadow: approved ? theme.shadows[3] : "none",
    },
    width: "100%",
    height: "100%",
  }),
);

// Definición de tipo para trabajos
interface JobType {
  id: number;
  title: string;
  icon: React.ReactElement;
  role: string;
  description?: string;
  approved: boolean;
  company?: {
    name: string;
    id: number;
  };
}

// Interfaz extendida para la respuesta de la API que usamos en este componente
interface JobTitleResponse {
  name: string;
  description: string;
  tag: number;
  approved: number;
  id: number;
  created: string;
  company: {
    name: string;
    id: number;
  };
}

// Add reverse mapping for roles
const reverseTagRoleMap: { [key: string]: string } = {
  Trabajador: "CategoriaC",
  Supervisor: "CategoriaB",
  Gerente: "CategoriaA",
};

function Tag() {
  const { authState } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [tags, setTags] = useState<JobTitleResponse[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<JobTitleResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState("Trabajador");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [addTagModalOpen, setAddTagModalOpen] = useState(false);
  const [newTagTitle, setNewTagTitle] = useState("");
  const [newTagDescription, setNewTagDescription] = useState("");
  const [newTagType, setNewTagType] = useState("");
  const [newTagCompany, setNewTagCompany] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTag, setEditingTag] = useState<JobTitleResponse | null>(null);
  const [pendingTagsModalOpen, setPendingTagsModalOpen] = useState(false);
  const [pendingTags, setPendingTags] = useState<JobTitleResponse[]>([]);
  const [loadingPendingTags, setLoadingPendingTags] = useState(false);
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await getTags();
      if (response.succeeded) {
        // Asumimos que la respuesta tiene el formato correcto
        setTags(response.data as unknown as JobTitleResponse[]);

        // Convertir los tags de la API a formato JobType
        const convertedJobs: JobType[] = (
          response.data as unknown as JobTitleResponse[]
        ).map((tag) => ({
          id: tag.id,
          title: tag.name,
          icon: <WorkIcon color="primary" />,
          role: tagRoleMap[tag.tag],
          description: tag.description,
          approved: tag.approved === 1,
          company: tag.company,
        }));

        setJobTypes(convertedJobs);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchContractors();
    fetchPendingTags();
  }, []);

  const fetchPendingTags = async () => {
    try {
      const response = await getTagsPending();
      if (response.succeeded) {
        setPendingTags(response.data as unknown as JobTitleResponse[]);
      }
    } catch (error) {
      console.error("Error fetching pending tags:", error);
    } finally {
      setLoadingPendingTags(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const contractorsResponse = await getContractors();
      if (contractorsResponse.succeeded) {
        setContractors(contractorsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedTag) return;
      // Call the deleteTag function
      const deleteResponse = await deleteTag(selectedTag.id);

      if (deleteResponse.succeeded) {
        // After successful deletion, refresh the tags list
        await fetchTags();

        // Close the modal after successful deletion
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const handleAddTagClick = () => {
    setAddTagModalOpen(true);
  };

  const handleCloseAddTagModal = () => {
    setAddTagModalOpen(false);
    setIsEditMode(false);
    setEditingTag(null);
    // Clear all fields
    setNewTagTitle("");
    setNewTagDescription("");
    setNewTagType("");
    setNewTagCompany("");
  };

  const handleAddTagConfirm = async () => {
    if (newTagTitle && newTagType) {
      try {
        const tagData = {
          name: newTagTitle,
          description: newTagDescription,
          tag: newTagType,
          companyId:
            newTagCompany ||
            (authState?.user?.companyId != null
              ? authState?.user?.companyId
              : null),
        };

        let response;
        if (isEditMode && editingTag) {
          response = await updateTag(editingTag.id, tagData);
        } else {
          response = await createTag(tagData);
        }

        if (response?.succeeded) {
          enqueueSnackbar(
            isEditMode
              ? "Cargo actualizado exitosamente"
              : "Cargo creado exitosamente",
            { variant: "success" },
          );
          // Refrescar la lista después de la adición/edición exitosa
          await fetchTags();
          // Actualizar también la lista de cargos pendientes para refrescar el contador del badge
          await fetchPendingTags();

          // Cerrar el modal y limpiar los campos después de la adición/edición exitosa
          handleCloseAddTagModal();
        } else {
          const errorMessage =
            response?.errors?.[0] ||
            response?.messages?.[0] ||
            response?.message ||
            (isEditMode
              ? "Error al actualizar el cargo"
              : "Error al crear el cargo");
          enqueueSnackbar(errorMessage, { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar(
          isEditMode
            ? "Error al actualizar el cargo"
            : "Error al crear el cargo",
          { variant: "error" },
        );
      }
    }
  };

  const handleDeleteClick = () => {
    if (editingTag) {
      setSelectedTag(editingTag);
      setIsDeleteModalOpen(true);
      setAddTagModalOpen(false);
    }
  };

  const handlePendingTagsClick = async () => {
    setLoadingPendingTags(true);
    setPendingTagsModalOpen(true);
    setLoadingPendingTags(false);
  };

  const handleApproveTag = async (tagId: number) => {
    try {
      const response = await approveTag(tagId);
      if (response.succeeded) {
        // Refresh the pending tags list
        await fetchPendingTags();
        // Refresh the main tags list
        await fetchTags();
      }
    } catch (error) {
      console.error("Error approving tag:", error);
    }
  };

  const handleRejectTag = async (tagId: number) => {
    try {
      const response = await rejectedTag(tagId);
      if (response.succeeded) {
        // Refresh the pending tags list
        await fetchPendingTags();
        // Refresh the main tags list
        await fetchTags();
      }
    } catch (error) {
      console.error("Error rejecting tag:", error);
    }
  };

  // Get unique companies from jobTypes
  const uniqueCompanies = Array.from(
    new Set(
      jobTypes
        .filter((job) => job.company?.name) // Only include jobs with a company name
        .map((job) => job.company.name),
    ),
  );
  uniqueCompanies.sort();

  // Filtrar los trabajos según el rol seleccionado y la compañía
  const filteredJobTypes = jobTypes.filter(
    (job) =>
      job.role === selectedRole &&
      (selectedCompany === "all" || job.company?.name === selectedCompany),
  );

  const handleCardClick = (job: JobType) => {
    // Only allow admins to edit tags
    if (
      !authState?.user?.role ||
      !authRoles.admin.includes(authState.user.role as string)
    ) {
      return;
    }

    // Find the original tag data from the tags array
    const tagData = tags.find((tag) => tag.id === job.id);
    if (tagData) {
      setEditingTag(tagData);
      setNewTagTitle(tagData.name);
      setNewTagDescription(tagData.description);
      // Convert the role text to its corresponding number
      setNewTagType(reverseTagRoleMap[job.role] || "");
      setNewTagCompany(tagData.company?.id?.toString() || "");
      setIsEditMode(true);
      setAddTagModalOpen(true);
    }
  };

  return (
    <>
      <Root
        header={
          <div className="p-6 flex items-center justify-between">
            {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
            <h2 className="text-2xl font-bold">Lista de Cargos</h2>
          </div>
        }
        content={
          <div className="p-6">
            {/* Role selection buttons and filters */}
            <Box sx={{ display: "flex", mb: 3, alignItems: "center" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <RoleButton
                  variant="contained"
                  selected={selectedRole === "Trabajador"}
                  onClick={() => setSelectedRole("Trabajador")}
                >
                  Trabajador
                </RoleButton>
                <RoleButton
                  variant="contained"
                  selected={selectedRole === "Supervisor"}
                  onClick={() => setSelectedRole("Supervisor")}
                >
                  Supervisora
                </RoleButton>
                <RoleButton
                  variant="contained"
                  selected={selectedRole === "Gerente"}
                  onClick={() => setSelectedRole("Gerente")}
                >
                  Gerente
                </RoleButton>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {authState?.user?.role &&
                authRoles.admin.includes(authState.user.role as string) && (
                  <>
                    {/* Company Filter */}
                    <FormControl sx={{ minWidth: 200, mr: 2 }}>
                      <Select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        size="small"
                        displayEmpty
                      >
                        <MenuItem value="all">Todas las compañías</MenuItem>
                        {uniqueCompanies.map((company) => (
                          <MenuItem key={company} value={company}>
                            {company}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePendingTagsClick}
                      sx={{ mr: 2, position: "relative" }}
                    >
                      <Badge
                        badgeContent={pendingTags.length}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            right: -10,
                            top: -5,
                            border: "2px solid white",
                            minWidth: "20px",
                            height: "20px",
                            borderRadius: "10px",
                          },
                        }}
                      >
                        Cargos pendientes
                      </Badge>
                    </Button>
                  </>
                )}
              {/* <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddTagClick}
                            >
                                Añadir Cargo
                            </Button> */}
            </Box>

            {/* Job type cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 2,
                mb: 4,
                minHeight: "200px",
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography>Cargando...</Typography>
                </Box>
              ) : filteredJobTypes.length > 0 ? (
                filteredJobTypes.map((job) => (
                  <JobTypeCard
                    key={job.id}
                    onClick={() =>
                      job.approved &&
                      (authState?.user?.role &&
                      authRoles.admin.includes(authState.user.role as string)
                        ? handleCardClick(job)
                        : null)
                    }
                    approved={job.approved}
                  >
                    <Box
                      sx={{
                        bgcolor: "#e3f2fd",
                        borderRadius: "50%",
                        p: 1.5,
                        mb: 1.5,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {job.icon}
                    </Box>
                    <Typography variant="subtitle1">{job.title}</Typography>
                    {job.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, textAlign: "center" }}
                      >
                        {job.description}
                      </Typography>
                    )}
                    {job.company &&
                      authState?.user?.companyId !== job.company.id && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, textAlign: "center" }}
                        >
                          {job.company.name}
                        </Typography>
                      )}
                    {!job.approved && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "warning.main",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                        }}
                      >
                        Pendiente
                      </Typography>
                    )}
                  </JobTypeCard>
                ))
              ) : (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography>
                    No hay tags disponibles para este rol.
                  </Typography>
                </Box>
              )}
            </Box>
          </div>
        }
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar cargo"
        message={`¿Estás seguro que deseas eliminar el cargo: ${selectedTag?.name}? Esta acción no se puede deshacer.`}
        type="delete"
      />

      {/* Add/Edit Tag Modal */}
      <Dialog
        open={addTagModalOpen}
        onClose={handleCloseAddTagModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem", pb: 1 }}>
          {isEditMode ? "Editar Cargo" : "Agregar Nuevo Cargo"}
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Nombre del Cargo
            </div>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={newTagTitle}
              onChange={(e) => setNewTagTitle(e.target.value)}
              placeholder="Ingrese nombre del cargo"
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
                marginTop: 8,
              }}
            >
              Descripción
            </div>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={newTagDescription}
              onChange={(e) => setNewTagDescription(e.target.value)}
              placeholder="Ingrese descripción del cargo"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Tipo
            </div>
            <FormControl fullWidth>
              <Select
                id="tag-type-select"
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value)}
                size="small"
                variant="outlined"
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Seleccione un tipo
                </MenuItem>
                <MenuItem value="CategoriaC">Trabajador</MenuItem>
                <MenuItem value="CategoriaB">Supervisor</MenuItem>
                <MenuItem value="CategoriaA">Gerente</MenuItem>
              </Select>
            </FormControl>

            {authState?.user?.role &&
              authRoles.admin.includes(authState.user.role as string) && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}
                  >
                    Compañía
                  </div>
                  <FormControl fullWidth>
                    <Select
                      id="company-select"
                      value={newTagCompany}
                      onChange={(e) => setNewTagCompany(e.target.value)}
                      size="small"
                      variant="outlined"
                      displayEmpty
                    >
                      <MenuItem value="">Seleccione una compañía</MenuItem>
                      {contractors.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 0, flexDirection: "column" }}>
          <Box sx={{ display: "flex", width: "100%", mb: 2 }}>
            <Button
              onClick={handleCloseAddTagModal}
              variant="outlined"
              color="inherit"
              sx={{ flex: 1, mr: 2, bgcolor: "#F5F7FA" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddTagConfirm}
              variant="contained"
              color="primary"
              sx={{ flex: 1 }}
              disabled={
                !newTagTitle ||
                !newTagType ||
                !newTagDescription ||
                (authState?.user?.role &&
                  authRoles.admin.includes(authState.user.role as string) &&
                  !newTagCompany)
              }
            >
              {isEditMode ? "Guardar" : "Confirmar"}
            </Button>
          </Box>
          {isEditMode && (
            <Button
              onClick={handleDeleteClick}
              variant="outlined"
              color="error"
              fullWidth
            >
              Eliminar Cargo
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Pending Tags Modal */}
      <Dialog
        open={pendingTagsModalOpen}
        onClose={() => setPendingTagsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Cargos Pendientes
          <IconButton
            aria-label="close"
            onClick={() => setPendingTagsModalOpen(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
              "&:hover": {
                color: (theme) => theme.palette.grey[700],
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {loadingPendingTags ? (
            <Typography>Cargando...</Typography>
          ) : pendingTags.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 2, boxShadow: 2 }}
            >
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Nombre</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Tipo</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Compañía</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        Fecha de Creación
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold">Acciones</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingTags.map((tag) => (
                    <TableRow
                      key={tag.id}
                      sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                    >
                      <TableCell>{tag.name}</TableCell>
                      <TableCell>{tagRoleMap[tag.tag]}</TableCell>
                      <TableCell>{tag.company?.name}</TableCell>
                      <TableCell>
                        {new Date(tag.created || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Aprobar cargo">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleApproveTag(tag.id)}
                            sx={{ mr: 1 }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rechazar cargo">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRejectTag(tag.id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography>No hay cargos pendientes.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Tag;

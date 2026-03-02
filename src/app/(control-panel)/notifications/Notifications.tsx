import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import FormDialog from "@/components/ui/FormDialog";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import FusePageSimple from "@fuse/core/FusePageSimple";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import React, { useEffect, useMemo, useState } from "react";
import { getBlocks } from "../block/blockService";
import { BlockResponse } from "../block/models/BlockResponse";
import { getContractors } from "../contractors/contractorsService";
import { ContractorResponse } from "../contractors/models/ContractorResponse";
import {
  AudienceNotification,
  createMobileNotification,
  CreateMobileNotificationCommand,
  getNotifications,
  GetNotificationsParams,
  MobileNotificationDto,
} from "./NotificationService";

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

function Notifications() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { enqueueSnackbar } = useSnackbar();
  // Notifications list state
  const [notifications, setNotifications] = useState<MobileNotificationDto[]>(
    [],
  );
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const AUDIENCE_OPTIONS = [
    { value: -1, label: "" },
    { value: AudienceNotification.All, label: "Todos" },
    { value: AudienceNotification.Company, label: "Compañía" },
    { value: AudienceNotification.InTheCamp, label: "En el campamento" },
    {
      value: AudienceNotification.InTheCampByCompany,
      label: "En el campamento por compañía",
    },
    {
      value: AudienceNotification.InTheCampByBlock,
      label: "En el campamento por pabellon",
    },
  ];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<
    AudienceNotification | number
  >(-1);
  const [companyFilter, setCompanyFilter] = useState<number | "">("");

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationDescription, setNotificationDescription] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<
    AudienceNotification | -1
  >(-1);
  const [selectedCompany, setSelectedCompany] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | "">("");
  const hasFilters = useMemo(
    () =>
      searchTerm.trim().length > 0 ||
      audienceFilter !== -1 ||
      companyFilter !== "",
    [searchTerm, audienceFilter, companyFilter],
  );

  const fetchContractors = async () => {
    try {
      const response = await getContractors();
      if (response.succeeded && Array.isArray(response.data)) {
        setContractors(response.data);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: GetNotificationsParams = {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      };

      if (audienceFilter !== -1) {
        params.audiencia = audienceFilter as AudienceNotification;
      }
      if (companyFilter !== "") {
        params.companyId = companyFilter as number;
      }
      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }

      const response = await getNotifications(params);
      if (response.succeeded && response.data) {
        setNotifications(response.data.items);
        setTotalCount(response.data.totalCount);
      } else {
        setNotifications([]);
        setTotalCount(0);
        enqueueSnackbar(
          response.errors?.[0] || "Error al obtener las notificaciones",
          { variant: "error" },
        );
      }
    } catch (error) {
      console.error("Error getting notifications:", error);
      setNotifications([]);
      setTotalCount(0);
      enqueueSnackbar("Error al obtener las notificaciones", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, audienceFilter, companyFilter]);

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      setPage(0);
      fetchNotifications();
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleAudienceFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAudienceFilter(Number(event.target.value));
    setPage(0);
  };

  const handleCompanyFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setCompanyFilter(value === "" ? "" : Number(value));
    setPage(0);
  };

  const handleOpenCreateModal = () => {
    setNotificationTitle("");
    setNotificationDescription("");
    setSelectedAudience(-1);
    setSelectedCompany("");
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNotificationTitle("");
    setNotificationDescription("");
    setSelectedAudience(-1);
    setSelectedCompany("");
    setCreating(false);
  };

  const handleAudienceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setSelectedAudience(value === -1 ? -1 : (value as AudienceNotification));
    // Reset company selection when audience changes unless it's a company-scoped audience
    if (
      value !== AudienceNotification.Company &&
      value !== AudienceNotification.InTheCampByCompany &&
      value !== AudienceNotification.InTheCampByBlock
    ) {
      setSelectedCompany("");
      setSelectedBlock("");
    }
    // If audience is by block, load blocks
    if (value === AudienceNotification.InTheCampByBlock) {
      // fetch blocks
      (async () => {
        try {
          const resp = await getBlocks();
          if (resp.succeeded && Array.isArray(resp.data)) {
            setBlocks(resp.data);
          } else {
            setBlocks([]);
          }
        } catch (err) {
          console.error("Error fetching blocks:", err);
          setBlocks([]);
        }
      })();
    }
  };

  const handleCompanyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedCompany(value === "" ? "" : Number(value));
  };

  const handleBlockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedBlock(value === "" ? "" : Number(value));
  };

  const isFormValid = () => {
    if (
      !notificationTitle.trim() ||
      !notificationDescription.trim() ||
      selectedAudience === -1
    ) {
      return false;
    }
    // If audience is Company, company must be selected
    if (
      (selectedAudience === AudienceNotification.Company ||
        selectedAudience === AudienceNotification.InTheCampByCompany) &&
      selectedCompany === ""
    ) {
      return false;
    }
    // If audience is InTheCampByBlock, block must be selected
    if (
      selectedAudience === AudienceNotification.InTheCampByBlock &&
      selectedBlock === ""
    ) {
      return false;
    }
    return true;
  };

  const handleCreateNotification = async () => {
    if (!isFormValid()) {
      enqueueSnackbar("Por favor complete todos los campos requeridos", {
        variant: "warning",
      });
      return;
    }

    setCreating(true);
    try {
      const command: CreateMobileNotificationCommand = {
        Title: notificationTitle.trim(),
        Description: notificationDescription.trim(),
        Audiencia: selectedAudience as AudienceNotification,
        CompanyId:
          selectedAudience === AudienceNotification.Company ||
          selectedAudience === AudienceNotification.InTheCampByCompany
            ? (selectedCompany as number)
            : null,
        BlockId:
          selectedAudience === AudienceNotification.InTheCampByBlock
            ? (selectedBlock as number)
            : null,
      };

      const result = await createMobileNotification(command);

      if (result.succeeded) {
        enqueueSnackbar("Notificación enviada correctamente", {
          variant: "success",
        });
        handleCloseCreateModal();
        fetchNotifications(); // Refresh the list
      } else {
        enqueueSnackbar(
          result.errors?.[0] || "Error al enviar la notificación",
          { variant: "error" },
        );
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      enqueueSnackbar("Error al enviar la notificación", { variant: "error" });
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAudienceLabel = (audiencia?: AudienceNotification) => {
    if (audiencia === undefined) return "N/A";
    switch (audiencia) {
      case AudienceNotification.All:
        return "Todos";
      case AudienceNotification.Company:
        return "Compañía";
      case AudienceNotification.InTheCamp:
        return "En el campamento";
      case AudienceNotification.InTheCampByCompany:
        return "En el campamento por compañía";
      case AudienceNotification.InTheCampByBlock:
        return "En el campamento por pabellón";
      default:
        return "N/A";
    }
  };

  /* ---------- Column definitions ---------- */
  const columns: TableColumnDef<MobileNotificationDto>[] = useMemo(
    () => [
      {
        id: "title",
        label: "Título",
        render: (row) => <Typography fontWeight={600}>{row.title}</Typography>,
      },
      {
        id: "description",
        label: "Descripción",
        render: (row) => (
          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.description}
          </Typography>
        ),
      },
      {
        id: "created",
        label: "Fecha de Envío",
        render: (row) => (
          <Typography variant="body2">{formatDate(row.created)}</Typography>
        ),
      },
      {
        id: "audiencia",
        label: "Audiencia",
        render: (row) => (
          <Typography variant="body2" color="text.secondary">
            {getAudienceLabel(row.audiencia)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Root
        header={
          <div className="p-6 flex items-center justify-between">
            {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
            <h2 className="text-2xl font-bold">Notificaciones</h2>
          </div>
        }
        content={
          <div className="p-6 w-full">
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCreateModalOpen(true)}
              >
                Crear Notificación
              </Button>
            </Box>

            {/* Filters */}
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                p: 2,
                mb: 2,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: { xs: "stretch", md: "center" },
              }}
            >
              <TextField
                fullWidth
                placeholder="Buscar por título o descripción"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                size="small"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#F5F7FA",
                    borderRadius: "10px",
                    "& fieldset": { border: "1px solid #E5E7EB" },
                    "&:hover fieldset": { borderColor: "#d0d5dd" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#415EDE",
                      borderWidth: "1.5px",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Audiencia"
                size="small"
                value={audienceFilter}
                onChange={handleAudienceFilterChange}
                slotProps={{
                  select: { native: true },
                  inputLabel: { shrink: true },
                }}
                sx={{
                  minWidth: { xs: "100%", md: 180 },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#F5F7FA",
                    borderRadius: "10px",
                    "& fieldset": { border: "1px solid #E5E7EB" },
                    "&:hover fieldset": { borderColor: "#d0d5dd" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#415EDE",
                      borderWidth: "1.5px",
                    },
                  },
                }}
              >
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
              <TextField
                select
                label="Empresa"
                size="small"
                value={companyFilter === "" ? "" : String(companyFilter)}
                onChange={handleCompanyFilterChange}
                slotProps={{
                  select: { native: true },
                  inputLabel: { shrink: true },
                }}
                sx={{
                  minWidth: { xs: "100%", md: 180 },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#F5F7FA",
                    borderRadius: "10px",
                    "& fieldset": { border: "1px solid #E5E7EB" },
                    "&:hover fieldset": { borderColor: "#d0d5dd" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#415EDE",
                      borderWidth: "1.5px",
                    },
                  },
                }}
              >
                <option value="">Todas</option>
                {contractors.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </option>
                ))}
              </TextField>
              {hasFilters && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    setAudienceFilter(-1);
                    setCompanyFilter("");
                    setPage(0);
                    fetchNotifications();
                  }}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 500,
                    px: 2,
                    color: "#415EDE",
                    "&:hover": { backgroundColor: "rgba(65,94,222,0.08)" },
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </Box>

            {/* StyledTable */}
            <StyledTable<MobileNotificationDto>
              columns={columns}
              data={notifications}
              getRowId={(row) => String(row.id)}
              loading={loading}
              loadingMessage="Cargando notificaciones..."
              emptyMessage="No se encontraron notificaciones"
              pagination={{
                count: Math.ceil(totalCount / rowsPerPage),
                page,
                rowsPerPage,
                onPageChange: handleChangePage,
              }}
            />
          </div>
        }
      />

      {/* Create Notification — right-side drawer */}
      <FormDialog
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        title="Crear Nueva Notificación"
        variant="drawer"
        submitLabel={creating ? "Enviando..." : "Enviar Notificación"}
        cancelLabel="Cancelar"
        loading={creating}
        submitDisabled={!isFormValid()}
        onSubmit={handleCreateNotification}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Título"
            value={notificationTitle}
            onChange={(event) => setNotificationTitle(event.target.value)}
            fullWidth
            required
            disabled={creating}
            placeholder="Ingrese el título de la notificación"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F7FA",
                borderRadius: "10px",
                "& fieldset": { border: "1px solid #E5E7EB" },
                "&:hover fieldset": { borderColor: "#d0d5dd" },
                "&.Mui-focused fieldset": {
                  borderColor: "#415EDE",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputLabel-root": { fontWeight: 500 },
            }}
          />

          <TextField
            label="Descripción"
            value={notificationDescription}
            onChange={(event) => setNotificationDescription(event.target.value)}
            fullWidth
            required
            multiline
            minRows={3}
            disabled={creating}
            placeholder="Ingrese la descripción de la notificación"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F7FA",
                borderRadius: "10px",
                "& fieldset": { border: "1px solid #E5E7EB" },
                "&:hover fieldset": { borderColor: "#d0d5dd" },
                "&.Mui-focused fieldset": {
                  borderColor: "#415EDE",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputLabel-root": { fontWeight: 500 },
            }}
          />

          <TextField
            select
            label="Audiencia"
            value={selectedAudience}
            onChange={handleAudienceChange}
            fullWidth
            required
            disabled={creating}
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F5F7FA",
                borderRadius: "10px",
                "& fieldset": { border: "1px solid #E5E7EB" },
                "&:hover fieldset": { borderColor: "#d0d5dd" },
                "&.Mui-focused fieldset": {
                  borderColor: "#415EDE",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputLabel-root": { fontWeight: 500 },
            }}
          >
            <option value={-1}>Seleccione una audiencia</option>
            <option value={AudienceNotification.All}>Todos</option>
            <option value={AudienceNotification.Company}>Compañía</option>
            <option value={AudienceNotification.InTheCamp}>
              En el campamento
            </option>
            <option value={AudienceNotification.InTheCampByCompany}>
              En el campamento por compañía
            </option>
            <option value={AudienceNotification.InTheCampByBlock}>
              En el campamento por pabellón
            </option>
          </TextField>

          {(selectedAudience === AudienceNotification.Company ||
            selectedAudience === AudienceNotification.InTheCampByCompany) && (
            <TextField
              select
              label="Empresa"
              value={selectedCompany === "" ? "" : String(selectedCompany)}
              onChange={handleCompanyChange}
              fullWidth
              required
              disabled={creating}
              slotProps={{
                select: { native: true },
                inputLabel: { shrink: true },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F5F7FA",
                  borderRadius: "10px",
                  "& fieldset": { border: "1px solid #E5E7EB" },
                  "&:hover fieldset": { borderColor: "#d0d5dd" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#415EDE",
                    borderWidth: "1.5px",
                  },
                },
                "& .MuiInputLabel-root": { fontWeight: 500 },
              }}
            >
              <option value="">Seleccione una empresa</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </TextField>
          )}

          {selectedAudience === AudienceNotification.InTheCampByBlock && (
            <TextField
              select
              label="Pabellón"
              value={selectedBlock === "" ? "" : String(selectedBlock)}
              onChange={handleBlockChange}
              fullWidth
              required
              disabled={creating}
              slotProps={{
                select: { native: true },
                inputLabel: { shrink: true },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#F5F7FA",
                  borderRadius: "10px",
                  "& fieldset": { border: "1px solid #E5E7EB" },
                  "&:hover fieldset": { borderColor: "#d0d5dd" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#415EDE",
                    borderWidth: "1.5px",
                  },
                },
                "& .MuiInputLabel-root": { fontWeight: 500 },
              }}
            >
              <option value="">Seleccione un pabellón</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </TextField>
          )}
        </Box>
      </FormDialog>
    </>
  );
}

export default Notifications;

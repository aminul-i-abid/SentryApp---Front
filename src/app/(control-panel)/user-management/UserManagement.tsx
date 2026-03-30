import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSnackbar } from "notistack";

import TopbarHeader from "@/components/TopbarHeader";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import UserDetailsSidebar, { UserDetailsData } from "./components/UserDetailsSidebar";
import UserEditSidebar, { UserEditData } from "./components/UserEditSidebar";
import UserCreateSidebar, { UserCreateData } from "./components/UserCreateSidebar";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
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
}));

// --- Dummy Data Setup ---
const DUMMY_USERS: UserDetailsData[] = [
  {
    id: "U001",
    rut: "12.345.678-9",
    name: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "+56 9 1234 5678",
    company: "Constructora Alpha",
    roles: ["Admin", "Manager"],
    lastReservation: "10/05/2026",
    creationDate: "05/01/2025",
    createdBy: "Sistema Admin",
    reservations: [
      { id: "21345", guest: "Juan Pérez", checkIn: "10/05/2026", checkOut: "15/05/2026", status: "Activa", room: "A-101" },
      { id: "21301", guest: "Juan Pérez", checkIn: "01/04/2026", checkOut: "05/04/2026", status: "Completada", room: "B-205" },
    ],
  },
  {
    id: "U002",
    rut: "98.765.432-1",
    name: "María",
    lastName: "González",
    email: "maria.g@example.com",
    phone: "+56 9 8765 4321",
    company: "Servicios Beta",
    roles: ["User"],
    lastReservation: "28/04/2026",
    creationDate: "15/02/2025",
    createdBy: "Sistema Admin",
    reservations: [
      { id: "21310", guest: "María González", checkIn: "28/04/2026", checkOut: "02/05/2026", status: "Activa", room: "C-302" }
    ],
  },
  {
    id: "U003",
    rut: "15.987.654-3",
    name: "Carlos",
    lastName: "López",
    email: "clopez@example.com",
    phone: "+56 9 1122 3344",
    company: "Constructora Alpha",
    roles: ["Housekeeping"],
    lastReservation: "Sin reservas",
    creationDate: "20/03/2025",
    createdBy: "Juan Pérez",
    reservations: [],
  },
];

export default function UserManagement() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // State
  const [users, setUsers] = useState<UserDetailsData[]>(DUMMY_USERS);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  
  // Modals & Sidebars
  const [selectedUser, setSelectedUser] = useState<UserDetailsData | null>(null);
  const [isViewSidebarOpen, setIsViewSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Popover Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuUser, setMenuUser] = useState<UserDetailsData | null>(null);

  // Table Columns
  const columns: TableColumnDef<UserDetailsData>[] = [
    { id: "rut", label: "RUT", width: "12%", render: (row) => row.rut },
    { id: "name", label: "Nombre", width: "14%", render: (row) => row.name },
    { id: "lastName", label: "Apellido", width: "14%", render: (row) => row.lastName },
    { id: "email", label: "Correo Electrónico", width: "20%", render: (row) => row.email },
    { id: "phone", label: "Número de teléfono", width: "15%", render: (row) => row.phone },
    { id: "company", label: "Empresa", width: "15%", render: (row) => row.company },
  ];

  /* --- Handlers --- */
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // View Sidebar
  const handleViewUser = (user: UserDetailsData) => {
    setSelectedUser(user);
    setIsViewSidebarOpen(true);
  };

  // Popover
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserDetailsData) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuUser(user);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuUser(null);
  };

  // Create action
  const handleCreateSave = (data: UserCreateData) => {
    const newUser: UserDetailsData = {
      id: `U00${users.length + 1}`,
      rut: data.rut,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      roles: data.roles,
      lastReservation: "Sin reservas",
      creationDate: new Date().toLocaleDateString("es-ES"),
      createdBy: "Sistema Admin",
      reservations: [],
    };
    
    setUsers((prev) => [newUser, ...prev]);
    enqueueSnackbar("Usuario creado exitosamente", { variant: "success" });
    setIsCreateSidebarOpen(false);
  };

  // Edit action
  const handleEditClick = (user: UserDetailsData) => {
    setSelectedUser(user);
    setIsEditSidebarOpen(true);
    handleMenuClose();
  };

  // Save Edit
  const handleEditSave = (data: UserEditData) => {
    // In a real app we would call API. Here we just update local state.
    setUsers((prev) => 
      prev.map((u) => u.id === data.id ? { ...u, ...data } : u)
    );
    enqueueSnackbar("Usuario actualizado exitosamente", { variant: "success" });
    setIsEditSidebarOpen(false);
  };

  // Delete action
  const handleDeleteClick = (user: UserDetailsData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      enqueueSnackbar(`Usuario ${selectedUser.name} eliminado.`, { variant: "success" });
    }
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Gestión de Usuarios
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
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "#3347b8",
                  },
                }}
                startIcon={<AddIcon />}
                onClick={() => setIsCreateSidebarOpen(true)}
              >
                Nuevo Usuario
              </Button>
            </div>
            
            <StyledTable
              columns={columns}
              data={users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
              getRowId={(row) => row.id}
              loading={false}
              renderActions={(user) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleViewUser(user)}
                    sx={(t) => ({
                      color: t.palette.mode === "dark" ? "#9ca3af" : "#6b7280",
                    })}
                  >
                    <VisibilityIcon fontSize="small" sx={{ color: '#415EDE' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, user)}
                    sx={(t) => ({
                      color: t.palette.mode === "dark" ? "#9ca3af" : "#6b7280",
                    })}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              actionsLabel="Acciones"
              pagination={{
                count: users.length,
                page,
                rowsPerPage,
                onPageChange: handleChangePage,
              }}
            />

            {/* Action Menu Popover */}
            <Popover
              open={Boolean(menuAnchorEl)}
              anchorEl={menuAnchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: (t) => ({
                    borderRadius: "16px",
                    boxShadow: t.palette.mode === "dark"
                      ? "0 8px 32px rgba(0,0,0,0.45)"
                      : "0 8px 32px rgba(0,0,0,0.12)",
                    minWidth: 200,
                    p: 0,
                    backgroundColor: t.palette.mode === "dark" ? "#2a2a2a" : "#F3F4F6",
                    border: `1px solid ${t.palette.mode === "dark" ? "#444" : "#eaeaea"}`,
                  }),
                },
              }}
            >
              <List disablePadding sx={{ m: "6px", backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff", borderRadius: "12px" }}>
                <ListItemButton
                  onClick={() => menuUser && handleEditClick(menuUser)}
                  sx={{
                    px: 2,
                    py: 1.2,
                    borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#333" : "#F0F0F0"}`,
                    "&:hover": {
                      backgroundColor: theme.palette.mode === "dark" ? "#333" : "#F9FAFB",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <img src="./assets/icons/edit-black.png" alt="edit" style={{ width: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Editar usuario" primaryTypographyProps={{ fontSize: "0.9rem", color: "#686868", fontWeight: 500 }} />
                </ListItemButton>
                <ListItemButton
                  onClick={() => menuUser && handleDeleteClick(menuUser)}
                  sx={{
                    px: 2,
                    py: 1.2,
                    "&:hover": {
                      backgroundColor: theme.palette.mode === "dark" ? "#333" : "#FEF2F2",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <img src="./assets/icons/delete.png" alt="delete" style={{ width: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Eliminar"
                    primaryTypographyProps={{ fontSize: "0.9rem", color: "#ef4444", fontWeight: 500 }}
                  />
                </ListItemButton>
              </List>
            </Popover>
          </div>
        }
      />

      {/* Sidebars & Modals */}
      <UserCreateSidebar
        open={isCreateSidebarOpen}
        onClose={() => setIsCreateSidebarOpen(false)}
        onSave={handleCreateSave}
      />
      
      <UserDetailsSidebar
        open={isViewSidebarOpen}
        onClose={() => setIsViewSidebarOpen(false)}
        user={selectedUser}
      />

      <UserEditSidebar
        open={isEditSidebarOpen}
        onClose={() => setIsEditSidebarOpen(false)}
        user={selectedUser ? {
          ...selectedUser,
          isLocked: false, // Defaulting dummy state
        } : null}
        onSave={handleEditSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar usuario"
        message={`¿Estás seguro que deseas eliminar al usuario ${selectedUser?.name}? Esta acción no se puede deshacer.`}
        type="delete"
      />
    </>
  );
}

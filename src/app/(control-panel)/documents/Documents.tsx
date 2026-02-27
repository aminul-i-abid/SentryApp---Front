import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import NavbarToggleButton from "@/components/theme-layouts/components/navbar/NavbarToggleButton";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box,
    Button,
    CircularProgress,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import useUser from '@auth/useUser';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { getAllDocuments, deleteDocument, downloadDocument, uploadDocument } from "./documentService";
import { Document as DocumentItem } from "./documentService";
import { is } from "immutable";

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

function Documents() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const { enqueueSnackbar } = useSnackbar();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState<string>("");
    const [isDragActive, setIsDragActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [downloadingFileName, setDownloadingFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { data: user } = useUser();
    const isSentryAdmin = user?.role === 'Sentry_Admin' || (Array.isArray(user?.role) && user?.role.includes('Sentry_Admin'));

    // Load documents on component mount
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await getAllDocuments();
            if (response.succeeded && response.data) {
                setDocuments(response.data);
            } else {
                enqueueSnackbar(response.message?.[0] || "Error al cargar documentos", {
                    variant: "error",
                });
            }
        } catch (error) {
            enqueueSnackbar("Error al cargar documentos", {
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDocument = async (name: string) => {
        try {
            const response = await deleteDocument(name);
            if (response.succeeded) {
                setDocuments((prevDocuments) => prevDocuments.filter((document) => document.fileName !== name));
                enqueueSnackbar("Documento eliminado.", {
                    variant: "success",
                });
            } else {
                enqueueSnackbar(response.message?.[0] || "Error al eliminar documento", {
                    variant: "error",
                });
            }
        } catch (error) {
            enqueueSnackbar("Error al eliminar documento", {
                variant: "error",
            });
        }
    };

    const handleDownloadDocument = async (name: string) => {
        setDownloadingFileName(name);
        try {
            await downloadDocument(name);
            enqueueSnackbar("Documento descargado.", {
                variant: "success",
            });
        } catch (error) {
            enqueueSnackbar("Error al descargar documento", {
                variant: "error",
            });
        } finally {
            setDownloadingFileName(null);
        }
    };

    const handleOpenModal = () => {
        setModalOpen(true);
        setErrorMessage(null);
        setSelectedFile(null);
        setDocumentName("");
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setIsDragActive(false);
        setErrorMessage(null);
        setSelectedFile(null);
        setDocumentName("");
    };

    const validateFile = (file: File | null) => {
        if (!file) {
            return false;
        }

        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
            setErrorMessage("Solo se permiten archivos con extensión .pdf");
            setSelectedFile(null);
            return false;
        }

        setErrorMessage(null);
        setSelectedFile(file);
        return true;
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);

        const file = event.dataTransfer.files?.[0] ?? null;
        validateFile(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        validateFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadDocument(selectedFile, documentName);
            if (response.succeeded) {
                enqueueSnackbar("Documento cargado exitosamente.", {
                    variant: "success",
                });
                handleCloseModal();
                // Reload documents list
                await loadDocuments();
            } else {
                enqueueSnackbar(response.message?.[0] || "Error al cargar documento", {
                    variant: "error",
                });
            }
        } catch (error) {
            enqueueSnackbar("Error al cargar documento", {
                variant: "error",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold">Documentos</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleOpenModal}
                            >
                                Cargar documento
                            </Button>
                        </Box>
                        {/* Split documents into general and company-specific */}
                        {isLoading ? (
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography>Cargando documentos...</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : documents.length === 0 ? (
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography>No hay documentos disponibles</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            (() => {
                                const generalDocs = documents.filter((d) => !d.companyId);
                                const companyDocs = documents.filter((d) => d.companyId);

                                const renderTable = (title: string, items: DocumentItem[], isGeneral = false) => (
                                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                            <Typography variant="h6">{title}</Typography>
                                        </Box>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Nombre</TableCell>
                                                    <TableCell>Creado por</TableCell>
                                                    <TableCell>Compañía</TableCell>
                                                    <TableCell>Fecha de carga</TableCell>
                                                    <TableCell align="center">Acciones</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {items.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center">
                                                            <Typography>No hay documentos en esta sección</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    items.map((document) => (
                                                        <TableRow key={document.id} hover>
                                                            <TableCell>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Typography
                                                                    >
                                                                        {document.name && document.name.trim() !== '' ? document.name : document.fileName}
                                                                    </Typography>
                                                                    {downloadingFileName === document.fileName && (
                                                                        <CircularProgress size={16} />
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{document.createdBy}</TableCell>
                                                            <TableCell>{document.companyName != "" ? document.companyName : "Publico"}</TableCell>
                                                            <TableCell>
                                                                {new Intl.DateTimeFormat('es-ES', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }).format(new Date(document.created))}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <IconButton
                                                                    color="primary"
                                                                    size="small"
                                                                    onClick={() => {
                                                                        if (downloadingFileName !== document.fileName) {
                                                                            handleDownloadDocument(document.fileName);
                                                                        }
                                                                    }}
                                                                    sx={{ mr: 1 }}
                                                                >
                                                                    <CloudDownloadIcon fontSize="small" />
                                                                </IconButton>
                                                                {(isSentryAdmin || (document.companyId != null && user?.companyId != null && document.companyId === Number(user.companyId))) && (
                                                                    <IconButton
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => handleDeleteDocument(document.fileName)}
                                                                    >
                                                                        <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                                                                    </IconButton>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                );

                                return (
                                    <>
                                        {console.log(isSentryAdmin)}
                                        {renderTable('Documentos generales', generalDocs, true)}
                                        {renderTable('Documentos de la compañia', companyDocs, false)}
                                    </>
                                );
                            })()
                        )}
                    </div>
                }
            />
            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    Cargar documento
                    <IconButton onClick={handleCloseModal} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        sx={{
                            border: "2px dashed",
                            borderColor: isDragActive ? theme.palette.primary.main : theme.palette.divider,
                            borderRadius: 2,
                            p: 4,
                            textAlign: "center",
                            backgroundColor: isDragActive ? "rgba(5, 58, 226, 0.04)" : "transparent",
                            transition: "all 0.2s ease-in-out",
                            cursor: "pointer",
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {selectedFile ? (
                            <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                                <InsertDriveFileIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {selectedFile.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Arrastrá aquí otro archivo para reemplazarlo o hacé clic para seleccionar.
                                </Typography>
                            </Box>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={1.5} alignItems="center">
                                <CloudUploadIcon color="action" sx={{ fontSize: 48 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Arrastrá tu documento
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Solo se aceptan archivos con extensión .pdf
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    Seleccionar archivo
                                </Button>
                            </Box>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            hidden
                            onChange={handleFileInputChange}
                        />
                    </Box>
                    {errorMessage && (
                        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    <TextField
                        label="Nombre"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                        inputProps={{ maxLength: 250 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseModal} color="inherit" disabled={isUploading}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleUpload} 
                        variant="contained" 
                        color="primary" 
                        disabled={!selectedFile || isUploading}
                        startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : undefined}
                    >
                        {isUploading ? "Cargando..." : "Cargar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Documents;

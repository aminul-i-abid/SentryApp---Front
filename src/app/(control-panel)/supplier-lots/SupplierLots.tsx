import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
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
	Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';
import authRoles from '@auth/authRoles';
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useSnackbar } from 'notistack';
import StyledTable from '@/components/ui/StyledTable';

import { getItems } from '../items/itemsService';
import type { ItemResponse } from '../items/models/Item';

import { getSuppliers } from '../suppliers/supplierService';
import type { SupplierResponse } from '../suppliers/models/Supplier';

import {
	createSupplierLot,
	deleteSupplierLot,
	getSupplierLots,
	getSupplierLotsByItem,
	updateSupplierLot
} from './supplierLotsService';
import type { SupplierLotFormData, SupplierLotResponse } from './models/SupplierLot';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
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

function toDateInputValue(dateString?: string | null): string {
	if (!dateString) return '';
	return dateString.length >= 10 ? dateString.slice(0, 10) : '';
}

function toDateDisplay(dateString?: string | null): string {
	if (!dateString) return '-';
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleDateString();
}

function SupplierLots() {
	const { t } = useTranslation('supplierLots');
	const { authState } = useAuth();
	const { enqueueSnackbar } = useSnackbar();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

	const [supplierLots, setSupplierLots] = useState<SupplierLotResponse[]>([]);
	const [filteredSupplierLots, setFilteredSupplierLots] = useState<SupplierLotResponse[]>([]);
	const [items, setItems] = useState<ItemResponse[]>([]);
	const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);

	const [loading, setLoading] = useState(false);
	const [loadingItems, setLoadingItems] = useState(false);
	const [loadingSuppliers, setLoadingSuppliers] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedItemId, setSelectedItemId] = useState<number>(0);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingSupplierLot, setEditingSupplierLot] = useState<SupplierLotResponse | null>(null);
	const [deletingSupplierLot, setDeletingSupplierLot] = useState<SupplierLotResponse | null>(null);

	const [formData, setFormData] = useState<SupplierLotFormData>({
		itemId: 0,
		supplierId: 0,
		description: '',
		portionQuantity: 0,
		portionsPerBox: 0,
		expirationDate: null,
		productionDate: null
	});

	const [productionDateInput, setProductionDateInput] = useState('');
	const [expirationDateInput, setExpirationDateInput] = useState('');

	const [saving, setSaving] = useState(false);

	const isAdmin = useMemo(() => {
		return !!(authState?.user?.role && authRoles.admin.includes(authState.user.role as string));
	}, [authState?.user?.role]);

	const fetchItems = async () => {
		setLoadingItems(true);
		try {
			const response = await getItems(1, 2000);
			if (response.succeeded && response.data) {
				setItems(response.data.items || []);
			} else {
				setItems([]);
			}
		} catch (error) {
			console.error('Error fetching items:', error);
			setItems([]);
		} finally {
			setLoadingItems(false);
		}
	};

	const fetchSuppliers = async () => {
		setLoadingSuppliers(true);
		try {
			const response = await getSuppliers(1, 2000);
			if (response.succeeded && response.data) {
				setSuppliers(response.data.items || []);
			} else {
				setSuppliers([]);
			}
		} catch (error) {
			console.error('Error fetching suppliers:', error);
			setSuppliers([]);
		} finally {
			setLoadingSuppliers(false);
		}
	};

	const fetchSupplierLots = async (itemId: number) => {
		setLoading(true);
		try {
			const response = itemId > 0 ? await getSupplierLotsByItem(itemId) : await getSupplierLots();

			if (response.succeeded && response.data) {
				const list = Array.isArray(response.data) ? response.data : [];
				setSupplierLots(list);
				applyFilters(list, searchTerm);
			} else {
				setSupplierLots([]);
				setFilteredSupplierLots([]);
				enqueueSnackbar(response.errors?.[0] || t('errors.load'), { variant: 'error' });
			}
		} catch (error) {
			console.error('Error fetching supplier lots:', error);
			setSupplierLots([]);
			setFilteredSupplierLots([]);
			enqueueSnackbar(t('errors.load'), { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const applyFilters = (list: SupplierLotResponse[], search: string) => {
		let filtered = list;

		if (search.trim()) {
			const query = search.toLowerCase();
			filtered = filtered.filter((lot) => {
				return (
					lot.description.toLowerCase().includes(query) ||
					(lot.itemDescription?.toLowerCase().includes(query) || false)
				);
			});
		}

		setFilteredSupplierLots(filtered);
	};

	useEffect(() => {
		fetchItems();
		fetchSuppliers();
		fetchSupplierLots(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		applyFilters(supplierLots, searchTerm);
	}, [searchTerm, supplierLots]);

	useEffect(() => {
		fetchSupplierLots(selectedItemId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedItemId]);

	const handleOpenModal = (supplierLot?: SupplierLotResponse) => {
		if (supplierLot) {
			setEditingSupplierLot(supplierLot);
			setFormData({
				itemId: supplierLot.itemId,
				supplierId: supplierLot.supplierId,
				description: supplierLot.description,
				portionQuantity: supplierLot.portionQuantity,
				portionsPerBox: supplierLot.portionsPerBox,
				expirationDate: supplierLot.expirationDate ? null : null,
				productionDate: supplierLot.productionDate ? null : null
			});
			setProductionDateInput(toDateInputValue(supplierLot.productionDate));
			setExpirationDateInput(toDateInputValue(supplierLot.expirationDate));
		} else {
			setEditingSupplierLot(null);
			setFormData({
				itemId: selectedItemId > 0 ? selectedItemId : 0,
				supplierId: 0,
				description: '',
				portionQuantity: 0,
				portionsPerBox: 0,
				expirationDate: null,
				productionDate: null
			});
			setProductionDateInput('');
			setExpirationDateInput('');
		}

		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingSupplierLot(null);
		setSaving(false);
	};

	const handleSave = async () => {
		if (!formData.itemId || formData.itemId === 0) {
			enqueueSnackbar(t('errors.emptyItem'), { variant: 'warning' });
			return;
		}

		if (!formData.description.trim()) {
			enqueueSnackbar(t('errors.emptyDescription'), { variant: 'warning' });
			return;
		}

		setSaving(true);
		try {
			const response = editingSupplierLot
				? await updateSupplierLot(editingSupplierLot.id, formData)
				: await createSupplierLot(formData);

			if (response.succeeded) {
				enqueueSnackbar(editingSupplierLot ? t('messages.updated') : t('messages.created'), {
					variant: 'success'
				});
				handleCloseModal();
				fetchSupplierLots(selectedItemId);
			} else {
				enqueueSnackbar(response.errors?.[0] || (editingSupplierLot ? t('errors.update') : t('errors.create')), {
					variant: 'error'
				});
			}
		} catch (error) {
			console.error('Error saving supplier lot:', error);
			enqueueSnackbar(editingSupplierLot ? t('errors.update') : t('errors.create'), { variant: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const handleOpenDeleteModal = (supplierLot: SupplierLotResponse) => {
		setDeletingSupplierLot(supplierLot);
		setIsDeleteModalOpen(true);
	};

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setDeletingSupplierLot(null);
	};

	const handleConfirmDelete = async () => {
		if (!deletingSupplierLot) return;

		try {
			const response = await deleteSupplierLot(deletingSupplierLot.id);
			if (response.succeeded) {
				enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
				handleCloseDeleteModal();
				fetchSupplierLots(selectedItemId);
			} else {
				enqueueSnackbar(response.errors?.[0] || t('errors.delete'), { variant: 'error' });
			}
		} catch (error) {
			console.error('Error deleting supplier lot:', error);
			enqueueSnackbar(t('errors.delete'), { variant: 'error' });
		}
	};

	return (
		<>
			<Root
				scroll="content"
				header={
					<div className="p-6 flex items-center justify-between">
						{isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
						<h2 className="text-2xl font-bold">{t('title')}</h2>
					</div>
				}
				content={
					<div className="p-6">
						<Box display="flex" justifyContent="flex-end" mb={4}>
							{isAdmin && (
								<Button
									variant="contained"
									color="primary"
									onClick={() => handleOpenModal()}
									sx={{
										borderRadius: '8px',
										textTransform: 'none',
										fontWeight: 600,
										px: 3
									}}
								>
									{t('addNew')}
								</Button>
							)}
						</Box>

						<Box mb={3} display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
							<Box display="flex" flex={1} gap={2} alignItems="center" sx={{ maxWidth: isMobile ? '100%' : 600 }}>
								<Box
									component="input"
									type="text"
									placeholder={t('search')}
									value={searchTerm}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
									sx={{
										flex: 1,
										height: 40,
										px: 2,
										borderRadius: 2,
										border: '1px solid #E2E8F0',
										bgcolor: 'white',
										fontSize: '0.9375rem',
										outline: 'none',
										transition: 'all 0.2s',
										'&:focus': {
											borderColor: '#415EDE',
											boxShadow: '0 0 0 2px rgba(65, 94, 222, 0.1)',
										}
									}}
								/>

								<FormControl sx={{ minWidth: 240 }} disabled={loadingItems} size="small">
									<Select
										value={selectedItemId}
										onChange={(e) => setSelectedItemId(Number(e.target.value))}
										displayEmpty
										sx={{
											height: 40,
											bgcolor: 'white',
											borderRadius: 2,
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
												borderColor: '#415EDE',
												borderWidth: '2px',
											},
											'&:hover .MuiOutlinedInput-notchedOutline': {
												borderColor: '#415EDE',
											}
										}}
									>
										<MenuItem value={0}>{t('filters.allItems')}</MenuItem>
										{items.map((item) => (
											<MenuItem key={item.id} value={item.id}>
												{item.description}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Box>

						<StyledTable<SupplierLotResponse>
							columns={[
								{
									id: 'item',
									label: t('table.item'),
									render: (row) => row.itemDescription || row.itemId
								},
								{
									id: 'supplier',
									label: t('table.supplier'),
									render: (row) => row.supplierDescription || row.supplierId
								},
								{
									id: 'description',
									label: t('table.description'),
									render: (row) => (
										<Typography fontWeight={600} sx={{ color: '#334155' }}>
											{row.description}
										</Typography>
									)
								},
								{
									id: 'portionQuantity',
									label: t('table.portionQuantity'),
									align: 'center',
									render: (row) => row.portionQuantity
								},
								{
									id: 'portionsPerBox',
									label: t('table.portionsPerBox'),
									align: 'center',
									render: (row) => row.portionsPerBox
								},
								{
									id: 'productionDate',
									label: t('table.productionDate'),
									render: (row) => toDateDisplay(row.productionDate)
								},
								{
									id: 'expirationDate',
									label: t('table.expirationDate'),
									render: (row) => toDateDisplay(row.expirationDate)
								}
							]}
							data={filteredSupplierLots}
							getRowId={(row) => String(row.id)}
							loading={loading}
							loadingMessage={t('loading')}
							emptyMessage={t('empty.message')}
							renderActions={(row) => isAdmin && (
								<Box display="flex" justifyContent="center" gap={1}>
									<Tooltip title={t('actions.edit')}>
										<IconButton
											size="small"
											sx={{ color: '#415EDE' }}
											onClick={() => handleOpenModal(row)}
										>
											<Box component="img" src="./assets/icons/edit-black.png" sx={{ width: 20, height: 20 }} alt="" />
										</IconButton>
									</Tooltip>
									<Tooltip title={t('actions.delete')}>
										<IconButton
											size="small"
											sx={{ color: '#EF4444' }}
											onClick={() => handleOpenDeleteModal(row)}
										>
											<Box component="img" src="./assets/icons/delete.png" sx={{ width: 20, height: 20 }} alt="" />
										</IconButton>
									</Tooltip>
								</Box>
							)}
							minWidth={1200}
						/>
					</div>
				}
			/>

			{/* Add/Edit Modal */}
			<Dialog
				open={isModalOpen}
				onClose={handleCloseModal}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: '16px',
						bgcolor: 'white'
					}
				}}
			>
				<DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>
					{editingSupplierLot ? t('modal.editTitle') : t('modal.addTitle')}
				</DialogTitle>
				<DialogContent>
					<Box display="flex" flexDirection="column" gap={2} mt={2}>
						<Box>
							<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
								{t('form.item')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
							</Typography>
							<FormControl fullWidth required disabled={saving || loadingItems} size="small">
								<Select
									value={formData.itemId || ''}
									displayEmpty
									onChange={(e) => setFormData({ ...formData, itemId: Number(e.target.value) })}
									sx={{
										height: 40,
										bgcolor: 'white',
										borderRadius: 2,
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#415EDE',
											borderWidth: '2px',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#415EDE',
										}
									}}
								>
									<MenuItem value="">
										<em>{t('form.selectItem')}</em>
									</MenuItem>
									{items.map((item) => (
										<MenuItem key={item.id} value={item.id}>
											{item.description}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>

						<Box>
							<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
								{t('form.supplier')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
							</Typography>
							<FormControl fullWidth required disabled={saving || loadingSuppliers} size="small">
								<Select
									value={formData.supplierId || ''}
									displayEmpty
									onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
									sx={{
										height: 40,
										bgcolor: 'white',
										borderRadius: 2,
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#415EDE',
											borderWidth: '2px',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#415EDE',
										}
									}}
								>
									<MenuItem value="">
										<em>{t('form.selectSupplier')}</em>
									</MenuItem>
									{suppliers.map((supplier) => (
										<MenuItem key={supplier.id} value={supplier.id}>
											{supplier.description}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>

						<Box>
							<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
								{t('form.description')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
							</Typography>
							<Box
								component="textarea"
								value={formData.description}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Ingrese la descripción del lote"
								rows={2}
								sx={{
									width: '100%',
									p: 2,
									borderRadius: 2,
									border: '1px solid #E2E8F0',
									bgcolor: 'white',
									fontSize: '0.9375rem',
									outline: 'none',
									transition: 'all 0.2s',
									fontFamily: 'inherit',
									resize: 'vertical',
									'&:focus': {
										borderColor: '#415EDE',
										boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
									}
								}}
							/>
						</Box>

						<Box display="flex" gap={2}>
							<Box flex={1}>
								<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
									{t('form.portionQuantity')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
								</Typography>
								<Box
									component="input"
									type="number"
									value={formData.portionQuantity ?? 0}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, portionQuantity: Number(e.target.value) })}
									sx={{
										width: '100%',
										height: 40,
										px: 2,
										borderRadius: 2,
										border: '1px solid #E2E8F0',
										bgcolor: 'white',
										fontSize: '0.9375rem',
										outline: 'none',
										transition: 'all 0.2s',
										'&:focus': {
											borderColor: '#415EDE',
											boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
										}
									}}
								/>
							</Box>

							<Box flex={1}>
								<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
									{t('form.portionsPerBox')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
								</Typography>
								<Box
									component="input"
									type="number"
									value={formData.portionsPerBox ?? 0}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, portionsPerBox: Number(e.target.value) })}
									sx={{
										width: '100%',
										height: 40,
										px: 2,
										borderRadius: 2,
										border: '1px solid #E2E8F0',
										bgcolor: 'white',
										fontSize: '0.9375rem',
										outline: 'none',
										transition: 'all 0.2s',
										'&:focus': {
											borderColor: '#415EDE',
											boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
										}
									}}
								/>
							</Box>
						</Box>

						<Box display="flex" gap={2}>
							<Box flex={1}>
								<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
									{t('form.productionDate')}
								</Typography>
								<Box
									component="input"
									type="date"
									value={productionDateInput}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setProductionDateInput(e.target.value);
										setFormData({
											...formData,
											productionDate: e.target.value ? new Date(e.target.value) : null
										});
									}}
									sx={{
										width: '100%',
										height: 40,
										px: 2,
										borderRadius: 2,
										border: '1px solid #E2E8F0',
										bgcolor: 'white',
										fontSize: '0.9375rem',
										outline: 'none',
										transition: 'all 0.2s',
										'&:focus': {
											borderColor: '#415EDE',
											boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
										}
									}}
								/>
							</Box>

							<Box flex={1}>
								<Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
									{t('form.expirationDate')}
								</Typography>
								<Box
									component="input"
									type="date"
									value={expirationDateInput}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setExpirationDateInput(e.target.value);
										setFormData({
											...formData,
											expirationDate: e.target.value ? new Date(e.target.value) : null
										});
									}}
									sx={{
										width: '100%',
										height: 40,
										px: 2,
										borderRadius: 2,
										border: '1px solid #E2E8F0',
										bgcolor: 'white',
										fontSize: '0.9375rem',
										outline: 'none',
										transition: 'all 0.2s',
										'&:focus': {
											borderColor: '#415EDE',
											boxShadow: '0 0 0 4px rgba(65, 94, 222, 0.1)',
										}
									}}
								/>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button
						onClick={handleCloseModal}
						disabled={saving}
						sx={{
							borderRadius: '8px',
							textTransform: 'none',
							color: 'text.secondary',
							fontWeight: 600
						}}
					>
						{t('modal.cancel')}
					</Button>
					<Button
						variant="contained"
						onClick={handleSave}
						disabled={saving || !formData.description.trim() || !formData.itemId || !formData.supplierId}
						sx={{
							borderRadius: '8px',
							textTransform: 'none',
							bgcolor: '#415EDE',
							fontWeight: 600,
							color: 'white',
							'&:hover': {
								bgcolor: '#354db1'
							}
						}}
					>
						{saving ? 'Guardando...' : t('modal.save')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={handleCloseDeleteModal}
				onConfirm={handleConfirmDelete}
				title={t('deleteModal.title')}
				message={t('deleteModal.message')}
				type="delete"
			/>
		</>
	);
}

export default SupplierLots;

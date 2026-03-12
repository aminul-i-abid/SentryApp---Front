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
	'& .FusePageSimple-content': {}
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
						<Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={2}>
							<Box display="flex" flex={1} gap={2} alignItems="center">
								<TextField
									placeholder={t('search')}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									fullWidth
									InputProps={{
										startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
									}}
								/>

								<FormControl sx={{ minWidth: 240 }} disabled={loadingItems}>
									<InputLabel id="supplier-lots-item-filter-label">{t('filters.item')}</InputLabel>
									<Select
										labelId="supplier-lots-item-filter-label"
										label={t('filters.item')}
										value={selectedItemId}
										onChange={(e) => setSelectedItemId(Number(e.target.value))}
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

							{isAdmin && (
								<Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
									{t('addNew')}
								</Button>
							)}
						</Box>

						{loading ? (
							<Box display="flex" justifyContent="center" mt={4}>
								<CircularProgress />
							</Box>
						) : filteredSupplierLots.length === 0 ? (
							<Box textAlign="center" mt={4}>
								<Typography variant="h6" gutterBottom>
									{t('empty.title')}
								</Typography>
								<Typography color="text.secondary">{t('empty.message')}</Typography>
							</Box>
						) : (
							<TableContainer component={Paper}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>{t('table.item')}</TableCell>
											<TableCell>{t('table.supplier')}</TableCell>
											<TableCell>{t('table.description')}</TableCell>
											<TableCell align="right">{t('table.portionQuantity')}</TableCell>
											<TableCell align="right">{t('table.portionsPerBox')}</TableCell>
											<TableCell>{t('table.productionDate')}</TableCell>
											<TableCell>{t('table.expirationDate')}</TableCell>
											{isAdmin && <TableCell align="center">{t('table.actions')}</TableCell>}
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredSupplierLots.map((lot) => (
											<TableRow key={lot.id} hover>
												<TableCell>{lot.itemDescription || lot.itemId}</TableCell>
												<TableCell>{lot.supplierDescription || lot.supplierId}</TableCell>
												<TableCell>{lot.description}</TableCell>
												<TableCell align="right">{lot.portionQuantity}</TableCell>
												<TableCell align="right">{lot.portionsPerBox}</TableCell>
												<TableCell>{toDateDisplay(lot.productionDate)}</TableCell>
												<TableCell>{toDateDisplay(lot.expirationDate)}</TableCell>
												{isAdmin && (
													<TableCell align="center">
														<Box display="flex" justifyContent="center" gap={1}>
															<Tooltip title={t('actions.edit')}>
																<IconButton size="small" onClick={() => handleOpenModal(lot)} color="primary">
																	<EditIcon fontSize="small" />
																</IconButton>
															</Tooltip>
															<Tooltip title={t('actions.delete')}>
																<IconButton size="small" onClick={() => handleOpenDeleteModal(lot)} color="error">
																	<DeleteIcon fontSize="small" />
																</IconButton>
															</Tooltip>
														</Box>
													</TableCell>
												)}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
					</div>
				}
			/>

			{/* Add/Edit Modal */}
			<Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
				<DialogTitle>{editingSupplierLot ? t('modal.editTitle') : t('modal.addTitle')}</DialogTitle>
				<DialogContent dividers>
					<Box display="flex" flexDirection="column" gap={3} mt={1}>
						<FormControl fullWidth required disabled={saving || loadingItems}>
							<InputLabel id="supplier-lots-item-label">{t('form.item')}</InputLabel>
							<Select
								labelId="supplier-lots-item-label"
								value={formData.itemId || ''}
								label={t('form.item')}
								onChange={(e) => setFormData({ ...formData, itemId: Number(e.target.value) })}
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

						<FormControl fullWidth required disabled={saving || loadingSuppliers}>
							<InputLabel id="supplier-lots-supplier-label">{t('form.supplier')}</InputLabel>
							<Select
								labelId="supplier-lots-supplier-label"
								value={formData.supplierId || ''}
								label={t('form.supplier')}
								onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
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

						<TextField
							label={t('form.description')}
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							fullWidth
							required
							disabled={saving}
							multiline
							rows={3}
						/>

						<TextField
							label={t('form.portionQuantity')}
							type="number"
							value={formData.portionQuantity ?? 0}
							onChange={(e) => setFormData({ ...formData, portionQuantity: Number(e.target.value) })}
							fullWidth
							required
							disabled={saving}
							inputProps={{ min: 0 }}
						/>

						<TextField
							label={t('form.portionsPerBox')}
							type="number"
							value={formData.portionsPerBox ?? 0}
							onChange={(e) => setFormData({ ...formData, portionsPerBox: Number(e.target.value) })}
							fullWidth
							required
							disabled={saving}
							inputProps={{ min: 0 }}
						/>

						<TextField
							label={t('form.productionDate')}
							type="date"
							value={productionDateInput}
							onChange={(e) => {
								setProductionDateInput(e.target.value);
								setFormData({
									...formData,
									productionDate: e.target.value ? new Date(e.target.value) : null
								});
							}}
							fullWidth
							disabled={saving}
							InputLabelProps={{ shrink: true }}
						/>

						<TextField
							label={t('form.expirationDate')}
							type="date"
							value={expirationDateInput}
							onChange={(e) => {
								setExpirationDateInput(e.target.value);
								setFormData({
									...formData,
									expirationDate: e.target.value ? new Date(e.target.value) : null
								});
							}}
							fullWidth
							disabled={saving}
							InputLabelProps={{ shrink: true }}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button color="inherit" onClick={handleCloseModal} disabled={saving}>
						{t('modal.cancel')}
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSave}
						disabled={saving || !formData.description.trim() || !formData.itemId || !formData.supplierId}
						startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
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

import { useState, useEffect } from 'react';
import { Box, Paper, Button, Typography } from '@mui/material';
import { DataGrid, GridPaginationModel } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { User, UserFilters, UserListRequest } from './types';
import { getUsers } from './services';
import Link from '@fuse/core/Link';
import Filters from './components/filters';
import { getUserColumns } from './components/columns';

function UsersList() {
	const [filterAccordionExpanded, setFilterAccordionExpanded] = useState(false);
	const [filters, setFilters] = useState<UserFilters>({
		firstName: '',
		lastName: '',
		email: '',
		enabled: undefined,
		enable2FA: undefined
	});

	const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
		page: 0,
		pageSize: 10
	});
	const [totalRows, setTotalRows] = useState(0);
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState<User[]>([]);

	const fetchUsers = async (page: number, pageSize: number, filters: UserFilters) => {
		try {
			setLoading(true);
			const request: UserListRequest = {
				page: page + 1,
				pageSize,
				filters
			};

			const response = await getUsers(request);

			if (response.succeeded) {
				const data = response.data;
				setRows(data || []);
				setTotalRows(response.totalCount);
			} else {
				console.error('Error fetching users:', response.errors);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(paginationModel.page, paginationModel.pageSize, filters);
	}, []);

	const handlePaginationModelChange = (newModel: GridPaginationModel) => {
		setPaginationModel(newModel);
		fetchUsers(newModel.page, newModel.pageSize, filters);
	};

	const handleApplyFilters = () => {
		setPaginationModel({ ...paginationModel, page: 0 });
		fetchUsers(0, paginationModel.pageSize, filters);
	};

	const handleFilterChange = (field: string, value: string) => {
		setFilters((prev) => ({
			...prev,
			[field]: value
		}));
	};

	return (
		<Box>
			<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
				<Typography variant="h5">Users Management</Typography>
				<Box>
					<Button
						variant="contained"
						component={Link}
						startIcon={<AddIcon />}
						to="/security/users/new"
						sx={{ mr: 2 }}
					>
						Create User
					</Button>
				</Box>
			</Box>

			<Filters
				expanded={filterAccordionExpanded}
				onExpandedChange={setFilterAccordionExpanded}
				filters={filters}
				onFilterChange={handleFilterChange}
				onApplyFilters={handleApplyFilters}
			/>

			<Paper elevation={3}>
				<DataGrid
					rows={rows}
					columns={getUserColumns()}
					paginationModel={paginationModel}
					onPaginationModelChange={handlePaginationModelChange}
					pageSizeOptions={[5, 10, 25]}
					rowCount={totalRows}
					loading={loading}
					paginationMode="server"
					sx={{ minHeight: 400 }}
				/>
			</Paper>
		</Box>
	);
}

export default UsersList;

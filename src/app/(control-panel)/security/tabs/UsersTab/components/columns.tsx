import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton, Switch, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import Link from '@fuse/core/Link';
import { YesNo } from '@/utils/enums';

export const getUserColumns = (): GridColDef[] => [
	{
		field: 'id',
		headerName: 'ID',
		width: 90,
		sortable: false,
		filterable: false
	},
	{
		field: 'firstName',
		headerName: 'First Name',
		flex: 1,
		sortable: false,
		filterable: false
	},
	{
		field: 'lastName',
		headerName: 'Last Name',
		flex: 1,
		sortable: false,
		filterable: false
	},
	{
		field: 'enabled',
		headerName: 'Enabled',
		width: 120,
		sortable: false,
		filterable: false,
		renderCell: (params: GridRenderCellParams) => (
			<Switch
				checked={params.value === YesNo.Yes}
				disabled
			/>
		)
	},
	{
		field: 'email',
		headerName: 'Email',
		sortable: false,
		flex: 1,
		filterable: false
	},
	{
		field: 'enable2FA',
		headerName: 'Enable 2FA',
		width: 120,
		sortable: false,
		filterable: false,
		renderCell: (params: GridRenderCellParams) => (
			<Switch
				checked={params.value === YesNo.Yes}
				disabled
			/>
		)
	},
	{
		field: 'lastAccess',
		headerName: 'Last Access',
		sortable: false,
		width: 180,
		filterable: false
	},
	{
		field: 'actions',
		headerName: 'Actions',
		width: 120,
		sortable: false,
		filterable: false,
		renderCell: (params: GridRenderCellParams) => (
			<Box>
				<Tooltip title="Edit User">
					<IconButton
						component={Link}
						size="small"
						to={`/security/users/edit/${params.row.id}`}
					>
						<EditIcon />
					</IconButton>
				</Tooltip>
			</Box>
		)
	}
];

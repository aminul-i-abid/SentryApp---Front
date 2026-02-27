import {
	Box,
	TextField,
	Button,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	Select,
	MenuItem,
	FormControl,
	InputLabel
} from '@mui/material';
import { FilterList as FilterListIcon, Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { UserFilters } from '../types';
import { YesNo } from '@/utils/enums';

interface FiltersProps {
	expanded: boolean;
	onExpandedChange: (expanded: boolean) => void;
	filters: UserFilters;
	onFilterChange: (field: string, value: any) => void;
	onApplyFilters: () => void;
}

function Filters({ expanded, onExpandedChange, filters, onFilterChange, onApplyFilters }: FiltersProps) {
	return (
		<Accordion
			expanded={expanded}
			onChange={() => onExpandedChange(!expanded)}
			sx={{ mb: 3 }}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<FilterListIcon sx={{ mr: 1 }} />
					<Typography>Filters</Typography>
				</Box>
			</AccordionSummary>
			<AccordionDetails>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<TextField
							label="First Name"
							size="small"
							value={filters.firstName || ''}
							onChange={(e) => onFilterChange('firstName', e.target.value)}
						/>
						<TextField
							label="Last Name"
							size="small"
							value={filters.lastName || ''}
							onChange={(e) => onFilterChange('lastName', e.target.value)}
						/>
						<TextField
							label="Email"
							size="small"
							value={filters.email || ''}
							onChange={(e) => onFilterChange('email', e.target.value)}
						/>
						<FormControl
							size="small"
							sx={{ minWidth: 120 }}
						>
							<InputLabel>Enabled</InputLabel>
							<Select
								value={filters.enabled ?? ''}
								label="Enabled"
								onChange={(e) => onFilterChange('enabled', e.target.value)}
							>
								<MenuItem value="">All</MenuItem>
								<MenuItem value={YesNo.Yes}>Yes</MenuItem>
								<MenuItem value={YesNo.No}>No</MenuItem>
							</Select>
						</FormControl>
						<FormControl
							size="small"
							sx={{ minWidth: 120 }}
						>
							<InputLabel>2FA</InputLabel>
							<Select
								value={filters.enable2FA ?? ''}
								label="2FA"
								onChange={(e) => onFilterChange('enable2FA', e.target.value)}
							>
								<MenuItem value="">All</MenuItem>
								<MenuItem value={YesNo.Yes}>Yes</MenuItem>
								<MenuItem value={YesNo.No}>No</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Button
							variant="contained"
							startIcon={<SearchIcon />}
							onClick={onApplyFilters}
						>
							Apply Filters
						</Button>
					</Box>
				</Box>
			</AccordionDetails>
		</Accordion>
	);
}

export default Filters;

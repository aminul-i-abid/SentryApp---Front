import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import AuditoryFilters from './components/AuditoryFilters';
import { SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import { AuditoryTables, AUDITORY_TABLE_OPTIONS } from './models/AuditoryTables';

// Imports de los componentes de tabla
import AuditoryBlockTable from './components/AuditoryBlockTable';
import AuditoryCampTable from './components/AuditoryCampTable';
import AuditoryCompanyTable from './components/AuditoryCompanyTable';
import AuditoryDoorLockRoomHistoryTable from './components/AuditoryDoorLockRoomHistoryTable';
import AuditoryEmailTable from './components/AuditoryEmailTable';
import AuditoryReserveTable from './components/AuditoryReserveTable';
import AuditoryRoomDisabledHistoryTable from './components/AuditoryRoomDisabledHistoryTable';
import AuditoryTTLockTransactionTable from './components/AuditoryTTLockTransactionTable';
import AuditoryWhatsappTable from './components/AuditoryWhatsappTable';
import AuditorySmsTable from './components/AuditorySmsTable';
import AuditoryUserTable from './components/AuditoryUserTable';
import AuditoryRoomTable from './components/AuditoryRoomTable';
import AuditoryDoorLockAccessLogsTable from './components/AuditoryDoorLockAccessLogsTable';
import AuditoryReportsTable from './components/AuditoryReportsTable';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Auditory() {
	const [selectedTable, setSelectedTable] = useState<AuditoryTables | ''>('');

	const handleTableChange = (event: SelectChangeEvent<AuditoryTables | ''>) => {
		setSelectedTable(event.target.value as AuditoryTables | '');
	};

	// Función para renderizar el componente de tabla correspondiente
	const renderTableComponent = () => {
		switch (selectedTable) {
			case AuditoryTables.BLOCK:
				return <AuditoryBlockTable />;
			case AuditoryTables.CAMP:
				return <AuditoryCampTable />;
			case AuditoryTables.COMPANY:
				return <AuditoryCompanyTable />;
			case AuditoryTables.DOORLOCK:
				return <AuditoryDoorLockRoomHistoryTable />;
			case AuditoryTables.EMAIL:
				return <AuditoryEmailTable />;
			case AuditoryTables.RESERVATIONS:
				return <AuditoryReserveTable />;
			case AuditoryTables.ROOMDISABLEDSTATES:
				return <AuditoryRoomDisabledHistoryTable />;
			case AuditoryTables.TTLOCKTRANSACTIONS:
				return <AuditoryTTLockTransactionTable />;
			case AuditoryTables.WHATSAPP:
				return <AuditoryWhatsappTable />;
			case AuditoryTables.SMS:
				return <AuditorySmsTable />;
			case AuditoryTables.USER:
				return <AuditoryUserTable />;
			case AuditoryTables.ROOM:
				return <AuditoryRoomTable />;	
			case AuditoryTables.REPORTS:
				return <AuditoryReportsTable />;
			case AuditoryTables.DOORLOCKACCESSLOGS:
				return <AuditoryDoorLockAccessLogsTable />;			
			default:
				return (
					<div className="text-center py-8 text-gray-500">
						Selecciona una tabla para ver los datos de auditoría
					</div>
				);
		}
	};

	return (
		<Root
			header={
				<div className="p-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold">Auditoría</h2>
				</div>
			}
			content={
				<div className="p-6">
					<AuditoryFilters 
						selectedTable={selectedTable} 
						onTableChange={handleTableChange}
					/>
					<div className="mt-6">
						{renderTableComponent()}
					</div>
				</div>
			}
		/>
	);
}

export default Auditory;

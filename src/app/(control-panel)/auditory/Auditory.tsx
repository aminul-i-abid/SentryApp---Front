import FusePageSimple from "@fuse/core/FusePageSimple";
import { SelectChangeEvent } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import AuditoryFilters from "./components/AuditoryFilters";
import { AuditoryTables } from "./models/AuditoryTables";

// Imports de los componentes de tabla
import TopbarHeader from "@/components/TopbarHeader";
import AuditoryBlockTable from "./components/AuditoryBlockTable";
import AuditoryCampTable from "./components/AuditoryCampTable";
import AuditoryCompanyTable from "./components/AuditoryCompanyTable";
import AuditoryDoorLockAccessLogsTable from "./components/AuditoryDoorLockAccessLogsTable";
import AuditoryDoorLockRoomHistoryTable from "./components/AuditoryDoorLockRoomHistoryTable";
import AuditoryEmailTable from "./components/AuditoryEmailTable";
import AuditoryReportsTable from "./components/AuditoryReportsTable";
import AuditoryReserveTable from "./components/AuditoryReserveTable";
import AuditoryRoomDisabledHistoryTable from "./components/AuditoryRoomDisabledHistoryTable";
import AuditoryRoomTable from "./components/AuditoryRoomTable";
import AuditorySmsTable from "./components/AuditorySmsTable";
import AuditoryTTLockTransactionTable from "./components/AuditoryTTLockTransactionTable";
import AuditoryUserTable from "./components/AuditoryUserTable";
import AuditoryWhatsappTable from "./components/AuditoryWhatsappTable";

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

function Auditory() {
  const [selectedTable, setSelectedTable] = useState<AuditoryTables | "">("");

  const handleTableChange = (event: SelectChangeEvent<AuditoryTables | "">) => {
    setSelectedTable(event.target.value as AuditoryTables | "");
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
      header={<TopbarHeader />}
      content={
        <div className="p-6">
          <AuditoryFilters
            selectedTable={selectedTable}
            onTableChange={handleTableChange}
          />
          <div className="mt-6">{renderTableComponent()}</div>
        </div>
      }
    />
  );
}

export default Auditory;

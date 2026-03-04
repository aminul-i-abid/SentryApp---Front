import RoomDetailSidebar from "@/app/(control-panel)/room/components/RoomDetailSidebar";
import tagRoleMap from "@/app/(control-panel)/tag/enum/RoleTag";
import StyledTable, { TableColumnDef } from "@/components/ui/StyledTable";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

interface Room {
  id: number;
  roomNumber: string;
  beds: number;
  tag: number;
  doorLockId?: string | number;
}

interface Block {
  id: number;
  name: string;
  totalRooms: number;
  rooms: Room[];
}

interface ListConstructorsCampsProps {
  blocks: Block[];
  showBackToBlocksButton?: boolean;
  onBackToBlocks?: () => void;
}

function ListConstructorsCamps({
  blocks,
  showBackToBlocksButton = false,
  onBackToBlocks,
}: ListConstructorsCampsProps) {
  // Flatten all rooms with their block name
  const allRooms = blocks.flatMap((block) =>
    block.rooms.map((room) => ({ ...room, blockName: block.name })),
  );

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedRoomForSidebar, setSelectedRoomForSidebar] =
    React.useState<Room | null>(null);

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedRoomForSidebar(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const columns: TableColumnDef<any>[] = [
    {
      id: "roomNumber",
      label: "Habitación",
      render: (row) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          {row.roomNumber}
          {row.doorLockId && (
            <MeetingRoomIcon
              sx={{ fontSize: 16, color: "primary.main", verticalAlign: "top" }}
            />
          )}
        </Box>
      ),
    },
    {
      id: "beds",
      label: "Total de camas",
      render: (row) => row.beds,
    },
    {
      id: "blockName",
      label: "Pabellón",
      render: (row) => row.blockName,
    },
    {
      id: "tag",
      label: "Estándar",
      render: (row) =>
        tagRoleMap[row.tag as keyof typeof tagRoleMap] || "Sin Estándar",
    },
  ];

  const pagedRooms = allRooms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <>
      <div className="flex justify-between items-center mb-5 gap-2">
        <Typography variant="h5" fontWeight={600}>
          Habitaciones
        </Typography>
        {showBackToBlocksButton && (
          <Button
            variant="outlined"
            size="small"
            onClick={onBackToBlocks}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#415EDE",
              color: "#415EDE",
              "&:hover": { borderColor: "#4338ca", color: "#4338ca" },
            }}
          >
            Volver a Pabellones
          </Button>
        )}
      </div>

      <StyledTable<any>
        columns={columns}
        data={pagedRooms}
        getRowId={(row) => String(row.id)}
        emptyMessage="No se encontraron datos"
        minWidth={400}
        onRowClick={(row) => {
          setSelectedRoomForSidebar(row);
          setIsSidebarOpen(true);
        }}
        pagination={{
          count: Math.ceil(allRooms.length / rowsPerPage),
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
        }}
      />

      <RoomDetailSidebar
        open={isSidebarOpen}
        onClose={handleSidebarClose}
        roomId={selectedRoomForSidebar?.id || null}
        onRefreshData={handleSidebarClose}
      />
    </>
  );
}

export default ListConstructorsCamps;

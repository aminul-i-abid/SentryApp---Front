import { ConfirmationModal } from "@/components/ConfirmationModal";
import TopbarHeader from "@/components/TopbarHeader";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import TuneIcon from "@mui/icons-material/Tune";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlockById } from "../block/blockService";
import DetailBlock from "../block/component/DetailBlock";
import { BlockResponse } from "../block/models/BlockResponse";
import { getContractors } from "../contractors/contractorsService";
import { ContractorResponse } from "../contractors/models/ContractorResponse";
import AddRoomModal from "../room/components/AddRoomBulkModal";
import AddRoomSingleModal from "../room/components/AddRoomSingleModal";
import RoomCards from "../room/components/RoomCards";
import { RoomResponse } from "../room/models/RoomResponse";
import { getRoomsByBlock } from "../room/roomService";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.common.white,
  },
  "& .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    margin: "0 !important",
  },
}));

function CampsBlockRoom() {
  const { id } = useParams();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [block, setBlock] = useState<BlockResponse | null>(null);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isAddSingleRoomModalOpen, setIsAddSingleRoomModalOpen] =
    useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [contractors, setContractors] = useState<ContractorResponse[]>([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filterCompanyIds, setFilterCompanyIds] = useState<number[] | null>(
    null,
  );
  const [filterSearch, setFilterSearch] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    fetchData();
    fetchContractors();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRooms();
    }
  }, [id, page, rowsPerPage, filterCompanyIds, filterSearch]);

  const fetchData = async () => {
    try {
      if (id) {
        const blockId = parseInt(id);
        const blockResponse = await getBlockById(blockId);

        if (blockResponse.succeeded) {
          setBlock(blockResponse.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      if (id) {
        const blockId = parseInt(id);
        const roomsResponse = await getRoomsByBlock(
          blockId,
          page + 1,
          rowsPerPage,
          filterCompanyIds,
          filterSearch,
        );

        if (roomsResponse.succeeded) {
          setRooms(roomsResponse.data.items || roomsResponse.data);
          setTotalCount(
            roomsResponse.data.totalCount || roomsResponse.data.length,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchContractors = async () => {
    try {
      const contractorsResponse = await getContractors();

      if (contractorsResponse.succeeded) {
        setContractors(contractorsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const handleRoomClick = (room: RoomResponse) => {
    setSelectedRoom(room);
    setIsEditRoomModalOpen(true);
  };

  const handleOpenAddRoomModal = () => {
    setSelectedRoom(null);
    setIsAddRoomModalOpen(true);
  };

  const handleOpenAddSingleRoomModal = () => {
    setSelectedRoom(null);
    setIsAddSingleRoomModalOpen(true);
  };

  const handleCloseAddRoomModal = () => {
    setIsAddRoomModalOpen(false);
  };

  const handleCloseAddSingleRoomModal = () => {
    setIsAddSingleRoomModalOpen(false);
  };

  const handleCloseEditRoomModal = () => {
    setIsEditRoomModalOpen(false);
    setSelectedRoom(null);
  };

  const handleRoomAdded = async () => {
    try {
      fetchRooms();
    } catch (error) {
      console.error("Error refreshing rooms:", error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // New filter handlers
  const handleCompanyFilter = (companyIds: number[]) => {
    setFilterCompanyIds(companyIds.length > 0 ? companyIds : null);
    setPage(0); // Reset to first page when filtering
  };

  const handleSearchFilter = (search: string) => {
    setFilterSearch(search.trim() ? search.trim() : null);
    setPage(0); // Reset to first page when filtering
  };

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <div className="px-8 py-6 w-full">
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Detalles del campamento:
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "40% 58%" },
                gap: 3,
              }}
            >
              {/* Left Column - Block Details */}
              <div className="bg-[#f7f7f7] rounded-lg p-4">
                <DetailBlock block={block} fetchData={fetchData} />
              </div>
              {/* Right Column - Room List */}
              <div className="rounded-lg bg-[#f7f7f7] min-w-0 p-4">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h5" fontWeight={700}>
                      Lista de Habitaciones
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent<HTMLElement>) =>
                        setFilterAnchorEl(e.currentTarget)
                      }
                      sx={{
                        color: "#64748b",
                        backgroundColor: "#fff",
                      }}
                    >
                      <TuneIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddSingleRoomModal}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#fff",
                        bgcolor: "#415EDE",
                        "&:hover": { bgcolor: "#3a53c7" },
                      }}
                    >
                      Agregar habitación
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddRoomModal}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#fff",
                        bgcolor: "#000000",
                        "&:hover": { bgcolor: "#fff", color: "#000" },
                      }}
                    >
                      Agregar habitaciónes masivas
                    </Button>
                  </Box>
                </Box>
                <RoomCards
                  rooms={rooms}
                  onRoomClick={handleRoomClick}
                  onDeleteClick={() => fetchRooms()}
                  contractors={contractors}
                  loading={loading}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalCount={totalCount}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  onCompanyFilter={handleCompanyFilter}
                  onSearchFilter={handleSearchFilter}
                  externalFilterAnchorEl={filterAnchorEl}
                  onExternalFilterClose={() => setFilterAnchorEl(null)}
                />
              </div>
            </Box>
          </div>
        }
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Habitación"
        message={`¿Estás seguro que deseas eliminar la habitación ${selectedRoom?.roomNumber}?`}
        type="delete"
      />
      {block && (
        <AddRoomModal
          idBlock={block.id}
          open={isAddRoomModalOpen}
          onClose={handleCloseAddRoomModal}
          onSuccess={handleRoomAdded}
          contractors={contractors}
          blockFloors={block.floors}
          prefix={block.prefix}
          suffix={block.suffix}
        />
      )}
      {block && (
        <AddRoomSingleModal
          idBlock={block.id}
          open={isAddSingleRoomModalOpen}
          onClose={handleCloseAddSingleRoomModal}
          onSuccess={handleRoomAdded}
          contractors={contractors}
          blockFloors={block.floors}
          prefix={block.prefix}
          suffix={block.suffix}
        />
      )}
      {block && selectedRoom && (
        <AddRoomSingleModal
          idBlock={block.id}
          open={isEditRoomModalOpen}
          onClose={handleCloseEditRoomModal}
          onSuccess={handleRoomAdded}
          contractors={contractors}
          room={selectedRoom}
          isEdit={true}
          blockFloors={block.floors}
          prefix={block.prefix}
          suffix={block.suffix}
        />
      )}
    </>
  );
}

export default CampsBlockRoom;

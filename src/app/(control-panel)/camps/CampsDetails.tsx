import TopbarHeader from "@/components/TopbarHeader";
import { buildRoute, Routes } from "@/utils/routesEnum";
import authRoles from "@auth/authRoles";
import useAuth from "@fuse/core/FuseAuthProvider/useAuth";
import FusePageSimple from "@fuse/core/FusePageSimple";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBlockByCampId } from "../block/blockService";
import AddBlockModal from "../block/component/AddBlockModal";
import { BlockResponse } from "../block/models/BlockResponse";
import tagRoleMap from "../tag/enum/RoleTag";
import { getCampById } from "./campsService";
import BlockCards from "./component/BlockCards";
import DetailCamp from "./component/DetailCamp";
import ListConstructorsCamps from "./component/ListConstructorsCamps";
import { CampResponse } from "./models/CampResponse";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundImage: "url(/assets/dashbg1.png), url(/assets/dashbg2.png)",
    backgroundPosition: "top left, bottom right",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundSize: "30% auto, 70% auto",
  },
  "& .container": {
    maxWidth: "100% !important",
    padding: "0 !important",
    margin: "0 !important",
  },
}));

interface Block extends BlockResponse {
  totalRooms: number;
}

// Fetch functions
const fetchCampData = async (id: number) => {
  try {
    const response = await getCampById(id);
    return response;
  } catch (error) {
    console.error("Error fetching camp:", error);
    throw error;
  }
};

const fetchBlocks = async (campId: number) => {
  try {
    const response = await getBlockByCampId(campId);
    return response;
  } catch (error) {
    console.error("Error fetching blocks:", error);
    throw error;
  }
};

// Función para obtener el resumen de tags ordenado
function getOrderedTagSummary(
  blocks: { rooms: { tag: number }[] }[],
  tagRoleMap: Record<number, string>,
): { tag: string; count: number }[] {
  const tagSummary: Record<string, number> = {};
  blocks.forEach((block) => {
    block.rooms.forEach((room) => {
      const tagName =
        tagRoleMap[room.tag as keyof typeof tagRoleMap] || "Sin Estándar";
      tagSummary[tagName] = (tagSummary[tagName] || 0) + 1;
    });
  });
  const tagOrder = Object.values(tagRoleMap);
  return tagOrder
    .filter((tag) => tagSummary[tag])
    .map((tag) => ({ tag, count: tagSummary[tag] }));
}

function CampDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<CampResponse | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const { authState } = useAuth();
  const companyId = authState?.user?.companyId;

  // State for blocks
  const [blocks, setBlocks] = useState([]);
  const [tagSummaryOrdered, setTagSummaryOrdered] = useState([]);

  useEffect(() => {
    if (
      authState?.user?.role &&
      authRoles.admin.includes(authState.user.role as string)
    ) {
      fetchData();
    } else {
      fetchDataContractor();
    }
  }, [id]);

  useEffect(() => {
    setTagSummaryOrdered(getOrderedTagSummary(blocks, tagRoleMap));
  }, [blocks]);

  const fetchDataContractor = async () => {
    try {
      if (!id) {
        setLoading(false);
        return;
      }

      const campIdNumber = parseInt(id);
      const response = await getCampById(campIdNumber);

      if (response.succeeded && response.data) {
        const blocksResponse = await getBlockByCampId(campIdNumber);

        if (blocksResponse.succeeded && blocksResponse.data) {
          // Get all rooms from all blocks that belong to the contractor
          const mappedBlocks: Block[] = blocksResponse.data
            .map((block) => {
              const contractorRooms =
                block.rooms?.filter(
                  (room) => room.companyId === Number(companyId),
                ) || [];
              return {
                ...block,
                totalRooms: contractorRooms.length,
                rooms: contractorRooms.map((room) => ({
                  ...room,
                  beds: room.beds || 0, // Default value since it's not in the API response
                })),
              };
            })
            .filter((block) => block.totalRooms > 0);

          // Calculate total rooms for the contractor
          const totalContractorRooms = mappedBlocks.reduce(
            (total, block) => total + block.totalRooms,
            0,
          );

          const totalContractorBeds = mappedBlocks.reduce(
            (total, block) =>
              total +
              block.rooms.reduce(
                (blockTotal, room) => blockTotal + room.beds,
                0,
              ),
            0,
          );
          // Update both states at once
          setCamp({
            ...response.data,
            totalRooms: totalContractorRooms,
            totalBeds: totalContractorBeds,
          });
          setBlocks(mappedBlocks);
        }
      } else {
        console.error("Error fetching camp data:", response.message);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching camp data:", error);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      if (!id) {
        console.error("No camp ID provided in route parameters");
        setLoading(false);
        return;
      }

      const campId = Number(id);
      const campResponse = await fetchCampData(campId);

      if (campResponse.succeeded) {
        setCamp({ ...campResponse.data, id: campId });
        const blocksResponse = await fetchBlocks(campId);

        if (blocksResponse.succeeded) {
          setBlocks(blocksResponse.data);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddBlockModal = () => {
    setIsAddBlockModalOpen(true);
  };

  const handleCloseAddBlockModal = () => {
    setIsAddBlockModalOpen(false);
  };

  const handleBlockAdded = async () => {
    // Refresh data after a block is added
    if (id) {
      const campId = Number(id);
      try {
        // Refresh camp data
        const campResponse = await fetchCampData(campId);

        if (campResponse.succeeded) {
          setCamp(campResponse.data);
        }

        // Refresh blocks data
        const blocksResponse = await fetchBlocks(campId);

        if (blocksResponse.succeeded) {
          setBlocks(blocksResponse.data);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    }
  };

  // const handleBlockClick = (blockId) => {
  //     navigate(buildRoute(Routes.CAMPS_BLOCK_ROOM, { id: blockId }));
  // };

  const handleBlockClick = (blockId: number) => {
    if (
      authState?.user?.role &&
      authRoles.admin.includes(authState.user.role as string)
    ) {
      navigate(buildRoute(Routes.CAMPS_BLOCK_ROOM, { id: String(blockId) }));
    } else {
      setSelectedBlockId(blockId);
    }
  };

  const handleBackToBlocks = () => {
    setSelectedBlockId(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!camp) {
    return <div>Camp not found</div>;
  }

  return (
    <>
      <Root
        header={<TopbarHeader />}
        content={
          <div className="px-8 py-6 w-full">
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Detalles del campamento:
            </Typography>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} md={4}>
                <DetailCamp
                  camp={camp}
                  fetchData={fetchData}
                  tagSummaryOrdered={tagSummaryOrdered}
                />
              </Grid>
              {/* Right Column */}
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h5" fontWeight={600}>
                    Todos los pabellones:
                  </Typography>
                  {authState?.user?.role &&
                  authRoles.admin.includes(authState.user.role as string) ? (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddBlockModal}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#fff",
                        bgcolor: "#415EDE",
                        "&:hover": { bgcolor: "#4338ca" },
                      }}
                    >
                      Nuevo pabellón
                    </Button>
                  ) : null}
                </Box>
                {/* Scrollable content */}
                <Box
                  sx={{
                    maxHeight: "calc(100vh - 250px)",
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  {selectedBlockId === null ? (
                    <BlockCards
                      blocks={blocks}
                      onBlockClick={handleBlockClick}
                    />
                  ) : (
                    <ListConstructorsCamps
                      blocks={blocks.filter(
                        (block) => block.id === selectedBlockId,
                      )}
                      showBackToBlocksButton={true}
                      onBackToBlocks={handleBackToBlocks}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </div>
        }
      />
      <AddBlockModal
        campId={Number(id)}
        open={isAddBlockModalOpen}
        onClose={handleCloseAddBlockModal}
        onSuccess={handleBlockAdded}
      />
    </>
  );
}

export default CampDetail;

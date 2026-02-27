import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { styled } from "@mui/material/styles"
import FusePageSimple from "@fuse/core/FusePageSimple"
import { getCampById } from "./campsService"
import { getBlockByCampId } from "../block/blockService"
import { CampResponse } from "./models/CampResponse"
import { Box, Typography, Grid, InputAdornment, TextField, Button, ButtonGroup } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/Add"
import AddBlockModal from "../block/component/AddBlockModal"
import DetailCamp from "./component/DetailCamp"
import BlockCards from "./component/BlockCards"
import ListConstructorsCamps from "./component/ListConstructorsCamps"
import { Routes } from "@/utils/routesEnum"
import { buildRoute } from "@/utils/routesEnum"
import authRoles from "@auth/authRoles"
import useAuth from "@fuse/core/FuseAuthProvider/useAuth"
import { BlockResponse } from "../block/models/BlockResponse"
import tagRoleMap from "../tag/enum/RoleTag"

const Root = styled(FusePageSimple)(({ theme }) => ({
    "& .FusePageSimple-header": {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderColor: theme.palette.divider,
    },
    "& .FusePageSimple-content": {},
    "& .FusePageSimple-sidebarHeader": {},
    "& .FusePageSimple-sidebarContent": {},
}))

interface Block extends BlockResponse {
    totalRooms: number
}

// Fetch functions
const fetchCampData = async (id: number) => {
    try {
        const response = await getCampById(id)
        return response
    } catch (error) {
        console.error("Error fetching camp:", error)
        throw error
    }
}

const fetchBlocks = async (campId: number) => {
    try {
        const response = await getBlockByCampId(campId)
        return response
    } catch (error) {
        console.error("Error fetching blocks:", error)
        throw error
    }
}

// Función para obtener el resumen de tags ordenado
function getOrderedTagSummary(blocks: Array<{ rooms: Array<{ tag: number }> }>, tagRoleMap: Record<number, string>): Array<{ tag: string; count: number }> {
    const tagSummary: Record<string, number> = {}
    blocks.forEach((block) => {
        block.rooms.forEach((room) => {
            const tagName = tagRoleMap[room.tag as keyof typeof tagRoleMap] || "Sin Estándar"
            tagSummary[tagName] = (tagSummary[tagName] || 0) + 1
        })
    })
    const tagOrder = Object.values(tagRoleMap)
    return tagOrder.filter((tag) => tagSummary[tag]).map((tag) => ({ tag, count: tagSummary[tag] }))
}

function CampDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [camp, setCamp] = useState<CampResponse | null>(null)
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false)
    const { authState } = useAuth()
    const companyId = authState?.user?.companyId

    // State for blocks
    const [blocks, setBlocks] = useState([])
    const [tagSummaryOrdered, setTagSummaryOrdered] = useState([])

    useEffect(() => {
        if (authState?.user?.role && authRoles.admin.includes(authState.user.role as string)) {
            fetchData()
        } else {
            fetchDataContractor()
        }
    }, [id])

    useEffect(() => {
        setTagSummaryOrdered(getOrderedTagSummary(blocks, tagRoleMap))
    }, [blocks])

    const fetchDataContractor = async () => {
        try {
            if (!id) {
                setLoading(false)
                return
            }

            const campIdNumber = parseInt(id)
            const response = await getCampById(campIdNumber)

            if (response.succeeded && response.data) {
                const blocksResponse = await getBlockByCampId(campIdNumber)
                if (blocksResponse.succeeded && blocksResponse.data) {
                    // Get all rooms from all blocks that belong to the contractor
                    const mappedBlocks: Block[] = blocksResponse.data
                        .map((block) => {
                            const contractorRooms = block.rooms?.filter((room) => room.companyId === Number(companyId)) || []
                            return {
                                ...block,
                                totalRooms: contractorRooms.length,
                                rooms: contractorRooms.map((room) => ({
                                    ...room,
                                    beds: room.beds || 0, // Default value since it's not in the API response
                                })),
                            }
                        })
                        .filter((block) => block.totalRooms > 0)

                    // Calculate total rooms for the contractor
                    const totalContractorRooms = mappedBlocks.reduce((total, block) => total + block.totalRooms, 0)

                    const totalContractorBeds = mappedBlocks.reduce((total, block) => total + block.rooms.reduce((blockTotal, room) => blockTotal + room.beds, 0), 0)
                    // Update both states at once
                    setCamp({
                        ...response.data,
                        totalRooms: totalContractorRooms,
                        totalBeds: totalContractorBeds,
                    })
                    setBlocks(mappedBlocks)
                }
            } else {
                console.error("Error fetching camp data:", response.message)
            }

            setLoading(false)
        } catch (error) {
            console.error("Error fetching camp data:", error)
            setLoading(false)
        }
    }

    const fetchData = async () => {
        try {
            if (!id) {
                console.error("No camp ID provided in route parameters")
                setLoading(false)
                return
            }

            const campId = Number(id)
            const campResponse = await fetchCampData(campId)

            if (campResponse.succeeded) {
                setCamp({ ...campResponse.data, id: campId })
                const blocksResponse = await fetchBlocks(campId)
                if (blocksResponse.succeeded) {
                    setBlocks(blocksResponse.data)
                }
            }
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenAddBlockModal = () => {
        setIsAddBlockModalOpen(true)
    }

    const handleCloseAddBlockModal = () => {
        setIsAddBlockModalOpen(false)
    }

    const handleBlockAdded = async () => {
        // Refresh data after a block is added
        if (id) {
            const campId = Number(id)
            try {
                // Refresh camp data
                const campResponse = await fetchCampData(campId)
                if (campResponse.succeeded) {
                    setCamp(campResponse.data)
                }

                // Refresh blocks data
                const blocksResponse = await fetchBlocks(campId)
                if (blocksResponse.succeeded) {
                    setBlocks(blocksResponse.data)
                }
            } catch (error) {
                console.error("Error refreshing data:", error)
            }
        }
    }

    // const handleBlockClick = (blockId) => {
    //     navigate(buildRoute(Routes.CAMPS_BLOCK_ROOM, { id: blockId }));
    // };
    
    const handleBlockClick = (blockId: number) => {
        if (authState?.user?.role && authRoles.admin.includes(authState.user.role as string)) {
            navigate(buildRoute(Routes.CAMPS_BLOCK_ROOM, { id: String(blockId) }));
        } else {
            setSelectedBlockId(blockId)
        }
    }

    const handleBackToBlocks = () => {
        setSelectedBlockId(null)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!camp) {
        return <div>Camp not found</div>
    }

    return (
        <>
            <Root
                header={
                    <div className="p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Campamento</h2>
                    </div>
                }
                content={
                    <div className="p-6">
                        <Grid container spacing={3}>
                            {/* Columna Izquierda */}
                            <Grid item xs={12} md={5}>
                                <DetailCamp camp={camp} fetchData={fetchData} tagSummaryOrdered={tagSummaryOrdered} />
                            </Grid>
                            {/* Columna Derecha */}
                            <Grid item xs={12} md={7}>
                                <Grid container justifyContent="space-between" alignItems="center">
                                    <Grid item></Grid>
                                    <Grid item>
                                        {authState?.user?.role && authRoles.admin.includes(authState.user.role as string) ? (
                                            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddBlockModal}>
                                                Agregar Pabellón
                                            </Button>
                                        ) : (
                                            <></>
                                        )}
                                    </Grid>
                                </Grid>
                                {/* Contenedor con scroll */}
                                <Box
                                    sx={{
                                        maxHeight: "calc(100vh - 190px)",
                                        overflowY: "auto",
                                        pr: 2,
                                        mt: 1,
                                    }}
                                >
                                    {selectedBlockId === null ? (
                                        <>
                                            <Typography variant="h5" fontWeight={600} color="black" sx={{ mb: 2 }}>
                                                Pabellones
                                            </Typography>
                                            <BlockCards blocks={blocks} onBlockClick={handleBlockClick} />
                                        </>
                                    ) : (
                                        <>
                                            <ListConstructorsCamps blocks={blocks.filter((block) => block.id === selectedBlockId)} showBackToBlocksButton={true} onBackToBlocks={handleBackToBlocks} />
                                        </>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </div>
                }
            />
            <AddBlockModal campId={Number(id)} open={isAddBlockModalOpen} onClose={handleCloseAddBlockModal} onSuccess={handleBlockAdded} />
        </>
    )
}

export default CampDetail

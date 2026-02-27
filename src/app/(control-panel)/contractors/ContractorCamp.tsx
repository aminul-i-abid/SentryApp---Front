import React, { useState, useEffect } from "react"
import { Box, Container, Typography, Grid, CircularProgress, InputAdornment, TextField } from "@mui/material"
import DetailCamp from "../camps/component/DetailCamp"
import ListConstructorsCamps from "../camps/component/ListConstructorsCamps"
import BlockCards from "../camps/component/BlockCards"
import { CampResponse } from "../camps/models/CampResponse"
import { useNavigate, useParams } from "react-router-dom"
import { getCampById } from "../camps/campsService"
import { getBlockByCampId } from "../block/blockService"
import { BlockResponse } from "../block/models/BlockResponse"
import { RoomResponse } from "@/app/(control-panel)/room/models/RoomResponse"
import FusePageSimple from "@fuse/core/FusePageSimple"
import { styled } from "@mui/material/styles"
import SearchIcon from "@mui/icons-material/Search"
import { getContractorById } from "./contractorsService"
import tagRoleMap from "../tag/enum/RoleTag"
import useAuth from '@fuse/core/FuseAuthProvider/useAuth';

// Remove the props interface since we'll get campId from URL params
// interface ContractorCampProps {
//   campId: string;
// }

type BlockWithTotalRooms = BlockResponse & { totalRooms: number }

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

const ContractorCamp = () => {
    const { campId, idContractor } = useParams()

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [camp, setCamp] = useState<CampResponse | null>(null)
    const [blocks, setBlocks] = useState<BlockWithTotalRooms[]>([])
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null)
    // Obtener el nombre del contratista desde la URL o desde una prop si se pasa
    const [contractorName, setContractorName] = useState<string>("")
    const { authState } = useAuth()
    const companyId = authState?.user?.companyId

    useEffect(() => {
        // Si companyId existe, el usuario no tiene permisos para esta página
        if (companyId) {
            navigate("/", { replace: true })
            return
        }
        fetchCampData()
    }, [campId])

    useEffect(() => {
        const fetchContractor = async () => {
            if (!idContractor) return
            const response = await getContractorById(Number(idContractor))
            if (response.succeeded && response.data) {
                setContractorName(response.data.name || "")
            }
        }
        fetchContractor()
    }, [idContractor])

    const fetchCampData = async () => {
        try {
            if (!campId) {
                setLoading(false)
                return
            }

            const campIdNumber = parseInt(campId)
            const response = await getCampById(campIdNumber)

            if (response.succeeded && response.data) {
                const blocksResponse = await getBlockByCampId(campIdNumber)
                if (blocksResponse.succeeded && blocksResponse.data) {
                    // Get all rooms from all blocks that belong to the contractor
                    const mappedBlocks: BlockWithTotalRooms[] = blocksResponse.data
                        .map((block: BlockResponse) => {
                            const contractorRooms = block.rooms?.filter((room: RoomResponse) => room.companyId === Number(idContractor)) || []
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

    const handleBlockClick = (blockId: number) => {
        setSelectedBlockId(blockId)
    }

    const handleBackToBlocks = () => {
        setSelectedBlockId(null)
    }

    // Función para obtener el resumen de tags ordenado
    function getOrderedTagSummary(blocks: BlockWithTotalRooms[], tagRoleMap: Record<number, string>) {
        const tagSummary: Record<string, number> = {}
        blocks.forEach((block) => {
            block.rooms.forEach((room) => {
                const tagName = tagRoleMap[room.tag] || "Sin Estándar"
                tagSummary[tagName] = (tagSummary[tagName] || 0) + 1
            })
        })
        const tagOrder = Object.values(tagRoleMap)
        return tagOrder.filter((tag) => tagSummary[tag]).map((tag) => ({ tag, count: tagSummary[tag] }))
    }

    // Calcular resumen de tags por tipo (ordenado)
    const tagSummaryOrdered = getOrderedTagSummary(blocks, tagRoleMap)

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        )
    }

    if (!camp) {
        return (
            <Box textAlign="center" p={4}>
                <Typography variant="h6">No se encontró información del campamento</Typography>
            </Box>
        )
    }

    return (
        <Root
            header={
                <div className="p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Detalles contratista - {contractorName}</h2>
                </div>
            }
            content={
                <div className="p-6">
                    <Grid container spacing={3}>
                        {/* Columna Izquierda */}
                        <Grid item xs={12} md={5}>
                            <DetailCamp camp={camp} fetchData={fetchCampData} sectorContractor={true} contractorName={contractorName} tagSummaryOrdered={tagSummaryOrdered} />
                        </Grid>

                        {/* Columna Derecha */}
                        <Grid item xs={12} md={7}>
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
                        </Grid>
                    </Grid>
                </div>
            }
        />
    )
}

export default ContractorCamp

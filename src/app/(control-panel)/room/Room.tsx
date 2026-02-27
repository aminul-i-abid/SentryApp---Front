import FusePageSimple from '@fuse/core/FusePageSimple';
import { useTranslation } from 'react-i18next';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { getContractors } from '../contractors/contractorsService';
import { ContractorResponse } from '../contractors/models/ContractorResponse';
import AllRoomsTable from './components/AllRoomsTable';
import NavbarToggleButton from '@/components/theme-layouts/components/navbar/NavbarToggleButton';

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


function Room() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [contractors, setContractors] = useState<ContractorResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContractors();
    }, []);

    const fetchContractors = async () => {
        try {
            const response = await getContractors();
            if (response.succeeded) {
                setContractors(response.data);
            }
        } catch (error) {
            console.error('Error fetching contractors:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Root
            header={
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isMobile && <NavbarToggleButton className="h-10 w-10 p-0" />}
                        <h2 className="text-2xl font-bold text-slate-800">Todas las Habitaciones</h2>
                    </div>
                </div>
            }
            content={
                <div className="p-6">
                    {!loading && <AllRoomsTable contractors={contractors} />}
                </div>
            }
        />
    );
}

export default Room;

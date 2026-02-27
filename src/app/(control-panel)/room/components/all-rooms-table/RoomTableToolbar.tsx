import React from 'react';
import {
    Toolbar,
    Typography,
    IconButton,
    Tooltip,
    alpha,
    Popover,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';

interface RoomTableToolbarProps {
    selectedCount: number;
    hasActiveFilters: boolean;
    onBulkEditClick: () => void;
    onFilterClick: (event: React.MouseEvent<HTMLElement>) => void;
    filterAnchorEl: HTMLElement | null;
    onFilterClose: () => void;
    filterContent: React.ReactNode;
}

const RoomTableToolbar: React.FC<RoomTableToolbarProps> = ({
    selectedCount,
    hasActiveFilters,
    onBulkEditClick,
    onFilterClick,
    filterAnchorEl,
    onFilterClose,
    filterContent,
}) => {
    const filterOpen = Boolean(filterAnchorEl);
    const filterId = filterOpen ? 'filter-popover' : undefined;

    return (
        <>
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    ...(selectedCount > 0 && {
                        bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                    }),
                }}
            >
                {selectedCount > 0 ? (
                    <>
                        <Typography
                            sx={{ flex: '1 1 100%' }}
                            color="inherit"
                            variant="subtitle1"
                            component="div"
                        >
                            {selectedCount} seleccionado(s)
                        </Typography>
                        <Tooltip title="Editar seleccionados">
                            <IconButton onClick={onBulkEditClick}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                ) : (
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        Habitaciones
                    </Typography>
                )}

                <Tooltip title="Filtrar">
                    <IconButton
                        onClick={onFilterClick}
                        sx={{
                            ...(hasActiveFilters && {
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                }
                            })
                        }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>

            <Popover
                id={filterId}
                open={filterOpen}
                anchorEl={filterAnchorEl}
                onClose={onFilterClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {filterContent}
            </Popover>
        </>
    );
};

export default RoomTableToolbar;

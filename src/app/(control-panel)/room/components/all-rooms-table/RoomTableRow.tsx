import React from 'react';
import {
    TableRow,
    TableCell,
    Checkbox,
    Typography,
    IconButton,
    Box,
    Tooltip,
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery20Icon from '@mui/icons-material/Battery20';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import DialpadIcon from '@mui/icons-material/Dialpad';
import { RoomResponse } from '../../models/RoomResponse';
import tagRoleMap from '../../../tag/enum/RoleTag';

interface RoomTableRowProps {
    room: RoomResponse;
    isSelected: boolean;
    isSentryAdmin: boolean;
    hasTTLock: boolean;
    onRowClick: (room: RoomResponse) => void;
    onCheckboxClick: (event: React.MouseEvent<unknown>, id: string) => void;
    onEditClick: (event: React.MouseEvent, room: RoomResponse) => void;
    onDisabledChange: (event: React.MouseEvent, room: RoomResponse, newState: boolean) => void;
    onAddPinClick: (event: React.MouseEvent, room: RoomResponse) => void;
    onHistoryClick: (event: React.MouseEvent, room: RoomResponse) => void;
}

const RoomTableRow: React.FC<RoomTableRowProps> = ({
    room,
    isSelected,
    isSentryAdmin,
    hasTTLock,
    onRowClick,
    onCheckboxClick,
    onEditClick,
    onDisabledChange,
    onAddPinClick,
    onHistoryClick,
}) => {
    const getBatteryColor = (batteryLevel: number | undefined | null) => {
        if (batteryLevel === undefined || batteryLevel === null) return '#94A3B8';
        if (batteryLevel < 35) return '#EF4444';
        if (batteryLevel <= 65) return '#F59E0B';
        return '#10B981';
    };

    const getBatteryIcon = (batteryLevel: number | undefined | null) => {
        if (batteryLevel === undefined || batteryLevel === null) return Battery60Icon;
        if (batteryLevel < 35) return Battery20Icon;
        if (batteryLevel <= 65) return Battery60Icon;
        return BatteryFullIcon;
    };

    const BatteryIcon = getBatteryIcon(room.doorLockBatteryLevel);
    const batteryColor = getBatteryColor(room.doorLockBatteryLevel);

    return (
        <TableRow
            hover
            role="checkbox"
            aria-checked={isSelected}
            selected={isSelected}
            onClick={() => onRowClick(room)}
            sx={{
                cursor: 'pointer',
                '&:hover': {
                    bgcolor: '#f8f9fa'
                }
            }}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    checked={isSelected}
                    onClick={(event) => {
                        event.stopPropagation();
                        onCheckboxClick(event, room.id.toString());
                    }}
                    inputProps={{
                        'aria-labelledby': `enhanced-table-checkbox-${room.id}`,
                    }}
                />
            </TableCell>

            {/* Habitación */}
            <TableCell id={`enhanced-table-checkbox-${room.id}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                        {room.roomNumber}
                    </Typography>
                    {room.hasDoorLock && (
                        <MeetingRoomIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    )}
                </Box>
            </TableCell>

            {/* Pabellón */}
            <TableCell>
                <Typography variant="body2">{room.blockName || '-'}</Typography>
            </TableCell>

            {/* Piso */}
            <TableCell>{room.floorNumber}</TableCell>

            {/* Camas */}
            <TableCell>{room.beds}</TableCell>

            {/* Estándar */}
            <TableCell>{tagRoleMap[room.tag] || room.tag}</TableCell>

            {/* Contratista */}
            <TableCell>{room.companyName || 'Sin contratista'}</TableCell>

            {/* Nivel de Batería */}
            {hasTTLock && (
                <TableCell>
                    {room.doorLockBatteryLevel !== undefined && room.doorLockBatteryLevel !== null ? (
                        <Tooltip title={`Batería: ${room.doorLockBatteryLevel}%`} arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BatteryIcon
                                    sx={{
                                        fontSize: 18,
                                        color: batteryColor
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: batteryColor,
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {room.doorLockBatteryLevel}%
                                </Typography>
                            </Box>
                        </Tooltip>
                    ) : (
                        <Typography variant="body2" color="text.disabled">
                            -
                        </Typography>
                    )}
                </TableCell>
            )}

            {/* Habilitada */}
            <TableCell>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onDisabledChange(e, room, !room.disabled);
                    }}
                    size="small"
                    sx={{
                        color: room.disabled ? 'error.main' : 'success.main',
                        '&:hover': {
                            bgcolor: room.disabled ? 'error' : 'success',
                            opacity: 0.4
                        }
                    }}
                >
                    {room.disabled ? <CloseIcon sx={{ color: 'error.main' }} /> : <CheckIcon sx={{ color: 'success.main' }} />}
                </IconButton>
            </TableCell>

            {/* Acciones */}
            <TableCell>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(e, room);
                    }}
                >
                    <EditIcon />
                </IconButton>
                {isSentryAdmin && (
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddPinClick(e, room);
                        }}
                        sx={{ color: 'primary.main' }}
                    >
                        <DialpadIcon />
                    </IconButton>
                )}
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onHistoryClick(e, room);
                    }}
                    sx={{ color: 'info.main' }}
                >
                    <InfoIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

export default RoomTableRow;

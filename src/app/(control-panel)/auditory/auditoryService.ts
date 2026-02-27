import { genericService } from '@/utils/apiService';
import apiService from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { store } from '@/store/store';
import { saveAs } from 'file-saver';
import { PaginatedRoomLogsDto } from './models/RoomLogDto';
import { PaginatedReserveLogsDto } from './models/ReserveLogDto';
import { PaginatedTtlockTransactionLogsDto } from './models/PaginatedTtlockTransactionLogsDto';
import { PaginatedBlockLogsDto } from './models/BlockLogDto';
import { PaginatedUserLogsDto } from './models/PaginatedUserLogsDto';
import { PaginatedCampLogsDto } from './models/CampLogDto';
import { PaginatedWhatsappLogsDto } from './models/PaginatedWhatsappLogsDto';
import { PaginatedReportLogsDto } from './models/ReportLogDto';
import { PaginatedEmailLogsDto } from './models/PaginatedEmailLogsDto';
import { PaginatedCompanyLogsDto } from './models/PaginatedCompanyLogsDto';
import { PaginatedDoorLockRoomHistoryDto } from './models/DoorLockRoomHistoryDto';
import { PaginatedRoomDisabledHistoryDto } from './models/RoomDisabledHistoryDto';
import { PaginatedSmsLogsDto } from './models/PaginatedSmsLogsDto';
import { PaginatedDoorLockAccessLogsDto, DoorLockAccessLogDto } from './models/DoorLockAccessLogDto';

const endpoint = '/Audit';

export const getBlocksLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedBlockLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    // Agregar blockIds y campIds como array de long (param repetido)
    if (filters.blockId != null) {
        if (Array.isArray(filters.blockId)) {
            filters.blockId.forEach((id: number) => params.append('blockIds', String(id)));
        } else {
            params.append('blockIds', String(filters.blockId));
        }
    }
    if (filters.campId != null) {
        if (Array.isArray(filters.campId)) {
            filters.campId.forEach((id: number) => params.append('campIds', String(id)));
        } else {
            params.append('campIds', String(filters.campId));
        }
    }

    return genericService.get<PaginatedBlockLogsDto>(`${endpoint}/blockLogs?${params.toString()}`);
};

export const getCampsLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedCampLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    if (filters.campId != null) {
        if (Array.isArray(filters.campId)) {
            filters.campId.forEach((id: number) => params.append('campIds', String(id)));
        } else {
            params.append('campIds', String(filters.campId));
        }
    }

    return genericService.get<PaginatedCampLogsDto>(`${endpoint}/campLogs?${params.toString()}`);
};

export const getCompaniesLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedCompanyLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    if (filters.companyId != null) {
        if (Array.isArray(filters.companyId)) {
            filters.companyId.forEach((id: number) => params.append('companyIds', String(id)));
        } else {
            params.append('companyIds', String(filters.companyId));
        }
    }

    return genericService.get<PaginatedCompanyLogsDto>(`${endpoint}/companyLogs?${params.toString()}`);
};

export const getDoorLockRoomHistoryLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedDoorLockRoomHistoryDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    // Agregar roomIds como array de long (param repetido)
    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }

    return genericService.get<PaginatedDoorLockRoomHistoryDto>(`${endpoint}/doorLockRoomHistory?${params.toString()}`);
};

export const getReportsLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedReportLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    return genericService.get<PaginatedReportLogsDto>(`${endpoint}/reportLogs?${params.toString()}`);
};

export const getEmailLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedEmailLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    return genericService.get<PaginatedEmailLogsDto>(`${endpoint}/emailLogs?${params.toString()}`);
};

export const getReservationsLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedReserveLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    // Agregar roomIds como array de long (param repetido)
    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }

    return genericService.get<PaginatedReserveLogsDto>(`${endpoint}/reserveLogs?${params.toString()}`);
};

export const getRoomDisabledStatesLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedRoomDisabledHistoryDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }

    return genericService.get<PaginatedRoomDisabledHistoryDto>(`${endpoint}/roomDisabledHistory?${params.toString()}`);
};

export const getTTLockTransactionsLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedTtlockTransactionLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    return genericService.get<PaginatedTtlockTransactionLogsDto>(`${endpoint}/ttlocklogs?${params.toString()}`);
};

export const getTTLogs = async (): Promise<ApiResponse<any[]>> => {
    const filters = store.getState().auditoryFilters;
    return genericService.getAll<any>(endpoint + '/TTLogs');
};

export const getWhatsappLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedWhatsappLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }

    return genericService.get<PaginatedWhatsappLogsDto>(`${endpoint}/whatsappLogs?${params.toString()}`);
};

export const getSmsLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedSmsLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    return genericService.get<PaginatedSmsLogsDto>(`${endpoint}/smsLogs?${params.toString()}`);
};

export const getUserLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedUserLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    return genericService.get<PaginatedUserLogsDto>(`${endpoint}/userLogs?${params.toString()}`);
};

export const getRoomLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedRoomLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }
    if (filters.blockId != null) {
        if (Array.isArray(filters.blockId)) {
            filters.blockId.forEach((id: number) => params.append('blockIds', String(id)));
        } else {
            params.append('blockIds', String(filters.blockId));
        }
    }

    return genericService.get<PaginatedRoomLogsDto>(`${endpoint}/roomLogs?${params.toString()}`);
};

export const getDoorLockAccessLogs = async (pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedDoorLockAccessLogsDto>> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
    });

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    // Agregar roomIds como array de long (param repetido)
    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }

    // Agregar blockIds como array de long (param repetido)
    if (filters.blockId != null) {
        if (Array.isArray(filters.blockId)) {
            filters.blockId.forEach((id: number) => params.append('blockIds', String(id)));
        } else {
            params.append('blockIds', String(filters.blockId));
        }
    }

    // Agregar success filter (0 = fallido, 1 = exitoso, null = todos)
    if (filters.success !== undefined && filters.success !== null) {
        params.append('success', String(filters.success));
    }

    return genericService.get<PaginatedDoorLockAccessLogsDto>(`${endpoint}/doorLockAccessLogs?${params.toString()}`);
};

export const getDoorLockAccessLogsExcel = async (): Promise<void> => {
    const filters = store.getState().auditoryFilters;

    const params = new URLSearchParams();

    // Agregar fechas solo si están definidas
    if (filters.fechaDesde) {
        params.append('startDate', filters.fechaDesde);
    }

    if (filters.fechaHasta) {
        params.append('endDate', filters.fechaHasta);
    }

    // Agregar roomIds como array de long (param repetido)
    if (filters.roomId != null) {
        if (Array.isArray(filters.roomId)) {
            filters.roomId.forEach((id: number) => params.append('roomIds', String(id)));
        } else {
            params.append('roomIds', String(filters.roomId));
        }
    }

    // Agregar blockIds como array de long (param repetido)
    if (filters.blockId != null) {
        if (Array.isArray(filters.blockId)) {
            filters.blockId.forEach((id: number) => params.append('blockIds', String(id)));
        } else {
            params.append('blockIds', String(filters.blockId));
        }
    }

    // Agregar success filter (0 = fallido, 1 = exitoso, null = todos)
    if (filters.success !== undefined && filters.success !== null) {
        params.append('success', String(filters.success));
    }

    try {
        const response = await apiService.get(`${endpoint}/doorLockAccessLogs/excel?${params.toString()}`, {
            responseType: 'blob'
        });

        // Crear un blob con la respuesta
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Generar nombre del archivo con fecha
        const date = new Date().toISOString().split('T')[0];
        const fileName = `auditoria_accesos_${date}.xlsx`;

        // Descargar el archivo
        saveAs(blob, fileName);
    } catch (error) {
        console.error('Error generating Excel report:', error);
        throw new Error('Error al generar el reporte Excel de auditoría de accesos');
    }
};



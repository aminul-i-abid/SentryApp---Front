import { genericService } from '@/utils/apiService';
import { ApiResponse, PaginatedResponse } from '@/utils/types';
import { ReserveResponse, ReservePaginatedResponse } from './models/ReserveResponse';
import { ReservationRequest, GuestRequest } from './models/ReservationRequest';
import { BulkReserve, BulkReservePaginatedResponse } from './models/BulkReserveResponse';
import axios from 'axios';
import { saveAs } from 'file-saver';
import apiFetch, { globalHeaders } from '@/utils/apiFetch';
import { ReserveDetailResponse } from './models/ReserveDetailResponse';
import { CalendarRoom } from '../calendar/models/CalendarResponse';

const endpoint = '/Reservations';

export const getReserves = async (
    pageNumber: number = 1, 
    pageSize: number = 10, 
    idBulkReservation?: number, 
    searchTerm?: string
): Promise<ApiResponse<ReservePaginatedResponse>> => {
    try {
        // Construir los parámetros de la URL
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString()
        });
        
        if (idBulkReservation) {
            params.append('idBulkReservation', idBulkReservation.toString());
        }
        
        if (searchTerm && searchTerm.trim().length >= 5) {
            params.append('searchTerm', searchTerm.trim());
        }
        
        const response = await apiFetch(`${endpoint}?${params.toString()}`);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching reserves:', error);
        return {
            succeeded: false,
            data: { items: [], totalCount: 0, guid: '', companyName: '' },
            message: [],
            errors: ['Error fetching reserves']
        };
    }
};

export const getBulkReserves = async (
    pageNumber: number = 1, 
    pageSize: number = 10, 
    companyId?: number, 
    status?: number
): Promise<ApiResponse<BulkReservePaginatedResponse>> => {
    try {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString()
        });
        
        if (companyId) {
            params.append('idCompany', companyId.toString());
        }
        
        if (status !== undefined && status !== null) {
            params.append('status', status.toString());
        }
        
        const response = await apiFetch(`${endpoint}/BulkReservations?${params.toString()}`);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching reserves:', error);
        return {
            succeeded: false,
            data: { items: [], totalCount: 0 },
            message: [],
            errors: ['Error fetching reserves']
        };
    }
};

export const getReserveById = async (id: number): Promise<ApiResponse<ReserveDetailResponse>> => {
    return genericService.getById<ReserveDetailResponse>(endpoint, id);
};

export const downloadBulkReservationTemplate = async (idCompany: number): Promise<void> => {
    try {
        const response = await apiFetch(`/Reservations/CreateBulkReservationTemplate?idCompany=${idCompany}`, {
            headers: {
                'Accept': '*/*'
            }
        });
        
        // Extract filename from content-disposition header or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'BulkReservations.xlsx';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        // Create a blob and save the file
        const blob = await response.blob();
        saveAs(blob, filename);
    } catch (error) {
        console.error('Error downloading template:', error);
        throw error;
    }
};

export const downloadReservesExcel = async (idBulkReservation: number, companyName: string): Promise<void> => {
    try {
        const response = await apiFetch(`/Reservations/ExportBulkReservation/${idBulkReservation}`, {
            headers: {
                'Accept': '*/*'
            }
        });
        
        // Extract filename from content-disposition header or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `reservas_${companyName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        
        // Create a blob and save the file
        const blob = await response.blob();
        saveAs(blob, filename);
    } catch (error) {
        console.error('Error downloading reserves Excel:', error);
        throw error;
    }
};

export const createReserve = async (reservation: ReservationRequest): Promise<ApiResponse<ReserveResponse>> => {
    return genericService.create<ReserveResponse, ReservationRequest>(endpoint + '/Create', reservation);
};

export const updateReserve = async (id: number, reserve: Partial<ReserveResponse>): Promise<ApiResponse<ReserveResponse>> => {
    return genericService.update<ReserveResponse>(endpoint, id, reserve);
};

export const deleteReservationGuest = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint + '/Guest', id);
};

export const cancelReserve = async (id: number, cancelReason: { comments: string }): Promise<ApiResponse<any>> => {
    return genericService.create<any, { comments: string }>(`${endpoint}/Cancel/${id}`, cancelReason);
};

export const cancelBulkReservations = async (reservationIds: number[]): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch(`${endpoint}/CancelBulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reservationIds })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        return {
            succeeded: false,
            data: null,
            message: ['Error al cancelar las reservas'],
            errors: ['Error al cancelar las reservas']
        };
    }
};

export const deleteReserve = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

export const validateBulkReservation = async (
    file: File,
    companyId: number,
    comments?: string
): Promise<ApiResponse<any>> => {
    try {
        const formData = new FormData();
        formData.append('ExcelFile', file);
        formData.append('CompanyId', companyId.toString());
        if (comments) {
            formData.append('Comments', comments);
        }

        const response = await apiFetch('/Reservations/ValidateBulkReservation', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating bulk reservation:', error);
        throw error;
    }
};

export const createBulkReservation = async (
    file: File,
    companyId: number,
    comments?: string,
    assignableGuests?: any[],
    unassignableGuests?: any[]
): Promise<ApiResponse<any>> => {
    try {
        const formData = new FormData();
        formData.append('ExcelFile', file);
        formData.append('CompanyId', companyId.toString());
        formData.append('AssignableGuests', JSON.stringify(assignableGuests));
        formData.append('UnassignableGuest', JSON.stringify(unassignableGuests));
        if (comments) {
            formData.append('Comments', comments);
        }

        const response = await apiFetch('/Reservations/CreateBulkReservation', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating bulk reservation:', error);
        throw error;
    }
};

export const createReservationGuest = async (
    reservationId: number, 
    guestData: GuestRequest
): Promise<ApiResponse<any>> => {
    return genericService.create<any, GuestRequest>(`${endpoint}/${reservationId}/Guest`, guestData);
};

export const updateReservationGuest = async (
    guestId: number, 
    guestData: Partial<GuestRequest>
): Promise<ApiResponse<any>> => {
    return genericService.update<any>(endpoint + '/Guest', guestId, guestData);
}; 

export const searchByRut = async (rut: string): Promise<ApiResponse<any>> => {
    return genericService.get('/Users/search-by-rut/' + rut);
};

// Valida un archivo de Excel que contiene RUTs y devuelve los RUTs válidos
export const validateRutsFromExcel = async (
    file: File
): Promise<ApiResponse<{ validRuts: string[] }>> => {
    try {
        const formData = new FormData();
        // Mantener consistencia con otros endpoints que esperan la clave 'ExcelFile'
        formData.append('ExcelFile', file);

        const response = await apiFetch('/Reservations/ValidateRutsFromExcel', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validating RUTs from Excel:', error);
        return {
            succeeded: false,
            data: { validRuts: [] },
            message: ['Error al validar RUTs desde Excel'],
            errors: ['Error validating RUTs from Excel']
        } as unknown as ApiResponse<{ validRuts: string[] }>;
    }
};

export const getCalendarData = async (startDate: string, endDate: string, blockId?: number, occupied?: boolean | null, companyId?: number): Promise<ApiResponse<CalendarRoom[]>> => {
    try {
        let url = `${endpoint}/Calendar?startDate=${startDate}&endDate=${endDate}`;
        if (blockId) {
            url += `&idBlock=${blockId}`;
        }
        if (occupied !== null && occupied !== undefined) {
            url += `&occupied=${occupied}`;
        }
        if (companyId) {
            url += `&idCompany=${companyId}`;
        }
        
        const response = await apiFetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return {
            succeeded: false,
            data: [],
            message: [],
            errors: ['Error fetching calendar data']
        };
    }
};

export const resetUserPassword = async (email: string, tenant: string, rut?: string): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch('/Users/send-new-password-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, tenant, ...(rut ? { rut } : {}) })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resetting user password:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al resetear la contraseña del usuario'],
            errors: ['Error resetting user password']
        };
    }
};

export const updateUserInfo = async (dni: string, data: { PhoneNumber?: string; Email?: string }): Promise<ApiResponse<any>> => {
    try {
        const body = { DNI: dni, ...data };
        const response = await apiFetch('/Users/UpdateUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating user info:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al actualizar usuario'],
            errors: ['Error updating user info']
        };
    }
};

// Interfaces para el reenvío de mensajería
interface ResendWhatsAppRequest {
    reservationGuestId: number;
    messageType: 1;
    phoneNumber: string;
}

interface ResendEmailRequest {
    reservationGuestId: number;
    messageType: 3;
    email: string;
}

type ResendMessagingRequest = ResendWhatsAppRequest | ResendEmailRequest;

export const resendMessaging = async (request: ResendMessagingRequest): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch(`${endpoint}/ResendMessaging`, {
            method: 'POST',
            body: JSON.stringify(request)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resending messaging:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al reenviar mensaje'],
            errors: ['Error resending messaging']
        };
    }
};

export const resetPinTtlock = async (reservationGuestId: number): Promise<ApiResponse<any>> => {

    try {
        const response = await apiFetch(`${endpoint}/ChangePasswordTtlock/${reservationGuestId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resetting PIN:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al resetear PIN'],
            errors: ['Error resetting PIN']
        };
    }
};

// Reset multiple TTLock PINs for a list of reservation guest IDs
export const resetMultiplePinsTtlock = async (reservationGuestIds: number[]): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch(`${endpoint}/ChangeMultiplePasswordsTtlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reservationGuestIds })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error resetting multiple PINs:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al resetear PINs'],
            errors: ['Error resetting multiple PINs']
        };
    }
};

export const searchByGuest = async (
    searchValue?: string,
    pageNumber: number = 1,
    pageSize: number = 20,
    param: { companyId?: number; status?: string; blockId?: number; withoutPin?: boolean } = {},
    signal?: AbortSignal
): Promise<ApiResponse<any>> => {
    // console.log('Searching by guest:', { searchValue, pageNumber, pageSize, param });
    try {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString()
        });
        if (searchValue && searchValue.trim()) {
            params.append('searchValue', searchValue.trim());
        }
        if (param.companyId) {
            params.append('IdCompany', param.companyId.toString());
        }
        if (param.status) {
            params.append('status', param.status);
        }
        if (param.blockId) {
            params.append('blockId', param.blockId.toString());
        }
        if (param.withoutPin !== undefined) {
            params.append('withoutPin', param.withoutPin.toString());
        }
        
        const response = await apiFetch(`/Reservations/ByGuest?${params.toString()}`, {
            signal
        });
        const data = await response.json();
        return data;
    } catch (error) {
        // Si es un abort, re-lanzar el error sin loggear
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error('Error searching by guest:', error);
        return {
            succeeded: false,
            data: [],
            message: [],
            errors: ['Error searching by guest']
        };
    }
};

// Cancel reservations by a list of RUTs
export const cancelByRut = async (ruts: string[]): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch(`${endpoint}/CancelByRut`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ruts })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error cancelling by RUT:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al cancelar por RUT'],
            errors: ['Error cancelling by RUT']
        };
    }
};

// Interface for last reservation response
interface LastReservation {
    id: number;
    checkIn: string;
    checkOut: string;
    status: number;
    guestName: string;
    mobileNumber: string;
    email: string;
    guid: string;
}

export const getLastReservationsByRoom = async (roomId: number): Promise<ApiResponse<LastReservation[]>> => {
    try {
        const response = await apiFetch(`${endpoint}/Room/${roomId}/LastReservations`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching last reservations for room:', error);
        return {
            succeeded: false,
            data: [],
            message: [],
            errors: ['Error fetching last reservations for room']
        };
    }
};

// Interface for messaging status response
interface MessagingStatusResponse {
    id: number;
    doorLockSet: number;
    doorLockDateTime: string;
    doorLockStatus: number;
    doorPasswordSent: number;
    doorPassword: string;
    doorPasswordId: string;
    whatsappSent: number;
    whatsappUser: string;
    whatsappDateTime: string;
    whatsappStatus: number;
    whatsappMessage: string;
    smsSent: number;
    smsStatus: number;
    emailSent: number;
    emailUser: string;
    emailDateTime: string;
    emailStatus: number;
    emailMessage: string;
}

export const getGuestMessagingStatus = async (guestId: number): Promise<ApiResponse<MessagingStatusResponse>> => {
    try {
        const response = await apiFetch(`${endpoint}/Guest/${guestId}/MessagingStatus`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching guest messaging status:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al obtener el estado de mensajería'],
            errors: ['Error fetching guest messaging status']
        };
    }
};

// Helper function to get status message based on sent status
export const getStatusMessage = (sent: number, message?: string, type: 'email' | 'whatsapp' | 'pin' = 'email'): string => {
    if (sent === 1) {
        if (type === 'pin') {
            return 'Se obtuvo el pin correctamente';
        }
        return message || `${type === 'email' ? 'Email' : 'WhatsApp'} enviado exitosamente`;
    } else {
        if (type === 'pin') {
            return 'No se pudo obtener el pin';
        }
        return `${type === 'email' ? 'Email' : 'WhatsApp'} no se pudo enviar`;
    }
};

// Validate date changes for multiple reservations
interface DateChangeItem {
    reservationId: number;
    newCheckIn: string;
    newCheckOut: string;
}

export const validateDateChanges = async (
    items: DateChangeItem[]
): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch(`${endpoint}/ValidateDateChanges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validating date changes:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al validar cambios de fechas'],
            errors: ['Error validating date changes']
        };
    }
};

// Validate room changes for multiple reservations
interface RoomChangeItem {
    reservationId: number;
    newRoomId: number;
}

export const validateRoomChanges = async (
    items: RoomChangeItem[]
): Promise<ApiResponse<any>> => {
    try {
        const response = await apiFetch(`${endpoint}/ValidateRoomChanges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validating room changes:', error);
        return {
            succeeded: false,
            data: null,
            message: ['Error al validar cambios de habitación'],
            errors: ['Error validating room changes']
        };
    }
};
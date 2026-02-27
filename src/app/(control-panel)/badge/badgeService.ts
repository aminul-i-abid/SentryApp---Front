import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { BadgeResponse } from './models/BadgeResponse';

const endpoint = '/DoorLocks';

// Interfaz para la respuesta del TTLock ID basada en la respuesta real
interface TTLockIdResponse {
    lockId: number;
    electricQuantity: number;
    recordTypeFromLock: number;
    recordType: number;
    success: number;
    keyboardPwd: string;
    lockDate: number;
    username: string;
    notifyType: string;
    recordTypeStr: string;
    recordTypeFromLockStr: string;
}

export const getBadges = async (): Promise<ApiResponse<BadgeResponse[]>> => {
    return genericService.getAll<BadgeResponse>(endpoint);
};

export const createBadge = async (badge: Omit<BadgeResponse, 'id'>): Promise<ApiResponse<BadgeResponse>> => {
    return genericService.create<BadgeResponse, Omit<BadgeResponse, 'id'>>(endpoint, badge);
};

export const updateBadge = async (id: number, badge: Partial<BadgeResponse>): Promise<ApiResponse<BadgeResponse>> => {
    return genericService.update<BadgeResponse>(endpoint, id, badge);
};

export const deleteBadge = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

// Nuevo endpoint para obtener datos de una habitación específica
export const getRoomData = async (roomId: number): Promise<ApiResponse<any>> => {
    return genericService.getById<any>(`${endpoint}/room`, roomId);
};

// Nuevo endpoint para obtener el TTLock ID de una habitación específica
export const getRoomTTLockId = async (roomId: number): Promise<ApiResponse<TTLockIdResponse>> => {
    return genericService.get<TTLockIdResponse>(`${endpoint}/room/${roomId}/ttlock-id`);
}; 
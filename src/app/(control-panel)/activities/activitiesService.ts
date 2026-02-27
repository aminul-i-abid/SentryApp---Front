import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    ActivityFormData, 
    ActivityResponse,
    ActivityCreateDTO
} from './models/Activity';
import { 
    ActivityReservationCreateData,
    ActivityReservationUpdateStatusData,
    ActivityReservationResponse,
    ActivityAvailabilityResponse
} from './models/ActivityReservation';
import serviceInstance from '@/utils/apiService';

/**
 * Endpoint base para el módulo de actividades
 */
const endpoint = '/Activities';

/**
 * Endpoint para reservas de actividades
 */
const reservationsEndpoint = '/ActivityReservations';

/**
 * ========================================
 * ACTIVITIES MANAGEMENT (Endpoints 1-5)
 * ========================================
 */

/**
 * 1. GET /api/activities - Listar actividades
 */
export const getActivities = async (): Promise<ApiResponse<ActivityResponse[]>> => {
    return genericService.getAll<ActivityResponse>(endpoint);
};

/**
 * 2. GET /api/activities/{id} - Detalle de actividad
 */
export const getActivityById = async (id: number): Promise<ApiResponse<ActivityResponse>> => {
    return genericService.getById<ActivityResponse>(endpoint, id);
};

/**
 * 3. GET /api/activities/availability - Disponibilidad por fecha
 * @param activityId ID de la actividad
 * @param date Fecha en formato ISO (YYYY-MM-DD)
 */
export const getActivityAvailability = async (
    activityId: number, 
    date: string
): Promise<ApiResponse<ActivityAvailabilityResponse>> => {
    return genericService.get<ActivityAvailabilityResponse>(
        `${endpoint}/availability?activityId=${activityId}&date=${date}`
    );
};

/**
 * 4. POST /api/activities - Crear actividad
 */
export const createActivity = async (
    activityData: ActivityFormData
): Promise<ApiResponse<ActivityResponse>> => {
    // Map frontend data to backend DTO
    const dto: ActivityCreateDTO = {
        name: activityData.name,
        description: activityData.description,
        maxCapacityTotal: activityData.capacity,
        blockDurationMinutes: activityData.slotDuration,
        startTime: activityData.startTime,
        endTime: activityData.endTime,
        concurrencyType: activityData.concurrencyType,
        maxConcurrentReservations: activityData.capacity,
        companyId: activityData.campId
    };
    
    return genericService.create<ActivityResponse, ActivityCreateDTO>(endpoint, dto);
};

/**
 * 5. PUT /api/activities/{id} - Actualizar actividad
 */
export const updateActivity = async (
    id: number, 
    activityData: Partial<ActivityFormData>
): Promise<ApiResponse<ActivityResponse>> => {
    // Map frontend data to backend DTO (only send changed fields)
    const dto: Partial<ActivityCreateDTO> = {};
    
    if (activityData.name !== undefined) dto.name = activityData.name;
    if (activityData.description !== undefined) dto.description = activityData.description;
    if (activityData.capacity !== undefined) {
        dto.maxCapacityTotal = activityData.capacity;
        dto.maxConcurrentReservations = activityData.capacity;
    }
    if (activityData.slotDuration !== undefined) dto.blockDurationMinutes = activityData.slotDuration;
    if (activityData.startTime !== undefined) dto.startTime = activityData.startTime;
    if (activityData.endTime !== undefined) dto.endTime = activityData.endTime;
    if (activityData.concurrencyType !== undefined) dto.concurrencyType = activityData.concurrencyType;
    if (activityData.campId !== undefined) dto.companyId = activityData.campId;
    
    return genericService.update<ActivityResponse>(endpoint, id, dto);
};

/**
 * ========================================
 * ACTIVITY RESERVATIONS (Endpoints 6-10)
 * ========================================
 */

/**
 * 6. GET /api/activityreservations - Listar reservas (Admin)
 */
export const getActivityReservations = async (): Promise<ApiResponse<ActivityReservationResponse[]>> => {
    return genericService.getAll<ActivityReservationResponse>(reservationsEndpoint);
};

/**
 * 7. GET /api/activityreservations/my-reservations - Mis reservas (Usuario actual)
 */
export const getMyReservations = async (
    fromDate?: string,
    pageSize: number = 10,
    pageNumber: number = 1
): Promise<ApiResponse<{
    items: ActivityReservationResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}>> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    params.append('pageSize', pageSize.toString());
    params.append('pageNumber', pageNumber.toString());
    
    return genericService.get(`${reservationsEndpoint}/my-reservations?${params.toString()}`);
};

/**
 * 8. GET /api/activityreservations - Todas las reservas (Admin)
 */
export const getAllReservations = async (
    fromDate?: string,
    pageSize: number = 10,
    pageNumber: number = 1,
    beneficiaryUserId?: string,
    status?: number
): Promise<ApiResponse<{
    items: ActivityReservationResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}>> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    params.append('pageSize', pageSize.toString());
    params.append('pageNumber', pageNumber.toString());
    if (beneficiaryUserId) params.append('beneficiaryUserId', beneficiaryUserId);
    if (status !== undefined) params.append('status', status.toString());
    
    return genericService.get(`${reservationsEndpoint}?${params.toString()}`);
};

/**
 * 9. POST /api/activityreservations - Crear reserva
 */
export const createReservation = async (
    reservationData: ActivityReservationCreateData
): Promise<ApiResponse<ActivityReservationResponse>> => {
    return genericService.create<ActivityReservationResponse, ActivityReservationCreateData>(
        reservationsEndpoint, 
        reservationData
    );
};

/**
 * 9. PATCH /api/activityreservations/{id}/status - Actualizar estado
 */
export const updateReservationStatus = async (
    id: number,
    statusData: ActivityReservationUpdateStatusData
): Promise<ApiResponse<ActivityReservationResponse>> => {
    try {
        const { data } = await serviceInstance.apiService.patch<ApiResponse<ActivityReservationResponse>>(
            `${reservationsEndpoint}/${id}/status`,
            statusData
        );
        return data ?? { succeeded: false, message: ['Error'], errors: ['Error'], data: undefined };
    } catch (error) {
        console.error('Error in updateReservationStatus:', error);
        return { succeeded: false, message: ['Error'], errors: ['Error'], data: undefined };
    }
};

/**
 * 10. POST /api/activityreservations/{id}/cancel - Cancelar reserva
 */
export const cancelReservation = async (
    id: number,
    cancellationReason?: string
): Promise<ApiResponse<ActivityReservationResponse>> => {
    return genericService.create<ActivityReservationResponse, { cancellationReason?: string }>(
        `${reservationsEndpoint}/${id}/cancel`,
        { cancellationReason }
    );
};

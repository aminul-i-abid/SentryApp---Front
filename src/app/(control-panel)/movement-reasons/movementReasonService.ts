import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    MovementReasonFormData, 
    MovementReasonResponse,
    MovementReasonCreateDTO
} from './models/MovementReason';

/**
 * Endpoint base para el módulo de motivos de movimiento
 */
const endpoint = '/MovementReasons';

/**
 * Obtener todos los motivos de movimiento con paginación
 */
export const getMovementReasons = async (
    pageNumber: number = 1,
    pageSize: number = 1000
): Promise<ApiResponse<MovementReasonResponse[]>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Obtener un motivo de movimiento por ID
 */
export const getMovementReasonById = async (id: number): Promise<ApiResponse<MovementReasonResponse>> => {
    return genericService.getById<MovementReasonResponse>(endpoint, id);
};

/**
 * Crear un nuevo motivo de movimiento
 */
export const createMovementReason = async (data: MovementReasonFormData): Promise<ApiResponse<MovementReasonResponse>> => {
    const dto: MovementReasonCreateDTO = {
        description: data.description,
        positiveAdjustment: data.positiveAdjustment,
        negativeAdjustment: data.negativeAdjustment,
        scrap: data.scrap
    };
    return genericService.create<MovementReasonResponse, MovementReasonCreateDTO>(endpoint, dto);
};

/**
 * Actualizar un motivo de movimiento existente
 */
export const updateMovementReason = async (id: number, data: MovementReasonFormData): Promise<ApiResponse<MovementReasonResponse>> => {
    const dto: MovementReasonCreateDTO = {
        description: data.description,
        positiveAdjustment: data.positiveAdjustment,
        negativeAdjustment: data.negativeAdjustment,
        scrap: data.scrap
    };
    return genericService.update<MovementReasonResponse>(endpoint, id, dto);
};

/**
 * Eliminar un motivo de movimiento
 */
export const deleteMovementReason = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

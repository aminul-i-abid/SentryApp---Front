import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    ItemUnitOfMeasureFormData, 
    ItemUnitOfMeasureResponse,
    ItemUnitOfMeasureCreateDTO
} from './models/ItemUnitOfMeasure';

/**
 * Endpoint base para el módulo de unidades de medida de items
 */
const endpoint = '/ItemUnitOfMeasures';

/**
 * Obtener todas las unidades de medida con paginación
 */
export const getItemUnitOfMeasures = async (
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<{
    items: ItemUnitOfMeasureResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Obtener una unidad de medida por ID
 */
export const getItemUnitOfMeasureById = async (id: number): Promise<ApiResponse<ItemUnitOfMeasureResponse>> => {
    return genericService.getById<ItemUnitOfMeasureResponse>(endpoint, id);
};

/**
 * Crear una nueva unidad de medida
 */
export const createItemUnitOfMeasure = async (data: ItemUnitOfMeasureFormData): Promise<ApiResponse<ItemUnitOfMeasureResponse>> => {
    const dto: ItemUnitOfMeasureCreateDTO = {
        description: data.description
    };
    return genericService.create<ItemUnitOfMeasureResponse, ItemUnitOfMeasureCreateDTO>(endpoint, dto);
};

/**
 * Actualizar una unidad de medida existente
 */
export const updateItemUnitOfMeasure = async (id: number, data: ItemUnitOfMeasureFormData): Promise<ApiResponse<ItemUnitOfMeasureResponse>> => {
    const dto: ItemUnitOfMeasureCreateDTO = {
        description: data.description
    };
    return genericService.update<ItemUnitOfMeasureResponse>(endpoint, id, dto);
};

/**
 * Eliminar una unidad de medida
 */
export const deleteItemUnitOfMeasure = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

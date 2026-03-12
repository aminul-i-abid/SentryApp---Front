import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    WarehouseFormData, 
    WarehouseResponse,
    CreateWarehouseDto,
    UpdateWarehouseDto,
    PaginatedWarehousesDto
} from './models/Warehouse';

/**
 * Base endpoint for the Warehouses module
 */
const endpoint = '/Warehouses';

/**
 * Get all warehouses with pagination
 */
export const getWarehouses = async (
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedWarehousesDto>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Get a warehouse by ID
 */
export const getWarehouseById = async (id: number): Promise<ApiResponse<WarehouseResponse>> => {
    return genericService.getById<WarehouseResponse>(endpoint, id);
};

/**
 * Create a new warehouse
 */
export const createWarehouse = async (data: WarehouseFormData): Promise<ApiResponse<WarehouseResponse>> => {
    const dto: CreateWarehouseDto = {
        description: data.description
    };
    return genericService.create<WarehouseResponse, CreateWarehouseDto>(endpoint, dto);
};

/**
 * Update an existing warehouse
 */
export const updateWarehouse = async (id: number, data: WarehouseFormData): Promise<ApiResponse<WarehouseResponse>> => {
    const dto: UpdateWarehouseDto = {
        description: data.description
    };
    return genericService.update<WarehouseResponse>(endpoint, id, dto);
};

/**
 * Delete a warehouse
 */
export const deleteWarehouse = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

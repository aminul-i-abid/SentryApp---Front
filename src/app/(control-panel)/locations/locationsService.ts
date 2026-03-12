import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    LocationFormData, 
    LocationResponse,
    CreateLocationDto,
    UpdateLocationDto,
    PaginatedLocationsDto
} from './models/Location';

/**
 * Base endpoint for the Locations module
 */
const endpoint = '/Locations';

/**
 * Get all locations with pagination
 */
export const getLocations = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    warehouseId?: number
): Promise<ApiResponse<PaginatedLocationsDto>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (warehouseId) {
        params.append('warehouseId', warehouseId.toString());
    }
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Get a location by ID
 */
export const getLocationById = async (id: number): Promise<ApiResponse<LocationResponse>> => {
    return genericService.getById<LocationResponse>(endpoint, id);
};

/**
 * Create a new location
 */
export const createLocation = async (data: LocationFormData): Promise<ApiResponse<LocationResponse>> => {
    const dto: CreateLocationDto = {
        description: data.description,
        warehouseId: data.warehouseId
    };
    return genericService.create<LocationResponse, CreateLocationDto>(endpoint, dto);
};

/**
 * Update an existing location
 */
export const updateLocation = async (id: number, data: LocationFormData): Promise<ApiResponse<LocationResponse>> => {
    const dto: UpdateLocationDto = {
        description: data.description,
        warehouseId: data.warehouseId
    };
    return genericService.update<LocationResponse>(endpoint, id, dto);
};

/**
 * Delete a location
 */
export const deleteLocation = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

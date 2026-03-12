import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    LotFormData, 
    LotResponse,
    CreateLotDto,
    UpdateLotDto,
    PaginatedLotsDto
} from './models/Lot';

/**
 * Base endpoint for the Lots module
 */
const endpoint = '/Lots';

/**
 * Get all lots with pagination
 */
export const getLots = async (
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedLotsDto>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Get a lot by ID
 */
export const getLotById = async (id: number): Promise<ApiResponse<LotResponse>> => {
    return genericService.getById<LotResponse>(endpoint, id);
};

/**
 * Get lots by item ID
 */
export const getLotsByItem = async (itemId: number): Promise<ApiResponse<LotResponse[]>> => {
    return genericService.get(`${endpoint}/byItem/${itemId}`);
};

/**
 * Create a new lot
 */
export const createLot = async (data: LotFormData): Promise<ApiResponse<LotResponse>> => {
    const dto: CreateLotDto = {
        itemId: data.itemId,
        description: data.description,
        quantity: data.quantity,
        expirationDate: data.expirationDate?.toISOString() || null
    };
    return genericService.create<LotResponse, CreateLotDto>(endpoint, dto);
};

/**
 * Update an existing lot
 */
export const updateLot = async (id: number, data: LotFormData): Promise<ApiResponse<LotResponse>> => {
    const dto: UpdateLotDto = {
        itemId: data.itemId,
        description: data.description,
        quantity: data.quantity,
        expirationDate: data.expirationDate?.toISOString() || null
    };
    return genericService.update<LotResponse>(endpoint, id, dto);
};

/**
 * Delete a lot
 */
export const deleteLot = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

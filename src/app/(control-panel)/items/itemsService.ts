import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    ItemFormData, 
    ItemResponse,
    CreateItemDto,
    UpdateItemDto,
    PaginatedItemsDto
} from './models/Item';

/**
 * Base endpoint for the Items module
 */
const endpoint = '/Items';

/**
 * Get all items with pagination
 */
export const getItems = async (
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedItemsDto>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Get an item by ID
 */
export const getItemById = async (id: number): Promise<ApiResponse<ItemResponse>> => {
    return genericService.getById<ItemResponse>(endpoint, id);
};

/**
 * Create a new item
 */
export const createItem = async (data: ItemFormData): Promise<ApiResponse<ItemResponse>> => {
    const dto: CreateItemDto = {
        description: data.description,
        hasLot: data.hasLot,
        unitOfMeasureId: data.unitOfMeasureId
    };
    return genericService.create<ItemResponse, CreateItemDto>(endpoint, dto);
};

/**
 * Update an existing item
 */
export const updateItem = async (id: number, data: ItemFormData): Promise<ApiResponse<ItemResponse>> => {
    const dto: UpdateItemDto = {
        description: data.description,
        hasLot: data.hasLot,
        unitOfMeasureId: data.unitOfMeasureId
    };
    return genericService.update<ItemResponse>(endpoint, id, dto);
};

/**
 * Delete an item
 */
export const deleteItem = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

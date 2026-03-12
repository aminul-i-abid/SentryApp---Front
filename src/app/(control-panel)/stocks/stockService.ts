import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { PaginatedStocksResponse } from './models/Stock';
import { 
    PaginatedStocksByArticleResponse, 
    PaginatedStocksByWarehouseResponse,
    AutocompleteOption 
} from './models/StockAggregated';

/**
 * Base endpoint for the Stocks module
 */
const endpoint = '/Stocks';

/**
 * Get all stocks with pagination and filters
 */
export const getStocks = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    warehouseId?: number,
    locationId?: number,
    itemId?: number,
    lotId?: number,
    search?: string
): Promise<ApiResponse<PaginatedStocksResponse>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (warehouseId) {
        params.append('warehouseId', warehouseId.toString());
    }
    if (locationId) {
        params.append('locationId', locationId.toString());
    }
    if (itemId) {
        params.append('itemId', itemId.toString());
    }
    if (lotId) {
        params.append('lotId', lotId.toString());
    }
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Get items that have stock (quantity > 0)
 * Used for cascading selection: Step 1
 */
export const getItemsWithStock = async (): Promise<ApiResponse<any[]>> => {
    return genericService.get(`${endpoint}/items-with-stock`);
};

/**
 * Get lots with stock for a specific item
 * Used for cascading selection: Step 2
 */
export const getLotsByItemWithStock = async (itemId: number): Promise<ApiResponse<any[]>> => {
    return genericService.get(`${endpoint}/lots-by-item-with-stock?itemId=${itemId}`);
};

/**
 * Get warehouses with stock for a specific item and lot combination
 * Used for cascading selection: Step 3
 */
export const getWarehousesByItemAndLotWithStock = async (
    itemId: number,
    lotId: number
): Promise<ApiResponse<any[]>> => {
    return genericService.get(`${endpoint}/warehouses-by-item-and-lot-with-stock?itemId=${itemId}&lotId=${lotId}`);
};

/**
 * Get locations with stock for a specific item, lot, and warehouse combination
 * Used for cascading selection: Step 4
 */
export const getLocationsByItemLotAndWarehouseWithStock = async (
    itemId: number,
    lotId: number,
    warehouseId: number
): Promise<ApiResponse<any[]>> => {
    return genericService.get(`${endpoint}/locations-by-item-lot-and-warehouse-with-stock?itemId=${itemId}&lotId=${lotId}&warehouseId=${warehouseId}`);
};

/**
 * Get stocks aggregated by article with pagination and filters
 */
export const getStocksByArticle = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    itemId?: number,
    search?: string
): Promise<ApiResponse<PaginatedStocksByArticleResponse>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (itemId) {
        params.append('itemId', itemId.toString());
    }
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    
    return genericService.get(`${endpoint}/by-article?${params.toString()}`);
};

/**
 * Get stock details by article with pagination
 */
export const getStockDetailsByArticle = async (
    itemId: number,
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedStocksResponse>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}/details-by-article/${itemId}?${params.toString()}`);
};

/**
 * Get stocks aggregated by warehouse with pagination and filters
 */
export const getStocksByWarehouse = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    warehouseId?: number,
    search?: string
): Promise<ApiResponse<PaginatedStocksByWarehouseResponse>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (warehouseId) {
        params.append('warehouseId', warehouseId.toString());
    }
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    
    return genericService.get(`${endpoint}/by-warehouse?${params.toString()}`);
};

/**
 * Get stock details by warehouse with pagination
 */
export const getStockDetailsByWarehouse = async (
    warehouseId: number,
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<PaginatedStocksResponse>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}/details-by-warehouse/${warehouseId}?${params.toString()}`);
};

/**
 * Get items for autocomplete (returns all items)
 */
export const getItemsAutocomplete = async (search?: string): Promise<ApiResponse<AutocompleteOption[]>> => {
    const params = new URLSearchParams();
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    // Using the existing items-with-stock endpoint for autocomplete
    return genericService.get(`${endpoint}/items-with-stock?${params.toString()}`);
};

/**
 * Get warehouses for autocomplete
 */
export const getWarehousesAutocomplete = async (search?: string): Promise<ApiResponse<AutocompleteOption[]>> => {
    // Using a generic warehouses endpoint - if not available, will need to create one
    const params = new URLSearchParams();
    if (search && search.trim()) {
        params.append('search', search.trim());
    }
    return genericService.get(`/Warehouses?${params.toString()}`);
};

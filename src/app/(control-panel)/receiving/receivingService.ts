import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { PaginatedMovementsResponse, CreateReceivingDto } from './models/Receiving';

const endpoint = '/Movements';

export const getReceivings = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    itemId?: number,
    lotId?: number,
    warehouseId?: number,
    locationId?: number,
    dateFrom?: string,
    dateTo?: string,
    search?: string
): Promise<ApiResponse<PaginatedMovementsResponse>> => {
    const params = new URLSearchParams();
    params.append('transactionType', '1'); // Receiving = 1
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (itemId) params.append('itemId', itemId.toString());
    if (lotId) params.append('lotId', lotId.toString());
    if (warehouseId) params.append('warehouseId', warehouseId.toString());
    if (locationId) params.append('locationId', locationId.toString());
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (search && search.trim()) params.append('search', search.trim());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

export const createReceiving = async (data: CreateReceivingDto): Promise<ApiResponse<number>> => {
    return genericService.create(`${endpoint}/receiving`, data);
};

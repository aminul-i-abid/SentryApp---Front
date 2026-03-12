import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { PaginatedMovementsResponse, CreateTransferDto } from './models/Transfer';

const endpoint = '/Movements';

export const getTransfers = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    itemId?: number,
    warehouseId?: number,
    search?: string
): Promise<ApiResponse<PaginatedMovementsResponse>> => {
    const params = new URLSearchParams();
    params.append('transactionType', '2'); // Transfers = 2
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (itemId) params.append('itemId', itemId.toString());
    if (warehouseId) params.append('warehouseId', warehouseId.toString());
    if (search && search.trim()) params.append('search', search.trim());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

export const createTransfer = async (data: CreateTransferDto): Promise<ApiResponse<number>> => {
    return genericService.create(`${endpoint}/transfer`, data);
};

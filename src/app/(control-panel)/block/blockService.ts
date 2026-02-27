import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { BlockResponse } from './models/BlockResponse';

const endpoint = '/Blocks';

export interface BlockCreateData {
    name: string;
    floors: number;
    campId: number;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    prefix: string;
    suffix: string;
}

export const createBlock = async (blockData: BlockCreateData): Promise<ApiResponse<BlockResponse>> => {
    return genericService.create<BlockResponse, BlockCreateData>(endpoint, blockData);
};

export const getBlocks = async (): Promise<ApiResponse<BlockResponse[]>> => {
    return genericService.getAll<BlockResponse>(endpoint);
};

export const getBlockById = async (id: number): Promise<ApiResponse<BlockResponse>> => {
    return genericService.getById<BlockResponse>(endpoint, id);
};

export const getBlockByCampId = async (campId: number): Promise<ApiResponse<BlockResponse[]>> => {
    return genericService.getById<BlockResponse[]>(endpoint + '/byCamp', campId);
};

export const updateBlock = async (id: number, blockData: Partial<BlockResponse>): Promise<ApiResponse<BlockResponse>> => {
    return genericService.update<BlockResponse>(endpoint, id, blockData);
};

export const deleteBlock = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
}; 
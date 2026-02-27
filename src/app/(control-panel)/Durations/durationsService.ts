import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { DurationResponse, DurationRequest, DurationUpdateRequest } from './models/DurationResponse';

const endpoint = '/Durations';

export const getDurations = async (): Promise<ApiResponse<DurationResponse[]>> => {
    return genericService.getAll<DurationResponse>(endpoint);
};

export const createDuration = async (duration: DurationRequest): Promise<ApiResponse<DurationResponse>> => {
    return genericService.create<DurationResponse, DurationRequest>(endpoint, duration);
};

export const updateDuration = async (id: number, duration: Partial<DurationResponse>): Promise<ApiResponse<DurationResponse>> => {
    return genericService.update<DurationResponse>(endpoint, id, duration);
};

export const deleteDuration = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};
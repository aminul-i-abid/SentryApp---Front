import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { CampResponse } from './models/CampResponse';

const endpoint = '/Camps';

export interface CampCreateData {
    name: string;
    location: string;
    coordinates: string;
    capacity: number;
}

export const getCamps = async (): Promise<ApiResponse<CampResponse[]>> => {
    return genericService.getAll<CampResponse>(endpoint);
};

export const getCampsByCompanyId = async (companyId: number): Promise<ApiResponse<CampResponse[]>> => {
    return genericService.getAll<CampResponse>(`${endpoint}/company/${companyId}`);
};

export const getCampById = async (id: number): Promise<ApiResponse<CampResponse>> => {
    return genericService.getById<CampResponse>(endpoint, id);
};

export const createCamp = async (campData: CampCreateData): Promise<ApiResponse<CampResponse>> => {
    return genericService.create<CampResponse, CampCreateData>(endpoint, campData);
};

export const updateCamp = async (id: number, camp: Partial<CampResponse>): Promise<ApiResponse<CampResponse>> => {
    return genericService.update<CampResponse>(endpoint, id, camp);
};

export const deleteCamp = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
}; 
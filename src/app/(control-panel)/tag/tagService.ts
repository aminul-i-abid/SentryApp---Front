import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { TagResponse } from './models/TagResponse';
import apiService from '@/utils/apiService';

const endpoint = '/JobTitles';
export interface JobTitleCreateData {
    name: string;
    description: string;
    tag: string;
}

export const getTags = async (): Promise<ApiResponse<TagResponse[]>> => {
    return genericService.getAll<TagResponse>(endpoint);
};

export const getTagsPending = async (): Promise<ApiResponse<TagResponse[]>> => {
    return genericService.getAll<TagResponse>(`${endpoint}/pending`);
};

export const getTagsCompany = async (companyId: number): Promise<ApiResponse<TagResponse[]>> => {
    return genericService.getAll<TagResponse>(`${endpoint}/company/${companyId}`);
};

export const createTag = async (tag: JobTitleCreateData): Promise<ApiResponse<TagResponse>> => {
    return genericService.create<TagResponse, JobTitleCreateData>(endpoint, tag);
};

export const updateTag = async (id: number, tag: JobTitleCreateData): Promise<ApiResponse<TagResponse>> => {
    return genericService.update<TagResponse>(endpoint, id, tag);
};

export const approveTag = async (id: number): Promise<ApiResponse<TagResponse>> => {
    const { data } = await apiService.post<ApiResponse<TagResponse>>(`${endpoint}/${id}/approve`);
    return data;
};

export const rejectedTag = async (id: number): Promise<ApiResponse<TagResponse>> => {
    const { data } = await apiService.post<ApiResponse<TagResponse>>(`${endpoint}/${id}/reject`);
    return data;
};

export const deleteTag = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
}; 
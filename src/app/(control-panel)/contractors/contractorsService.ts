import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { ContractorResponse } from './models/ContractorResponse';
// Using inline type for linter compatibility

const endpoint = '/Companies';

export interface ContractorCreateData {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    contract?: string;
    contactFirstName: string;
    contactLastName: string;
    contactRut: string;
    contactPhone: string;
    contactEmail: string;
    state: number;
}

export const getContractors = async (): Promise<ApiResponse<ContractorResponse[]>> => {
    return genericService.getAll<ContractorResponse>(endpoint);
};

export const getContractorById = async (id: number): Promise<ApiResponse<ContractorResponse>> => {
    return genericService.getById<ContractorResponse>(endpoint, id);
};

export const createContractor = async (contractorData: ContractorCreateData): Promise<ApiResponse<ContractorResponse>> => {
    return genericService.create<ContractorResponse, ContractorCreateData>(endpoint, contractorData);
};

export const updateContractor = async (
    id: number,
    contractor: Partial<ContractorResponse> & { Contract?: string }
): Promise<ApiResponse<ContractorResponse>> => {
    return genericService.update<ContractorResponse>(endpoint, id, contractor);
};

export const deleteContractor = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
}; 

// Create a new user under a company (contractor)
export interface CompanyUserCreateRequest {
    firstName: string;
    lastName: string;
    dni: string;
    phoneNumber: string;
    email: string;
}

export const createCompanyUser = async (
    companyId: number,
    user: CompanyUserCreateRequest
): Promise<ApiResponse<any>> => {
    return genericService.create<any, CompanyUserCreateRequest>(`${endpoint}/${companyId}/users`, user);
};

export const getCompanyUsers = async (
    companyId: number
): Promise<ApiResponse<any[]>> => {
    return genericService.getAll<any>(`${endpoint}/${companyId}/users`);
};

export const deleteCompanyUser = async (
    companyId: number,
    userId: string
): Promise<ApiResponse<void>> => {
    return genericService.deletePath(`${endpoint}/${companyId}/users/${userId}`);
};
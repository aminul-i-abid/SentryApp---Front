import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import { 
    SupplierFormData, 
    SupplierResponse,
    CreateSupplierDTO,
    UpdateSupplierDTO
} from './models/Supplier';

/**
 * Endpoint base para el módulo de proveedores
 */
const endpoint = '/Suppliers';

/**
 * Obtener todos los proveedores con paginación
 */
export const getSuppliers = async (
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<{
    items: SupplierResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}>> => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    return genericService.get(`${endpoint}?${params.toString()}`);
};

/**
 * Obtener un proveedor por ID
 */
export const getSupplierById = async (id: number): Promise<ApiResponse<SupplierResponse>> => {
    return genericService.getById<SupplierResponse>(endpoint, id);
};

/**
 * Crear un nuevo proveedor
 */
export const createSupplier = async (data: SupplierFormData): Promise<ApiResponse<SupplierResponse>> => {
    const dto: CreateSupplierDTO = {
        description: data.description
    };
    return genericService.create<SupplierResponse, CreateSupplierDTO>(endpoint, dto);
};

/**
 * Actualizar un proveedor existente
 */
export const updateSupplier = async (id: number, data: SupplierFormData): Promise<ApiResponse<SupplierResponse>> => {
    const dto: UpdateSupplierDTO = {
        description: data.description
    };
    return genericService.update<SupplierResponse>(endpoint, id, dto);
};

/**
 * Eliminar un proveedor
 */
export const deleteSupplier = async (id: number): Promise<ApiResponse<void>> => {
    return genericService.delete(endpoint, id);
};

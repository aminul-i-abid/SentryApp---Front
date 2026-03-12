import { genericService } from '@/utils/apiService';
import { ApiResponse } from '@/utils/types';
import type {
	CreateSupplierLotDto,
	SupplierLotFormData,
	SupplierLotResponse,
	UpdateSupplierLotDto
} from './models/SupplierLot';

/**
 * Base endpoint for the SupplierLots module
 */
const endpoint = '/SupplierLots';

/**
 * Get all supplier lots
 */
export const getSupplierLots = async (): Promise<ApiResponse<SupplierLotResponse[]>> => {
	return genericService.get(endpoint);
};

/**
 * Get a supplier lot by ID
 */
export const getSupplierLotById = async (id: number): Promise<ApiResponse<SupplierLotResponse>> => {
	return genericService.getById<SupplierLotResponse>(endpoint, id);
};

/**
 * Get supplier lots by item ID
 */
export const getSupplierLotsByItem = async (itemId: number): Promise<ApiResponse<SupplierLotResponse[]>> => {
	return genericService.get(`${endpoint}/byItem/${itemId}`);
};

/**
 * Create a new supplier lot
 */
export const createSupplierLot = async (data: SupplierLotFormData): Promise<ApiResponse<SupplierLotResponse>> => {
	const dto: CreateSupplierLotDto = {
		itemId: data.itemId,
		supplierId: data.supplierId,
		description: data.description,
		portionQuantity: data.portionQuantity,
		portionsPerBox: data.portionsPerBox,
		expirationDate: data.expirationDate?.toISOString() || null,
		productionDate: data.productionDate?.toISOString() || null
	};

	return genericService.create<SupplierLotResponse, CreateSupplierLotDto>(endpoint, dto);
};

/**
 * Update an existing supplier lot
 */
export const updateSupplierLot = async (
	id: number,
	data: SupplierLotFormData
): Promise<ApiResponse<SupplierLotResponse>> => {
	const dto: UpdateSupplierLotDto = {
		itemId: data.itemId,
		supplierId: data.supplierId,
		description: data.description,
		portionQuantity: data.portionQuantity,
		portionsPerBox: data.portionsPerBox,
		expirationDate: data.expirationDate?.toISOString() || null,
		productionDate: data.productionDate?.toISOString() || null
	};

	return genericService.update<SupplierLotResponse>(endpoint, id, dto);
};

/**
 * Delete a supplier lot
 */
export const deleteSupplierLot = async (id: number): Promise<ApiResponse<void>> => {
	return genericService.delete(endpoint, id);
};


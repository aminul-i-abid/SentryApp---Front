import { MovementDto, PaginatedMovementsResponse } from '../../receiving/models/Receiving';

export type { MovementDto, PaginatedMovementsResponse };

export interface CreateConsumptionDto {
    itemId: number;
    lotId: number;
    warehouseId: number;
    locationId: number;
    quantity: number;
    notes?: string;
}

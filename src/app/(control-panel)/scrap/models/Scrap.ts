import { MovementDto, PaginatedMovementsResponse } from '../../receiving/models/Receiving';

export type { MovementDto, PaginatedMovementsResponse };

export interface CreateScrapDto {
    itemId: number;
    lotId: number;
    warehouseId: number;
    locationId: number;
    quantity: number;
    reasonId: number;
    notes?: string;
}

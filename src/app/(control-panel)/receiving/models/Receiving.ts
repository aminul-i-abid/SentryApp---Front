export interface MovementDto {
    id: number;
    itemId: number;
    itemName: string;
    itemCode: string;
    lotId: number;
    lotNumber: string;
    warehouseId: number;
    warehouseName: string;
    locationId: number;
    locationName: string;
    quantity: number;
    movementDate: string;
    operatorId: string;
    operatorName: string;
    type: number;
    transactionType: number;
    notes?: string;
    supplierLotId?: number;
    supplierLotNumber?: string;
    supplierId?: number;
    supplierName?: string;
    reasonId?: number;
    reasonName?: string;
    createdOn: string;
}

export interface PaginatedMovementsResponse {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: MovementDto[];
}

export interface CreateReceivingDto {
    itemId: number;
    warehouseId: number;
    locationId: number;
    quantity: number;
    movementDate?: string;
    supplierId: number;
    supplierLotId: number;
    reasonId?: number;
    notes?: string;
}

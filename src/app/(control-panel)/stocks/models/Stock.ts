export interface Stock {
    id: number;
    itemId: number;
    itemDescription: string | null;
    warehouseId: number;
    warehouseDescription: string | null;
    locationId: number;
    locationDescription: string | null;
    lotId: number;
    lotDescription: string | null;
    quantity: number;
    created: string;
    createdBy: string | null;
    lastModified: string | null;
    lastModifiedBy: string | null;
}

export interface StockResponse extends Stock {}

export interface PaginatedStocksResponse {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: StockResponse[];
}

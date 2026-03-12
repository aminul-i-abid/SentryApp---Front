export interface StockByArticle {
    itemId: number;
    itemDescription: string | null;
    totalQuantity: number;
}

export interface PaginatedStocksByArticleResponse {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: StockByArticle[];
}

export interface StockByWarehouse {
    warehouseId: number;
    warehouseDescription: string | null;
    totalQuantity: number;
}

export interface PaginatedStocksByWarehouseResponse {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: StockByWarehouse[];
}

export interface AutocompleteOption {
    id: number;
    description: string;
}

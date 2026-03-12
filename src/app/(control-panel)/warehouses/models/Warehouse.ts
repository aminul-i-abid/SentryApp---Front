/**
 * Interface for the Warehouse model
 */
export interface Warehouse {
    /**
     * Unique ID of the warehouse
     */
    id: number;
    
    /**
     * Description of the warehouse
     */
    description: string;
    
    /**
     * Creation date
     */
    created?: string;
    
    /**
     * User who created the warehouse
     */
    createdBy?: string;
    
    /**
     * Last modification date
     */
    lastModified?: string;
    
    /**
     * User who last modified the warehouse
     */
    lastModifiedBy?: string;
    
    /**
     * Locations associated with the warehouse
     */
    locations?: Location[];
}

/**
 * Interface for Location
 */
export interface Location {
    id: number;
    description: string;
    warehouseId: number;
    created?: string;
    createdBy?: string;
    lastModified?: string;
    lastModifiedBy?: string;
}

/**
 * Interface for the API response
 */
export interface WarehouseResponse extends Warehouse {}

/**
 * Interface for the form data
 */
export interface WarehouseFormData {
    description: string;
}

/**
 * Interface for the create/update DTO
 */
export interface CreateWarehouseDto {
    description: string;
}

/**
 * Interface for the update DTO
 */
export interface UpdateWarehouseDto {
    description: string;
}

/**
 * Paginated response for warehouses
 */
export interface PaginatedWarehousesDto {
    items: WarehouseResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Interface for the Location model
 */
export interface Location {
    /**
     * Unique ID of the location
     */
    id: number;
    
    /**
     * Description of the location
     */
    description: string;
    
    /**
     * Warehouse ID
     */
    warehouseId: number;
    
    /**
     * Warehouse description
     */
    warehouseDescription?: string;
    
    /**
     * Creation date
     */
    created?: string;
    
    /**
     * User who created the location
     */
    createdBy?: string;
    
    /**
     * Last modification date
     */
    lastModified?: string;
    
    /**
     * User who last modified the location
     */
    lastModifiedBy?: string;
}

/**
 * Response from the API for a single location
 */
export interface LocationResponse extends Location {}

/**
 * Form data for creating/updating a location
 */
export interface LocationFormData {
    description: string;
    warehouseId: number;
}

/**
 * DTO for creating a location
 */
export interface CreateLocationDto {
    description: string;
    warehouseId: number;
}

/**
 * DTO for updating a location
 */
export interface UpdateLocationDto {
    description: string;
    warehouseId: number;
}

/**
 * Paginated response for locations
 */
export interface PaginatedLocationsDto {
    items: LocationResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

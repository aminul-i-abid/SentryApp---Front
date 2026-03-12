/**
 * Interface for the Lot model
 */
export interface Lot {
    /**
     * Unique ID of the lot
     */
    id: number;
    
    /**
     * Item ID associated with the lot
     */
    itemId: number;
    
    /**
     * Item description (from related entity)
     */
    itemDescription?: string;
    
    /**
     * Description of the lot
     */
    description: string;
    
    /**
     * Quantity of items in the lot
     */
    quantity: number;
    
    /**
     * Expiration date of the lot
     */
    expirationDate: string;
    
    /**
     * Creation date
     */
    created?: string;
    
    /**
     * User who created the lot
     */
    createdBy?: string;
    
    /**
     * Last modification date
     */
    lastModified?: string;
    
    /**
     * User who last modified the lot
     */
    lastModifiedBy?: string;
}

/**
 * Interface for paginated response from backend
 */
export interface PaginatedLotsDto {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: LotResponse[];
}

/**
 * Interface for API response
 */
export interface LotResponse extends Lot {}

/**
 * Interface for form data
 */
export interface LotFormData {
    itemId: number;
    description: string;
    quantity: number;
    expirationDate: Date | null;
}

/**
 * Interface for create DTO
 */
export interface CreateLotDto {
    itemId: number;
    description: string;
    quantity: number;
    expirationDate: string;
}

/**
 * Interface for update DTO
 */
export interface UpdateLotDto {
    itemId: number;
    description: string;
    quantity: number;
    expirationDate: string;
}

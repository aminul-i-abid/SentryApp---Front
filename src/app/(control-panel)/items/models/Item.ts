/**
 * Interface for the Item model
 */
export interface Item {
    /**
     * Unique ID of the item
     */
    id: number;
    
    /**
     * Description of the item
     */
    description: string;
    
    /**
     * Indicates if the item has lot control
     */
    hasLot: boolean;
    
    /**
     * Unit of Measure ID
     */
    unitOfMeasureId: number;
    
    /**
     * Unit of Measure description (from related entity)
     */
    unitOfMeasureDescription?: string;
    
    /**
     * Creation date
     */
    created?: string;
    
    /**
     * User who created the item
     */
    createdBy?: string;
    
    /**
     * Last modification date
     */
    lastModified?: string;
    
    /**
     * User who last modified the item
     */
    lastModifiedBy?: string;
}

/**
 * Interface for paginated response from backend
 */
export interface PaginatedItemsDto {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    items: ItemResponse[];
}

/**
 * Interface for API response
 */
export interface ItemResponse extends Item {}

/**
 * Interface for form data
 */
export interface ItemFormData {
    description: string;
    hasLot: boolean;
    unitOfMeasureId: number;
}

/**
 * Interface for create DTO
 */
export interface CreateItemDto {
    description: string;
    hasLot: boolean;
    unitOfMeasureId: number;
}

/**
 * Interface for update DTO
 */
export interface UpdateItemDto {
    description: string;
    hasLot: boolean;
    unitOfMeasureId: number;
}

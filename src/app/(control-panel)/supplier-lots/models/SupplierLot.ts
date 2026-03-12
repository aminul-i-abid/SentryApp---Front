/**
 * Interface for the SupplierLot model
 */
export interface SupplierLot {
	/**
	 * Unique ID of the supplier lot
	 */
	id: number;

	/**
	 * Item ID associated with the supplier lot
	 */
	itemId: number;

	/**
	 * Item description (from related entity)
	 */
	itemDescription?: string;

	/**
	 * Supplier ID associated with the supplier lot
	 */
	supplierId: number;

	/**
	 * Supplier description (from related entity)
	 */
	supplierDescription?: string;

	/**
	 * Supplier lot description
	 */
	description: string;

	/**
	 * Quantity per portion
	 */
	portionQuantity: number;

	/**
	 * Portions per box
	 */
	portionsPerBox: number;

	/**
	 * Expiration date
	 */
	expirationDate: string;

	/**
	 * Production date
	 */
	productionDate: string;

	/**
	 * Creation date
	 */
	created?: string;

	/**
	 * User who created the supplier lot
	 */
	createdBy?: string;

	/**
	 * Last modification date
	 */
	lastModified?: string;

	/**
	 * User who last modified the supplier lot
	 */
	lastModifiedBy?: string;
}

/**
 * Response from the API for a single supplier lot
 */
export interface SupplierLotResponse extends SupplierLot {}

/**
 * Form data for creating/updating a supplier lot
 */
export interface SupplierLotFormData {
	itemId: number;
	supplierId: number;
	description: string;
	portionQuantity: number;
	portionsPerBox: number;
	expirationDate: Date | null;
	productionDate: Date | null;
}

/**
 * DTO for creating a supplier lot
 */
export interface CreateSupplierLotDto {
	itemId: number;
	supplierId: number;
	description: string;
	portionQuantity: number;
	portionsPerBox: number;
	expirationDate: string;
	productionDate: string;
}

/**
 * DTO for updating a supplier lot
 */
export interface UpdateSupplierLotDto extends CreateSupplierLotDto {}


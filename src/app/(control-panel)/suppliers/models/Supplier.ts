/**
 * Interface para el modelo de Proveedor (Supplier)
 */
export interface Supplier {
    /**
     * ID único del proveedor
     */
    id: number;
    
    /**
     * Descripción del proveedor
     */
    description: string;
    
    /**
     * Fecha de creación
     */
    createdAt?: string;
    
    /**
     * Fecha de última actualización
     */
    updatedAt?: string;
}

/**
 * Interface para la respuesta de la API
 */
export interface SupplierResponse extends Supplier {}

/**
 * Interface para los datos del formulario
 */
export interface SupplierFormData {
    description: string;
}

/**
 * Interface para el DTO de creación
 */
export interface CreateSupplierDTO {
    description: string;
}

/**
 * Interface para el DTO de actualización
 */
export interface UpdateSupplierDTO {
    description: string;
}

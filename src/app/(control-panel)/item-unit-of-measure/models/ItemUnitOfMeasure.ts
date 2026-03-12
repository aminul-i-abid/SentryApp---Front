/**
 * Interface para el modelo de Unidad de Medida de Item
 */
export interface ItemUnitOfMeasure {
    /**
     * ID único de la unidad de medida
     */
    id: number;
    
    /**
     * Descripción de la unidad de medida (ej: "Kilogramo", "Litro", "Unidad")
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
export interface ItemUnitOfMeasureResponse extends ItemUnitOfMeasure {}

/**
 * Interface para los datos del formulario
 */
export interface ItemUnitOfMeasureFormData {
    description: string;
}

/**
 * Interface para el DTO de creación/actualización
 */
export interface ItemUnitOfMeasureCreateDTO {
    description: string;
}

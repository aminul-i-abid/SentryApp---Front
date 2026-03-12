/**
 * Interface para el modelo de Movement Reason
 */
export interface MovementReason {
    /**
     * ID único del motivo de movimiento
     */
    id: number;
    
    /**
     * Descripción del motivo de movimiento
     */
    description: string;
    
    /**
     * Indica si es un ajuste positivo
     */
    positiveAdjustment: boolean;
    
    /**
     * Indica si es un ajuste negativo
     */
    negativeAdjustment: boolean;
    
    /**
     * Indica si es desecho/scrap
     */
    scrap: boolean;
    
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
export interface MovementReasonResponse extends MovementReason {}

/**
 * Interface para los datos del formulario
 */
export interface MovementReasonFormData {
    description: string;
    positiveAdjustment: boolean;
    negativeAdjustment: boolean;
    scrap: boolean;
}

/**
 * Interface para el DTO de creación/actualización
 */
export interface MovementReasonCreateDTO {
    description: string;
    positiveAdjustment: boolean;
    negativeAdjustment: boolean;
    scrap: boolean;
}

/**
 * Enum para el tipo de concurrencia de una actividad
 */
export enum ConcurrencyType {
    /**
     * Tiempo exclusivo - Una reserva bloquea el recurso al 100%
     * Ejemplo: Mesa de Ping Pong
     */
    ExclusiveTime = 0,
    
    /**
     * Recurso compartido - Múltiples reservas pueden convivir hasta el aforo máximo
     * Ejemplo: Gimnasio con capacidad de 10 personas
     */
    SharedResource = 1
}

/**
 * Enum para el estado de una reserva de actividad
 */
export enum ActivityReservationStatus {
    /**
     * Reserva creada/pendiente
     */
    Pending = 0,
    
    /**
     * Reserva en curso (actividad activa)
     */
    InProgress = 1,
    
    /**
     * Reserva completada (finalizó correctamente)
     */
    Completed = 2,
    
    /**
     * Reserva cancelada por el usuario o administrador
     */
    Cancelled = 3
}

/**
 * Interface para el modelo de Actividad
 */
export interface Activity {
    /**
     * ID único de la actividad
     */
    id: number;
    
    /**
     * Nombre de la actividad (ej: "Gimnasio Principal", "Mesa de Ping Pong 1")
     */
    name: string;
    
    /**
     * Descripción detallada de la actividad
     */
    description: string;
    
    /**
     * Tipo de concurrencia de la actividad
     */
    concurrencyType: ConcurrencyType;
    
    /**
     * Capacidad máxima (solo aplica para SharedResource)
     * Para ExclusiveTime siempre debe ser 1
     */
    capacity: number;
    
    /**
     * Capacidad máxima total (nombre del campo en backend)
     * Mismo valor que capacity pero con nombre diferente
     */
    maxCapacityTotal: number;
    
    /**
     * Duración de cada slot de reserva en minutos
     */
    slotDuration: number;
    
    /**
     * Hora de inicio del servicio (formato HH:mm)
     */
    startTime: string;
    
    /**
     * Hora de fin del servicio (formato HH:mm)
     */
    endTime: string;
    
    /**
     * ID del campamento al que pertenece la actividad
     */
    campId: number;
    
    /**
     * Nombre del campamento (opcional, para display)
     */
    campName?: string;
    
    /**
     * Ubicación específica dentro del campamento
     */
    location?: string;
    
    /**
     * URL de la imagen de la actividad
     */
    imageUrl?: string;
    
    /**
     * Indica si la actividad está activa
     */
    isActive: boolean;
    
    /**
     * Requiere aprobación del administrador
     */
    requiresApproval: boolean;
    
    /**
     * Tiempo máximo de anticipación para reservar (en días)
     */
    maxAdvanceBookingDays: number;
    
    /**
     * Tiempo mínimo de anticipación para reservar (en horas)
     */
    minAdvanceBookingHours: number;
    
    /**
     * Permite cancelación
     */
    allowCancellation: boolean;
    
    /**
     * Tiempo límite para cancelar antes del inicio (en horas)
     */
    cancellationDeadlineHours?: number;
    
    /**
     * Fecha de creación
     */
    created: string;
    
    /**
     * Usuario que creó la actividad
     */
    createdBy: string;
    
    /**
     * Fecha de última modificación
     */
    modified?: string;
    
    /**
     * Usuario que modificó la actividad
     */
    modifiedBy?: string;
}

/**
 * Interface para crear/actualizar una actividad
 */
export interface ActivityFormData {
    name: string;
    description: string;
    concurrencyType: ConcurrencyType;
    capacity: number;
    slotDuration: number;
    startTime: string;
    endTime: string;
    campId: number;
    location?: string;
    imageUrl?: string;
    isActive: boolean;
    requiresApproval: boolean;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowCancellation: boolean;
    cancellationDeadlineHours?: number;
}

/**
 * Interface para enviar datos al backend API
 * Mapea los campos del formulario a los campos esperados por el backend
 */
export interface ActivityCreateDTO {
    /**
     * Nombre de la actividad
     */
    name: string;
    
    /**
     * Descripción de la actividad
     */
    description: string;
    
    /**
     * Capacidad máxima total del recurso
     * Mapeo: capacity → maxCapacityTotal
     */
    maxCapacityTotal: number;
    
    /**
     * Duración de cada bloque de reserva en minutos
     * Mapeo: slotDuration → blockDurationMinutes
     */
    blockDurationMinutes: number;
    
    /**
     * Hora de inicio en formato HH:mm (24h)
     */
    startTime: string;
    
    /**
     * Hora de fin en formato HH:mm (24h)
     */
    endTime: string;
    
    /**
     * Tipo de concurrencia
     * 0 = ExclusiveTime, 1 = SharedResource
     */
    concurrencyType: ConcurrencyType;
    
    /**
     * Número máximo de reservas concurrentes
     * Para ExclusiveTime: siempre 1
     * Para SharedResource: hasta maxCapacityTotal
     */
    maxConcurrentReservations: number;
    
    /**
     * ID de la compañía/camp asociado
     * Mapeo: campId → companyId
     */
    companyId: number;
}

/**
 * Type para la respuesta del API de actividades
 */
export type ActivityResponse = Activity;

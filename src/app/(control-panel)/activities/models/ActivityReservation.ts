import { ActivityReservationStatus } from './Activity';

/**
 * Interface para el modelo de Reserva de Actividad
 */
export interface ActivityReservation {
    /**
     * ID único de la reserva
     */
    id: number;
    
    /**
     * ID de la actividad reservada
     */
    activityId: number;
    
    /**
     * Nombre de la actividad (para display)
     */
    activityName?: string;
    
    /**
     * ID del usuario que realizó la reserva
     */
    userId: string;
    
    /**
     * Nombre completo del usuario que reservó
     */
    reservedByUserFullName?: string;
    
    /**
     * DNI/RUT del usuario que reservó
     */
    reservedByUserDNI?: string;
    
    /**
     * Nombre completo del beneficiario
     */
    beneficiaryFullName?: string;
    
    /**
     * RUT del beneficiario
     */
    beneficiaryRut?: string;
    
    /**
     * Email del beneficiario
     */
    beneficiaryEmail?: string;
    
    /**
     * Número de teléfono del beneficiario
     */
    beneficiaryMobileNumber?: string;
    
    /**
     * Fecha de la reserva (formato ISO 8601)
     */
    reservationDate: string;
    
    /**
     * Hora de inicio de la reserva (formato HH:mm)
     */
    startTime: string;
    
    /**
     * Hora de fin de la reserva (formato HH:mm)
     */
    endTime: string;
    
    /**
     * Estado de la reserva
     */
    status: ActivityReservationStatus;
    
    /**
     * Número de participantes (para actividades compartidas)
     */
    participantsCount: number;
    
    /**
     * Notas adicionales del usuario
     */
    notes?: string;
    
    /**
     * ID del campamento
     */
    campId: number;
    
    /**
     * Nombre del campamento (opcional, para display)
     */
    campName?: string;
    
    /**
     * Razón de cancelación (si aplica)
     */
    cancellationReason?: string;
    
    /**
     * Usuario que canceló (si aplica)
     */
    cancelledBy?: string;
    
    /**
     * Fecha de cancelación (si aplica)
     */
    cancellationDate?: string;
    
    /**
     * Usuario que aprobó (si requiere aprobación)
     */
    approvedBy?: string;
    
    /**
     * Fecha de aprobación (si aplica)
     */
    approvalDate?: string;
    
    /**
     * Fecha de creación de la reserva
     */
    created: string;
    
    /**
     * Usuario que creó la reserva
     */
    createdBy: string;
    
    /**
     * Fecha de última modificación
     */
    modified?: string;
    
    /**
     * Usuario que modificó la reserva
     */
    modifiedBy?: string;
}

/**
 * Interface para crear una nueva reserva
 */
export interface ActivityReservationCreateData {
    activityId: number;
    userId?: string; // Opcional: puede obtenerse del token
    reservationDate: string;
    startTime: string;
    endTime: string;
    participantsCount: number;
    notes?: string;
    reservedForUserId?: string; // ID del usuario para quien se hace la reserva (solo admins)
}

/**
 * Interface para actualizar el estado de una reserva
 */
export interface ActivityReservationUpdateStatusData {
    status: ActivityReservationStatus;
    cancellationReason?: string;
    approvedBy?: string;
}

/**
 * Interface para la respuesta de disponibilidad de slots
 */
export interface ActivityAvailabilitySlot {
    /**
     * Hora de inicio del slot (formato HH:mm)
     */
    startTime: string;
    
    /**
     * Hora de fin del slot (formato HH:mm)
     */
    endTime: string;
    
    /**
     * Indica si el slot está disponible
     */
    isAvailable: boolean;
    
    /**
     * Capacidad disponible (para actividades compartidas)
     */
    availableCapacity: number;
    
    /**
     * Número de reservas existentes en este slot
     */
    currentReservations: number;
    
    /**
     * Capacidad máxima permitida (nombre del campo en backend)
     */
    maxAllowed: number;
}

/**
 * Interface para la respuesta de disponibilidad por fecha
 */
export interface ActivityAvailabilityResponse {
    /**
     * ID de la actividad
     */
    activityId: number;
    
    /**
     * Fecha consultada (formato ISO 8601)
     */
    date: string;
    
    /**
     * Lista de slots disponibles
     */
    slots: ActivityAvailabilitySlot[];
}

/**
 * Type para la respuesta del API de reservas
 */
export type ActivityReservationResponse = ActivityReservation;

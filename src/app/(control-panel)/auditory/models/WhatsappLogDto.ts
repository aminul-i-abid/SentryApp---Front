export interface WhatsappLogDto {
    id: number;
    reservationGuestId?: number;
    reservationId?: number;
    nameReservation?: string;
    userId?: string;
    actionDateTime: string;
    status: string;
    statusDescription?: string;
    message?: string;
    phoneNumber?: string;
    doorLockId?: number;
    roomId?: number;
    roomNumber?: string;
    created: string;
    createdBy?: string;
    nameCreatedBy?: string;
}
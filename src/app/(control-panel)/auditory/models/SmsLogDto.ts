export interface SmsLogDto {
    id: number;
    reservationGuestId?: number;
    userId: string;
    userName?: string;
    actionDateTime: string;
    status: string;
    message?: string;
    phoneNumber?: string;
    doorLockId?: number;
    roomId?: number;
    roomNumber?: string;
    created: string;
    createdBy?: string;
    nameCreatedBy?: string;
}
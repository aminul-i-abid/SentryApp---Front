export interface DoorLockAccessLogDto {
    lockId: number;
    electricQuantity: number;
    serverDate: string;
    success: number;
    keyboardPwd: string;
    lockDate: number;
    username: string;
    recordTypeStr: string;
    recordTypeFromLockStr: string;
    id: string;
    timestamp: number;
    roomId: number;
    roomName: string;
    blockName: string;
    campName: string;
    isSuccessful: boolean;
    guestInfo?: {
        reservationId: number;
        reservationStartDate: string;
        reservationEndDate: string;
        guestId: number;
        guestFirstName: string;
        guestLastName: string;
        guestEmail: string;
        guestRutVatId: string;
        guestMobileNumber: string;
        roomId: number;
        roomName: string;
    };
    accessStatus: string;
}

export interface PaginatedDoorLockAccessLogsDto {
    items: DoorLockAccessLogDto[];
    totalCount: number;
}
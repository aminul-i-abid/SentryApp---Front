export interface DoorLockRoomHistoryDto {
    id: number;
    roomId: number;
    roomNumber?: string;
    doorLockId: number;
    comments?: string;
    date: string; // ISO date string
    action: string;
    user?: string;
    userName?: string;
    actionDateTime: string; // ISO date string
    created: string; // ISO date string
    createdBy?: string;
    nameCreatedBy?: string;
}

export interface PaginatedDoorLockRoomHistoryDto {
    items: DoorLockRoomHistoryDto[];
    totalCount: number;
}
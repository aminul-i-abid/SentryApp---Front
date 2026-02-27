export interface RoomLogDto {
    id: number;
    roomId?: number;
    roomNumber?: string;
    blockId?: number;
    blockName?: string;
    activityEnum: number;
    activityEnumDescription?: string;
    message?: string;
    status: number;
    statusDescription?: string;
    created: string; // ISO date string
    createdBy?: string;
    nameCreatedBy?: string;
}

export interface PaginatedRoomLogsDto {
    items: RoomLogDto[];
    totalCount: number;
}
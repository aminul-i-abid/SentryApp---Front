export interface BlockRoomCount {
    blockId: number;
    blockName: string;
    roomCount: number;
}

export interface DailyOccupancy {
    date: Date;
    occupiedBeds: number;
}

export interface TagOccupancy {
    totalBeds: number;
    totalRooms: number;
    totalBedsOccupied: number;
}

export interface BlockOccupancy {
    blockId: number;
    blockName: string;
    totalRooms: number;
    totalBeds: number;
    dailyOccupancy: DailyOccupancy[];
    tags?: { [key: string]: TagOccupancy };
}

export interface TagCount {
    tag: number;
    count: number;
}

export interface TagDetail {
    tag: number;
    enabledRooms: number;
    disabledRooms: number;
    totalRooms: number;
    enabledBeds: number;
    disabledBeds: number;
    totalBeds: number;
    lostBeds: number;
}

export interface DailyOccupancySummary {
    date: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyPercentage: number;
}

export interface TagCapacity {
    tag: number;
    totalRooms: number;
    totalBeds: number;
    totalBedsOccupiedToday: number;
    occupancyPercentageToday: number;
}

export interface BlockOccupancySummary {
    blockId: number;
    blockName: string;
    totalBeds: number;
    occupiedBedsToday: number;
    occupancyPercentageToday: number;
}

export interface OccupancySummary {
    blockOccupancy: BlockOccupancySummary[];
    dailyOccupancy: DailyOccupancySummary[];
    occupancyByTag: { [key: string]: DailyOccupancySummary[] };
    capacityByTag: { [key: string]: TagCapacity };
}

export interface BlockRoomDetail {
    roomId: number;
    roomNumber: string;
    totalBeds: number;
    occupiedBedsToday: number;
    occupancyPercentageToday: number;
    isOccupied: boolean;
    doorLockBatteryLevel?: number;
}

export interface BlockOccupancyDetail {
    blockId: number;
    blockName: string;
    totalBeds: number;
    occupiedBedsToday: number;
    occupancyPercentageToday: number;
    roomDetails: BlockRoomDetail[];
}

export interface DashboardResponse {
    totalCamps: number;
    totalCompanies: number;
    totalDoorLocks: number;
    totalReservations: number;
    totalRooms: number;
    totalBlocks: number;
    totalDisabledRooms: TagCount[];
    totalDisabledRoomsBeds: TagCount[];
    blocksRoomCount: BlockRoomCount[];
    blocksOccupancy: BlockOccupancy[];
    tagDetails?: TagDetail[];
    occupancySummary?: OccupancySummary;
    tags: TagCount[];
    lostTags: TagCount[];
}
export interface BlockLogDto {
    id: number;
    blockId?: number;
    blockName?: string;
    campId?: number;
    campName?: string;
    activityEnum: string;
    activityEnumDescription?: string;
    message?: string;
    status: string;
    statusDescription?: string;
    created: string; // ISO string format from backend
}

export interface PaginatedBlockLogsDto {
    items: BlockLogDto[];
    totalCount: number;
}
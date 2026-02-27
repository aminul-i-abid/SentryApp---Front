export interface CampLogDto {
    id: number;
    campId: number | null;
    campName: string | null;
    activityEnum: string;
    activityEnumDescription: string | null;
    message: string | null;
    status: string;
    statusDescription: string | null;
    created: string; // ISO date string
}

export interface PaginatedCampLogsDto {
    items: CampLogDto[];
    totalCount: number;
}
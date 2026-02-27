export interface UserLogDto {
    id: number;
    userId: string;
    userName?: string;
    activityEnum: string;
    activityEnumDescription?: string;
    message?: string;
    status: string;
    statusDescription?: string;
    created: string; // DateTime viene como string del API
    createdBy?: string;
    nameCreatedBy?: string;
}
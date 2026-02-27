export interface EmailLogDto {
    id: number;
    mail?: string;
    status: string;
    statusDescription?: string;
    message?: string;
    created: string;
    createdBy?: string;
    nameCreatedBy?: string;
}
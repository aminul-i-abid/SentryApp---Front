import { EmailLogDto } from './EmailLogDto';

export interface PaginatedEmailLogsDto {
    items: EmailLogDto[];
    totalCount: number;
}
import { SmsLogDto } from './SmsLogDto';

export interface PaginatedSmsLogsDto {
    items: SmsLogDto[];
    totalCount: number;
}
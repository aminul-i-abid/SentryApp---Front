import { UserLogDto } from './UserLogDto';

export interface PaginatedUserLogsDto {
    items: UserLogDto[];
    totalCount: number;
}
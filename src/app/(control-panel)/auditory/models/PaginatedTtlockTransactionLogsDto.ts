import { TtlockTransactionLogDto } from './TtlockTransactionLogDto';

export interface PaginatedTtlockTransactionLogsDto {
  items: TtlockTransactionLogDto[];
  totalCount: number;
}
import { CompanyLogDto } from './CompanyLogDto';

export interface PaginatedCompanyLogsDto {
  items: CompanyLogDto[];
  totalCount: number;
}
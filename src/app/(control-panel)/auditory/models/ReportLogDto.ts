export interface ReportLogDto {
  id: number;
  activityEnum: string;
  activityEnumDescription?: string;
  message?: string;
  status: string;
  statusDescription?: string;
  created: string; // ISO date string
  createdBy?: string;
  nameCreatedBy?: string;
}

export interface PaginatedReportLogsDto {
  items: ReportLogDto[];
  totalCount: number;
}
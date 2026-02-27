export interface CompanyLogDto {
  id: number;
  companyId?: number | null;
  companyName?: string | null;
  activityEnum: string;
  activityEnumDescription?: string | null;
  message?: string | null;
  status: string;
  statusDescription?: string | null;
  created: string; // DateTime se representa como string en TypeScript
  createdBy?: string | null;
  nameCreatedBy?: string | null;
}
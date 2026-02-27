export interface TtlockTransactionLogDto {
  id: number;
  idReservation?: number | null;
  nameReservation?: string | null;
  status?: string | null;
  statusDescription?: string | null;
  message?: string | null;
  pin?: string | null;
  activityEnum?: string | null;
  activityEnumDescription?: string | null;
  created: string; // ISO date string
}
export interface ReserveLogDto {
  id: number;
  idBulkReservation: number;
  guid?: string;
  idReservationGuest: number | null;
  idReservation: number | null;
  activityEnum: number;
  activityEnumDescription: string | null;
  nameGuest: string;
  roomNumber: string | null;
  idRoom: number | null;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  roomAssigned: boolean;
  created: string; // ISO date string
  createdBy: string | null;
  nameCreatedBy: string | null;
}

export interface PaginatedReserveLogsDto {
  items: ReserveLogDto[];
  totalCount: number;
}
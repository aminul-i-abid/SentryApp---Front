export interface RoomDisabledHistoryDto {
  id: number;
  roomId: number;
  roomNumber?: string;
  user: string;
  userName?: string;
  comments?: string;
  date: string; // ISO date string
  action: string;
  created: string; // ISO date string
  createdBy?: string;
  nameCreatedBy?: string;
}

export interface PaginatedRoomDisabledHistoryDto {
  items: RoomDisabledHistoryDto[];
  totalCount: number;
}
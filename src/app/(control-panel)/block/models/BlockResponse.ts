import { RoomResponse } from "@/app/(control-panel)/room/models/RoomResponse";

export interface BlockResponse {
    id: number;
    name: string;
    floors: number;
    campId: number;
    rooms: RoomResponse[];
    checkInTime?: string | null;
    checkOutTime?: string | null;
    prefix: string;
    suffix: string;
    campName?: string;
} 
export interface LostBedRoomContract {
    roomId: number;
    roomNumber: string;
    tag: number; // 0 Manager, 1 Supervisor, 2 Trabajador
    expectedBeds: number;
    actualBeds: number;
    lostBeds: number;
}

// Interfaces para el calendario
export interface CalendarReservation {
    reservationId: number;
    startDate: string;
    endDate: string;
    status: string;
    guestsCount: number;
    bulkReservationGuid: string;
    fullName: string;
}

export interface CalendarRoom {
    roomNumber: string;
    beds: number;
    blockName: string;
    campName: string;
    checkInTime: string;
    checkOutTime: string;
    reservations: CalendarReservation[];
}
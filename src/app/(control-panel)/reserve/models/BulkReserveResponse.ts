export interface BulkReserve {
    id: number;
    comments: string;
    companyId: number;
    totalReservations: number;
    checkIn?: string;
    checkOut?: string;
    created?: string;
    companyName?: string;
    guid: string;
    guestCount: number;
    numberOfReservations: number;
    activeReservations: number;
    cancelledReservations: number;
    solicitante?: string;
    solicitanteEmail?: string;
    status?: number;
}

export interface BulkReservePaginatedResponse {
    items: BulkReserve[];
    totalCount: number;
}
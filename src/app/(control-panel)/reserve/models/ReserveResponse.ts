export interface ReserveResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    roomNumber: string;
    rutVatId: string;
    jobTitle: string;
    checkIn: string;
    checkOut: string;
    status: number;
    created: string;
    guestsCount: number;
    beds: number;
    tag: string;
    companyName: string;
    guid: string;
    doorPassword?: string;
}

export interface ReservePaginatedResponse {
    items: ReserveResponse[];
    totalCount: number;
    guid: string;
    companyName: string;
} 
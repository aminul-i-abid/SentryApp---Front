export interface Guest {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    rutVatId: string;
    jobTitle: string;
    gender: string;
    doorLockSet: number;
    doorLockStatus: number;
    whatsappSent: number;
    whatsappStatus: number;
    doorPassword?: string;
    shiftType: number;
    createdByUserName: string;
    lastModifiedByUserName: string;
}

export interface ReserveDetailResponse {
    id: number;
    checkIn: string;
    checkOut: string;
    status: number;
    comments: string;
    companyId: number;
    companyName: string;
    roomId: number;
    roomNumber: string;
    guid: string;
    beds: number;
    floorNumber: number;
    blockName: string;
    campName: string;
    guests: Guest[];
}
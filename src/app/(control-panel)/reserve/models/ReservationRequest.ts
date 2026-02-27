export interface GuestRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  rutVatId: string;
  jobTitleId: number;
  genderId: number;
  shiftId: number;
  durationId?: number | null;
}

export interface ReservationRequest {
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  comments: string;
  companyId: number;
  guests: GuestRequest[];
  sharedBooking?: boolean;
  reservationType?: string;
}
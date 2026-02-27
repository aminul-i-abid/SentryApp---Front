export enum StatusReservation {
    ACTIVE = 0,
    CANCELLED = 1,
    CHECKED_IN = 2,
    EXPIRED = 3,
  }

  export type StatusReservationType = StatusReservation.ACTIVE | StatusReservation.CANCELLED | StatusReservation.EXPIRED | StatusReservation.CHECKED_IN;
export enum OptionReservation {
    BULK = 'Reserva Masiva',
    INDIVIDUAL = 'Reserva Individual',
  }
  
  export type OptionReservationType = OptionReservation.BULK | OptionReservation.INDIVIDUAL;
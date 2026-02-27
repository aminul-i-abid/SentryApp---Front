export enum AuditoryTables {
    BLOCK = 0,
    CAMP = 1,
    COMPANY = 2,
    DOORLOCK = 3,
    EMAIL = 4,
    RESERVATIONS = 5,
    ROOMDISABLEDSTATES = 6,
    TTLOCKTRANSACTIONS = 7,
    WHATSAPP = 8,
    SMS = 9,
    USER = 10,
    ROOM = 11,
    REPORTS = 12,
    DOORLOCKACCESSLOGS = 13,
}

export interface AuditoryTableOption {
    value: AuditoryTables;
    display: string;
    requiresTTLock?: boolean;
}

export const AUDITORY_TABLE_OPTIONS: AuditoryTableOption[] = [
    { value: AuditoryTables.BLOCK, display: 'Bloques' },
    { value: AuditoryTables.CAMP, display: 'Campamentos' },
    { value: AuditoryTables.COMPANY, display: 'Compañías' },
    { value: AuditoryTables.DOORLOCK, display: 'Cerraduras de Puerta', requiresTTLock: true },
    { value: AuditoryTables.EMAIL, display: 'Correos' },
    { value: AuditoryTables.RESERVATIONS, display: 'Reservas' },
    { value: AuditoryTables.ROOMDISABLEDSTATES, display: 'Estados de Habitación' },
    { value: AuditoryTables.TTLOCKTRANSACTIONS, display: 'Transacciones TTLock', requiresTTLock: true },
    { value: AuditoryTables.WHATSAPP, display: 'WhatsApps' },
    { value: AuditoryTables.SMS, display: 'SMS' },
    { value: AuditoryTables.USER, display: 'Usuarios' },
    { value: AuditoryTables.ROOM, display: 'Habitaciones' },
    { value: AuditoryTables.REPORTS, display: 'Reportes' },
    { value: AuditoryTables.DOORLOCKACCESSLOGS, display: 'Historial de Accesos', requiresTTLock: true },
];
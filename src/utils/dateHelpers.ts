import { format, differenceInDays as dateFnsDifferenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en formato completo: "DD/MM/YYYY HH:mm"
 */
export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
}

/**
 * Formatea una fecha en formato corto: "DD/MM/YYYY"
 */
export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
}

/**
 * Formatea una hora en formato HH:mm
 */
export function formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function differenceInDays(endDate: Date | string, startDate: Date | string): number {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    return dateFnsDifferenceInDays(end, start);
}

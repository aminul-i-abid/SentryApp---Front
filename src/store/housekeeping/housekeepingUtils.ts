/**
 * Housekeeping Utilities - Lógica de Negocio
 *
 * Funciones de cálculo para periodicidad de limpieza,
 * detección de checkout y resolución de reglas aplicables.
 */

import { differenceInDays, isSameDay } from 'date-fns';
import type { CleaningRule } from './housekeepingTypes';

/**
 * Determina si una habitación necesita limpieza HOY según la regla de periodicidad.
 * Basado en el inicio de la reserva activa.
 *
 * @param reservationStartDate - Fecha de inicio de la reserva activa
 * @param daysInterval - Intervalo de la regla (1-14 días)
 * @param today - Fecha actual (default: hoy)
 * @returns true si hoy corresponde limpieza
 */
export function shouldCleanToday(
  reservationStartDate: Date,
  daysInterval: number,
  today: Date = new Date()
): boolean {
  const daysSinceStart = differenceInDays(today, reservationStartDate);
  if (daysSinceStart === 0) return true; // Día de check-in siempre limpia
  if (daysSinceStart < 0) return false;  // Reserva futura, no aplica
  return daysSinceStart % daysInterval === 0;
}

/**
 * Detecta si una reserva tiene checkout hoy.
 *
 * @param reservationEndDate - Fecha de fin de la reserva
 * @param today - Fecha actual (default: hoy)
 * @returns true si la reserva termina hoy
 */
export function isCheckoutDay(
  reservationEndDate: Date,
  today: Date = new Date()
): boolean {
  return isSameDay(reservationEndDate, today);
}

/**
 * Dado un conjunto de reglas, retorna la regla aplicable a una habitación hoy.
 * Las reglas se ordenan por prioridad descendente (mayor número = mayor prioridad).
 *
 * @param rules - Lista de reglas activas a evaluar
 * @param reservationStartDate - Inicio de la reserva activa (null si habitación vacía)
 * @param isCheckout - Si hoy es día de checkout de la habitación
 * @param roomTags - Tags de la habitación para filtrado por segmentación
 * @param today - Fecha actual (default: hoy)
 * @returns La regla de mayor prioridad aplicable, o null si ninguna aplica
 */
export function resolveApplicableRule(
  rules: CleaningRule[],
  reservationStartDate: Date | null,
  isCheckout: boolean,
  roomTags: string[] = [],
  today: Date = new Date()
): CleaningRule | null {
  const applicable = rules
    .filter((rule) => {
      if (!rule.isActive) return false;

      // Trigger checkout — solo requiere que sea día de checkout
      if (rule.triggerType === 'checkout' && isCheckout) return true;

      // Trigger interval — requiere reserva activa y cálculo de días
      if (
        rule.triggerType === 'interval' &&
        rule.daysInterval &&
        reservationStartDate
      ) {
        return shouldCleanToday(reservationStartDate, rule.daysInterval, today);
      }

      // Trigger manual — nunca se activa automáticamente
      return false;
    })
    .sort((a, b) => b.priority - a.priority);

  return applicable[0] ?? null;
}

/**
 * Detecta conflictos entre una regla nueva y las reglas existentes.
 * Un conflicto ocurre cuando dos reglas tienen el mismo triggerType
 * y sus targets se solapan.
 *
 * @param newRule - La regla nueva o en edición
 * @param existingRules - Lista de reglas ya guardadas
 * @returns Lista de conflictos encontrados
 */
export function detectRuleConflicts(
  newRule: CleaningRule,
  existingRules: CleaningRule[]
): Array<{
  conflictingRuleId: string;
  conflictingRuleName: string;
  description: string;
}> {
  return existingRules
    .filter(
      (r) =>
        r.id !== newRule.id &&
        r.isActive &&
        r.triggerType === newRule.triggerType
    )
    .filter((r) => {
      // Si alguna de las dos reglas aplica a todo el camp, siempre hay solapamiento
      if (r.appliesTo === 'camp' || newRule.appliesTo === 'camp') return true;
      // Verificar solapamiento de targets específicos
      const newTargets = new Set(
        (newRule.targetIds ?? '').split(',').filter(Boolean)
      );
      const existingTargets = (r.targetIds ?? '').split(',').filter(Boolean);
      return existingTargets.some((t) => newTargets.has(t));
    })
    .map((r) => ({
      conflictingRuleId: r.id,
      conflictingRuleName: r.name,
      description: `Conflicto con regla "${r.name}": mismo trigger en targets solapados`,
    }));
}

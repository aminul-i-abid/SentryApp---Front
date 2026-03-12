import { ChipProps } from '@mui/material';

/**
 * Badge variant types
 */
export type BadgeVariant = 'filled' | 'outlined' | 'soft';

/**
 * Extended Badge props with Sentry-specific options
 */
export interface SentryBadgeProps extends Omit<ChipProps, 'variant' | 'color'> {
	/**
	 * The color of the badge
	 * @default 'default'
	 */
	color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

	/**
	 * The variant to use
	 * - filled: Solid background color
	 * - outlined: Border with transparent background
	 * - soft: Low-opacity background (10%)
	 * @default 'filled'
	 */
	variant?: BadgeVariant;
}

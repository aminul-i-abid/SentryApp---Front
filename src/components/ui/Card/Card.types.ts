import { PaperProps } from '@mui/material';
import { ReactNode } from 'react';

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'bordered' | 'elevated' | 'outlined';

/**
 * Card padding presets
 */
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

/**
 * Extended Card props with Sentry-specific options
 */
export interface SentryCardProps extends Omit<PaperProps, 'variant'> {
	/**
	 * The variant to use
	 * @default 'default'
	 */
	variant?: CardVariant;

	/**
	 * Padding preset for the card content
	 * @default 'medium'
	 */
	padding?: CardPadding;

	/**
	 * Optional header content
	 */
	header?: ReactNode;

	/**
	 * Optional footer content
	 */
	footer?: ReactNode;

	/**
	 * If true, adds hover effect and cursor pointer
	 * @default false
	 */
	clickable?: boolean;
}

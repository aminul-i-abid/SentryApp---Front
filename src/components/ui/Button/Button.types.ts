import { ButtonProps as MuiButtonProps } from '@mui/material';

/**
 * Custom color options for Sentry Button component
 */
export type SentryButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'dark' | 'light';

/**
 * Extended Button props with Sentry-specific options
 */
export interface SentryButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
	/**
	 * The color of the button
	 * @default 'primary'
	 */
	color?: SentryButtonColor;

	/**
	 * The variant to use
	 * @default 'contained'
	 */
	variant?: 'contained' | 'outlined' | 'text' | 'ghost';

	/**
	 * The size of the button
	 * @default 'medium'
	 */
	size?: 'small' | 'medium' | 'large';

	/**
	 * If true, the button will take up the full width of its container
	 * @default false
	 */
	fullWidth?: boolean;

	/**
	 * If true, the button will show a loading state
	 * @default false
	 */
	loading?: boolean;
}

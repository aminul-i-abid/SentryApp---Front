import { TextFieldProps } from '@mui/material';

/**
 * Extended Input props with Sentry-specific options
 */
export interface SentryInputProps extends Omit<TextFieldProps, 'color'> {
	/**
	 * The color of the input
	 * @default 'secondary'
	 */
	color?: 'primary' | 'secondary';

	/**
	 * The variant to use
	 * @default 'outlined'
	 */
	variant?: 'outlined' | 'filled' | 'standard';
}

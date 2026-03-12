import { forwardRef } from 'react';
import { TextField } from '@mui/material';
import clsx from 'clsx';
import { SentryInputProps } from './Input.types';

/**
 * Sentry Input Component
 *
 * A wrapper around MUI TextField with brand colors and consistent styling.
 * Uses secondary (cyan) color by default for a modern look.
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input label="Email" placeholder="Enter your email" />
 *
 * // With error state
 * <Input
 *   label="Password"
 *   type="password"
 *   error
 *   helperText="Password is required"
 * />
 *
 * // Full width with primary color
 * <Input
 *   label="Username"
 *   fullWidth
 *   color="primary"
 * />
 * ```
 */
export const Input = forwardRef<HTMLDivElement, SentryInputProps>(
	({ color = 'secondary', variant = 'outlined', className, ...props }, ref) => {
		return (
			<TextField
				ref={ref}
				color={color}
				variant={variant}
				className={clsx('sentry-input', className)}
				{...props}
			/>
		);
	}
);

Input.displayName = 'SentryInput';

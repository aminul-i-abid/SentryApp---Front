import { forwardRef } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { SentryButtonProps } from './Button.types';

/**
 * Styled button for dark and light color variants
 */
const StyledCustomButton = styled(MuiButton, {
	shouldForwardProp: (prop) => prop !== 'customColor'
})<{ customColor?: 'dark' | 'light' }>(({ theme, customColor }) => {
	if (customColor === 'dark') {
		return {
			'&.MuiButton-contained': {
				backgroundColor: '#0c0c0c',
				color: '#f8f9f2',
				'&:hover': {
					backgroundColor: '#1a1a1a'
				}
			},
			'&.MuiButton-outlined': {
				borderColor: '#0c0c0c',
				color: '#0c0c0c',
				'&:hover': {
					borderColor: '#1a1a1a',
					backgroundColor: 'rgba(12, 12, 12, 0.04)'
				}
			}
		};
	}

	if (customColor === 'light') {
		return {
			'&.MuiButton-contained': {
				backgroundColor: '#f8f9f2',
				color: '#0c0c0c',
				'&:hover': {
					backgroundColor: '#E8E9E2'
				}
			},
			'&.MuiButton-outlined': {
				borderColor: '#f8f9f2',
				color: '#f8f9f2',
				'&:hover': {
					borderColor: '#E8E9E2',
					backgroundColor: 'rgba(248, 249, 242, 0.08)'
				}
			}
		};
	}

	return {};
});

/**
 * Sentry Button Component
 *
 * A wrapper around MUI Button with brand-specific color presets and additional features.
 * Supports all standard MUI button variants plus custom 'ghost' variant and 'dark'/'light' colors.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="contained" color="primary">Save</Button>
 *
 * // Secondary button
 * <Button variant="outlined" color="secondary">Cancel</Button>
 *
 * // Loading state
 * <Button loading>Submitting...</Button>
 *
 * // Dark button
 * <Button color="dark" variant="contained">Dark Action</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, SentryButtonProps>(
	(
		{
			variant = 'contained',
			color = 'primary',
			size = 'medium',
			className,
			children,
			loading = false,
			disabled = false,
			startIcon,
			endIcon,
			...props
		},
		ref
	) => {
		// Handle custom dark and light colors
		const isCustomColor = color === 'dark' || color === 'light';

		// Map ghost variant to text variant for MUI
		const muiVariant = variant === 'ghost' ? 'text' : variant;

		// Map custom colors to MUI colors (inherit for dark/light)
		const muiColor = isCustomColor ? 'inherit' : color;

		return (
			<StyledCustomButton
				ref={ref}
				variant={muiVariant}
				color={muiColor as any}
				size={size}
				disabled={disabled || loading}
				customColor={isCustomColor ? color : undefined}
				className={clsx(className, {
					'opacity-60 cursor-not-allowed': loading
				})}
				startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
				endIcon={endIcon}
				{...props}
			>
				{children}
			</StyledCustomButton>
		);
	}
);

Button.displayName = 'SentryButton';

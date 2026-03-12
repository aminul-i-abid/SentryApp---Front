import { forwardRef } from 'react';
import { Chip } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import clsx from 'clsx';
import { SentryBadgeProps } from './Badge.types';

/**
 * Styled Chip for soft variant with low-opacity backgrounds
 */
const StyledChip = styled(Chip, {
	shouldForwardProp: (prop) => prop !== 'isSoft'
})<{ isSoft?: boolean }>(({ theme, color, isSoft }) => {
	if (!isSoft || !color || color === 'default') return {};

	// Get the theme color palette
	const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

	return {
		backgroundColor: alpha(colorValue, 0.1),
		color: colorValue,
		borderColor: alpha(colorValue, 0.3),
		'&:hover': {
			backgroundColor: alpha(colorValue, 0.15)
		},
		'& .MuiChip-deleteIcon': {
			color: alpha(colorValue, 0.7),
			'&:hover': {
				color: colorValue
			}
		}
	};
});

/**
 * Sentry Badge Component
 *
 * A wrapper around MUI Chip for status indicators and labels.
 * Perfect for room status, reservation status, and category tags.
 *
 * @example
 * ```tsx
 * // Success badge (e.g., "Available" room status)
 * <Badge color="success">Available</Badge>
 *
 * // Error badge (e.g., "Disabled" room status)
 * <Badge color="error">Disabled</Badge>
 *
 * // Outlined badge
 * <Badge color="primary" variant="outlined">Reserved</Badge>
 *
 * // Soft variant with low-opacity background
 * <Badge color="info" variant="soft">Pending</Badge>
 *
 * // With delete/close icon
 * <Badge color="secondary" onDelete={() => console.log('Delete')}>Tag</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLDivElement, SentryBadgeProps>(
	({ color = 'default', variant = 'filled', className, ...props }, ref) => {
		const isSoft = variant === 'soft';
		const muiVariant = isSoft ? 'filled' : variant;
		const muiColor = color === 'default' ? undefined : color;

		return (
			<StyledChip
				ref={ref}
				color={muiColor}
				variant={muiVariant}
				isSoft={isSoft}
				className={clsx('sentry-badge', className)}
				{...props}
			/>
		);
	}
);

Badge.displayName = 'SentryBadge';

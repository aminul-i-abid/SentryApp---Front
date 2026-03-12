import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { SentryCardProps, CardPadding } from './Card.types';

/**
 * Styled Paper component with hover effects for clickable cards
 */
const StyledPaper = styled(Paper, {
	shouldForwardProp: (prop) => prop !== 'clickable'
})<{ clickable?: boolean }>(({ theme, clickable }) => ({
	...(clickable && {
		cursor: 'pointer',
		transition: theme.transitions.create(['box-shadow', 'transform'], {
			duration: theme.transitions.duration.shorter
		}),
		'&:hover': {
			boxShadow: theme.shadows[4],
			transform: 'translateY(-2px)'
		}
	})
}));

/**
 * Padding map for consistent spacing
 */
const paddingMap: Record<CardPadding, number> = {
	none: 0,
	small: 2,  // 16px
	medium: 3, // 24px
	large: 4   // 32px
};

/**
 * Sentry Card Component
 *
 * A wrapper around MUI Paper for consistent content containers.
 * Perfect for Dashboard KPI cards, information panels, and content sections.
 *
 * @example
 * ```tsx
 * // Simple card
 * <Card variant="bordered" padding="large">
 *   <Typography>Content goes here</Typography>
 * </Card>
 *
 * // Card with header and footer
 * <Card
 *   variant="elevated"
 *   header="Dashboard Stats"
 *   footer={<Button>View More</Button>}
 * >
 *   <Typography>Card content</Typography>
 * </Card>
 *
 * // Clickable card
 * <Card clickable onClick={() => console.log('Clicked')}>
 *   <Typography>Click me!</Typography>
 * </Card>
 * ```
 */
export const Card = ({
	variant = 'default',
	padding = 'medium',
	header,
	footer,
	clickable = false,
	children,
	className,
	...props
}: SentryCardProps) => {
	// Map variant to elevation
	const elevationMap = {
		default: 0,
		bordered: 0,
		elevated: 2,
		outlined: 0
	};

	// Determine if card should have a border
	const hasBorder = variant === 'bordered' || variant === 'outlined';

	return (
		<StyledPaper
			elevation={elevationMap[variant]}
			clickable={clickable}
			className={clsx(className, {
				'border border-grey-200 dark:border-grey-700': hasBorder
			})}
			sx={{
				borderRadius: 2,
				overflow: 'hidden',
				backgroundColor: 'background.paper',
				...(hasBorder && {
					borderWidth: 1,
					borderStyle: 'solid',
					borderColor: 'divider'
				})
			}}
			{...props}
		>
			{/* Header Section */}
			{header && (
				<Box
					sx={{
						p: paddingMap[padding],
						borderBottom: '1px solid',
						borderColor: 'divider'
					}}
				>
					{typeof header === 'string' ? (
						<Typography variant="h6" fontWeight={600}>
							{header}
						</Typography>
					) : (
						header
					)}
				</Box>
			)}

			{/* Content Section */}
			<Box sx={{ p: paddingMap[padding] }}>{children}</Box>

			{/* Footer Section */}
			{footer && (
				<Box
					sx={{
						p: paddingMap[padding],
						borderTop: '1px solid',
						borderColor: 'divider'
					}}
				>
					{footer}
				</Box>
			)}
		</StyledPaper>
	);
};

Card.displayName = 'SentryCard';

import { useTheme } from '@mui/material/styles';
import { brandColors } from '../../../configs/brandColors';

/**
 * Return type for useThemeColors hook
 */
export interface ThemeColors {
	// Brand colors
	primary: string;
	primaryLight: string;
	primaryDark: string;
	secondary: string;
	secondaryLight: string;
	secondaryDark: string;
	dark: string;
	light: string;

	// Semantic colors
	success: string;
	successLight: string;
	successDark: string;
	warning: string;
	warningLight: string;
	warningDark: string;
	error: string;
	errorLight: string;
	errorDark: string;
	info: string;
	infoLight: string;
	infoDark: string;

	// Text colors
	textPrimary: string;
	textSecondary: string;
	textDisabled: string;

	// Background colors
	bgDefault: string;
	bgPaper: string;

	// Utility colors
	divider: string;
	grey: typeof brandColors.grey;
}

/**
 * useThemeColors Hook
 *
 * Custom hook providing easy access to brand colors from the MUI theme.
 * Automatically adapts to light/dark mode.
 *
 * @returns ThemeColors object with all brand and semantic colors
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const colors = useThemeColors();
 *
 *   return (
 *     <Box sx={{ backgroundColor: colors.primary, color: colors.textPrimary }}>
 *       <Typography sx={{ color: colors.textSecondary }}>
 *         Secondary text
 *       </Typography>
 *     </Box>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using in Chart.js configuration
 * function ChartComponent() {
 *   const colors = useThemeColors();
 *
 *   const chartData = {
 *     datasets: [{
 *       backgroundColor: colors.primary,
 *       borderColor: colors.primaryDark,
 *     }]
 *   };
 *
 *   return <Bar data={chartData} />;
 * }
 * ```
 */
export const useThemeColors = (): ThemeColors => {
	const theme = useTheme();

	return {
		// Brand colors from theme
		primary: theme.palette.primary.main,
		primaryLight: theme.palette.primary.light,
		primaryDark: theme.palette.primary.dark,
		secondary: theme.palette.secondary.main,
		secondaryLight: theme.palette.secondary.light,
		secondaryDark: theme.palette.secondary.dark,
		dark: brandColors.dark.main,
		light: brandColors.light.main,

		// Semantic colors from theme
		success: theme.palette.success.main,
		successLight: theme.palette.success.light,
		successDark: theme.palette.success.dark,
		warning: theme.palette.warning.main,
		warningLight: theme.palette.warning.light,
		warningDark: theme.palette.warning.dark,
		error: theme.palette.error.main,
		errorLight: theme.palette.error.light,
		errorDark: theme.palette.error.dark,
		info: theme.palette.info.main,
		infoLight: theme.palette.info.light,
		infoDark: theme.palette.info.dark,

		// Text colors from theme (adapts to light/dark mode)
		textPrimary: theme.palette.text.primary,
		textSecondary: theme.palette.text.secondary,
		textDisabled: theme.palette.text.disabled,

		// Background colors from theme (adapts to light/dark mode)
		bgDefault: theme.palette.background.default,
		bgPaper: theme.palette.background.paper,

		// Utility
		divider: theme.palette.divider,
		grey: brandColors.grey
	};
};

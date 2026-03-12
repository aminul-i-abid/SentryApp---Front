/**
 * Sentry Brand Colors
 *
 * Centralized color definitions for the SentryApp brand.
 * These colors follow Material Design color scale patterns (main, light, dark).
 */

export const brandColors = {
  // Brand Primary Colors
  primary: {
    main: '#053ae2',      // Brand Blue - Primary actions, headers, key UI elements
    light: '#3D6BFF',     // Lighter variant (40% lighter) - Hover states, accents
    dark: '#042BA8',      // Darker variant (20% darker) - Active states, dark mode adjustments
    contrastText: '#FFFFFF'
  },

  secondary: {
    main: '#07e0e0',      // Brand Cyan/Turquoise - Secondary actions, accents
    light: '#40EAEA',     // Lighter variant
    dark: '#05B3B3',      // Darker variant
    contrastText: '#0c0c0c'
  },

  dark: {
    main: '#0c0c0c',      // Brand Dark Gray/Black - Dark backgrounds, primary text
    light: '#1a1a1a',     // Slightly lighter for layering
    dark: '#000000',      // Pure black
    contrastText: '#f8f9f2'
  },

  light: {
    main: '#f8f9f2',      // Brand Off-White - Light backgrounds
    light: '#FFFFFF',     // Pure white for elevated surfaces
    dark: '#E8E9E2',      // Slightly darker for subtle contrast
    contrastText: '#0c0c0c'
  },

  // Semantic Colors (complementary to brand palette)
  success: {
    main: '#10B981',      // Green - Success states, positive metrics, available status
    light: '#34D399',     // Lighter green
    dark: '#059669',      // Darker green
    contrastText: '#FFFFFF'
  },

  warning: {
    main: '#F59E0B',      // Amber/Orange - Warning states, attention needed
    light: '#FBBF24',     // Lighter amber
    dark: '#D97706',      // Darker amber
    contrastText: '#FFFFFF'
  },

  error: {
    main: '#EF4444',      // Red - Error states, destructive actions, disabled status
    light: '#F87171',     // Lighter red
    dark: '#DC2626',      // Darker red
    contrastText: '#FFFFFF'
  },

  info: {
    main: '#3B82F6',      // Light Blue - Informational messages, neutral highlights
    light: '#60A5FA',     // Lighter blue
    dark: '#2563EB',      // Darker blue
    contrastText: '#FFFFFF'
  },

  // Neutral Gray Scale (Material Design inspired)
  grey: {
    50: '#F9FAFB',        // Lightest gray - Subtle backgrounds
    100: '#F3F4F6',       // Very light gray - Hover states
    200: '#E5E7EB',       // Light gray - Borders, dividers
    300: '#D1D5DB',       // Medium-light gray - Disabled borders
    400: '#9CA3AF',       // Medium gray - Disabled text
    500: '#6B7280',       // Neutral gray - Secondary text
    600: '#4B5563',       // Dark-medium gray - Primary text (light mode)
    700: '#374151',       // Dark gray - Dark mode borders
    800: '#1F2937',       // Very dark gray - Dark mode backgrounds
    900: '#111827',       // Darkest gray - Dark mode elevated surfaces
  }
} as const;

/**
 * Type helper for accessing brand colors
 */
export type BrandColors = typeof brandColors;
export type BrandColorKeys = keyof typeof brandColors;
export type ColorShades = 'main' | 'light' | 'dark' | 'contrastText';

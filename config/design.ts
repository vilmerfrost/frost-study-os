/**
 * Frost Study OS Design System v3 - Frost Bygg Style
 * Light, clean, professional SaaS design
 */

export const studyOSColors = {
  // Backgrounds
  bg: {
    primary: '#FAFBFC',      // Light gray-white (like Frost Bygg)
    card: '#FFFFFF',         // Pure white cards
    hover: '#F5F7FA',        // Subtle hover
  },

  // Borders & Dividers
  border: {
    light: '#E5E9F0',        // Subtle borders
    medium: '#D0D7E3',       // Stronger dividers
  },

  // Text
  text: {
    primary: '#1A1D29',      // Dark text
    secondary: '#6B7280',    // Gray text
    tertiary: '#9CA3AF',     // Lighter gray
  },

  // Accent (Gradient for CTAs)
  accent: {
    blue: '#5B7CFF',         // Primary blue
    purple: '#B24BF3',       // Purple accent
    gradient: 'linear-gradient(135deg, #5B7CFF 0%, #B24BF3 100%)',
  },

  // Semantic Colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Orange
  error: '#EF4444',          // Red
  info: '#3B82F6',           // Blue

  // Sidebar
  sidebar: {
    bg: '#FFFFFF',
    active: '#F0F4FF',       // Subtle blue tint
    hover: '#F9FAFB',
    text: '#6B7280',
    activeText: '#5B7CFF',
  },
};

export const frostTypography = {
  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',

  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};


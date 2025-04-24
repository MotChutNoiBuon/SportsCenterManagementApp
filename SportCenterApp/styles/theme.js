// styles/theme.js - Chứa các giá trị chung cho toàn bộ ứng dụng

const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
  gray: '#6c757d',
  grayLight: '#f0f0f0',
  grayDark: '#343a40',
  transparent: 'transparent',
  // Màu nền
  background: '#ffffff',
  // Màu văn bản
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  textMuted: '#6c757d',
  textWhite: '#ffffff',
  // Màu viền
  borderColor: '#dee2e6',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  // Spacing cho container
  containerPadding: 20,
};

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 14,
  button: 16,
};

const borderRadius = {
  xs: 4,
  sm: 8, 
  md: 10,
  lg: 16,
  xl: 24,
  round: 50,
  circle: 9999,
};

export default {
  colors,
  spacing,
  fontSize,
  borderRadius,
}; 
// styles/commonStyles.js - Phong cách sử dụng chung trong ứng dụng
import { StyleSheet } from 'react-native';
import theme from './theme';

const commonStyles = StyleSheet.create({
  // Các container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.containerPadding,
  },
  
  containerWithPadding: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.containerPadding,
  },
  
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.containerPadding,
  },
  
  // Flex layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Các phần tử UI phổ biến
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Typography
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  
  subtitle: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  
  bodyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  
  // Buttons
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
  },
  
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.button,
    fontWeight: 'bold',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.sm,
  },
  
  buttonOutlineText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.button,
    fontWeight: 'bold',
  },
  
  buttonDisabled: {
    opacity: 0.7,
  },
  
  // Forms
  input: {
    marginBottom: theme.spacing.md,
  },
  
  label: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  
  // Icons & Images
  icon: {
    width: 24,
    height: 24,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
});

export default commonStyles; 
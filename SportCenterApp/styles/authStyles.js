// styles/authStyles.js - Phong cách cho các màn hình xác thực
import { StyleSheet } from 'react-native';
import theme from './theme';

const authStyles = StyleSheet.create({
  // Container cho các màn hình xác thực
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.containerPadding,
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.containerPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl * 2, // Tăng padding ở dưới để tránh bị che
    justifyContent: 'center', // Giúp căn giữa nội dung khi có ít phần tử
  },
  
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Logo và tiêu đề
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: "white"
  },
  
  // Form inputs
  input: {
    marginBottom: theme.spacing.md,
  },
  
  // Buttons
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  
  buttonText: {
    color: theme.colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: theme.fontSize.md,
  },
  
  disabledButton: {
    opacity: 0.7,
  },
  
  // Avatar container cho đăng ký
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.grayLight,
    borderRadius: theme.borderRadius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  
  // Welcome screen buttons
  welcomeBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
  },
  
  welcomeButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  
  welcomeButtonText: {
    color: theme.colors.black,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  welcomeButtonOutline: {
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.black,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  
  welcomeButtonOutlineText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Social login
  orText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
  },
  
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.grayLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing.sm,
  },
  
  socialText: {
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  
  // Links
  link: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  
  loginLink: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  
  registerLink: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  
  // Styles cho thông báo lỗi chung
  errorText: {
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  
  // Styles cho lỗi từng trường
  fieldError: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 8,
  },
});

export default authStyles; 
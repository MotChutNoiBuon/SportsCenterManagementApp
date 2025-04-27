// styles/customerStyles.js - Phong cách cho các màn hình khách hàng
import { StyleSheet } from 'react-native';
import theme from './theme';

const customerStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  
  // Headers
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  
  // User profile section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.grayLight,
  },
  
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  
  profileInfo: {
    flex: 1,
  },
  
  profileName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  profileEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  
  seeAllButton: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  
  // Categories
  categoriesContainer: {
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    width: 80,
  },
  
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  categoryIconActive: {
    backgroundColor: theme.colors.primary,
  },
  
  categoryName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  categoryNameActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  
  // Cards
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.containerPadding,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  cardRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  cardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  cardInfoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  
  cardButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  
  cardButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  
  emptyButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  
  // Bottom navigation
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
    paddingBottom: theme.spacing.sm,
  },
  
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  
  bottomNavItemActive: {
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  
  bottomNavText: {
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  
  bottomNavTextActive: {
    color: theme.colors.primary,
  },
  
  // Booking section
  bookingContainer: {
    padding: theme.spacing.md,
  },
  
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  
  bookingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  
  bookingValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  bookingButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  
  bookingButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});

export default customerStyles; 
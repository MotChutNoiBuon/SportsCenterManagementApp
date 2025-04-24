// styles/adminStyles.js - Phong cách cho các màn hình quản trị viên
import { StyleSheet } from 'react-native';
import theme from './theme';

const adminStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  contentContainer: {
    padding: theme.spacing.containerPadding,
  },
  
  // Admin Dashboard
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  
  adminInfoSection: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.containerPadding,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  adminAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  
  adminInfo: {
    flex: 1,
  },
  
  adminName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  adminRole: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Dashboard Cards
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing.containerPadding,
  },
  
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  
  statTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    marginVertical: theme.spacing.md,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  
  sectionAction: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
  },
  
  // List Items
  listItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.containerPadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  
  listItemContent: {
    flex: 1,
  },
  
  listItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  listItemSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  listItemDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  
  // Forms
  formContainer: {
    padding: theme.spacing.containerPadding,
    backgroundColor: theme.colors.white,
  },
  
  formLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  
  formInput: {
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  
  formSelect: {
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.md,
  },
  
  formButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  
  formSubmitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flex: 1,
  },
  
  formCancelButton: {
    backgroundColor: theme.colors.light,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginRight: theme.spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  
  formButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  
  formCancelButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  
  // Modals
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '80%',
    maxHeight: '80%',
  },
  
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  
  modalPrimaryButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  
  modalSecondaryButton: {
    backgroundColor: theme.colors.light,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    marginRight: theme.spacing.sm,
  },
  
  modalButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  
  modalPrimaryButtonText: {
    color: theme.colors.white,
  },
  
  modalSecondaryButtonText: {
    color: theme.colors.textPrimary,
  },
  
  // Search
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    marginRight: theme.spacing.sm,
  },
  
  searchButton: {
    padding: theme.spacing.sm,
  },
  
  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.light,
    flexWrap: 'wrap',
  },
  
  filterChip: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  
  filterChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  
  activeFilterChipText: {
    color: theme.colors.white,
  },
});

export default adminStyles; 
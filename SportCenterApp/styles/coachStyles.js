// styles/coachStyles.js - Phong cách cho các màn hình huấn luyện viên
import { StyleSheet } from 'react-native';
import theme from './theme';

const coachStyles = StyleSheet.create({
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
  
  // Coach Dashboard
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.info,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  
  coachInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  
  coachInfo: {
    flex: 1,
  },
  
  coachName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  coachSpecialty: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Schedule Section
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.containerPadding,
    marginVertical: theme.spacing.md,
  },
  
  scheduleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  
  scheduleDate: {
    fontSize: theme.fontSize.md,
    color: theme.colors.info,
    fontWeight: '600',
  },
  
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.containerPadding,
    marginBottom: theme.spacing.md,
  },
  
  dayItem: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.light,
  },
  
  activeDayItem: {
    backgroundColor: theme.colors.info,
  },
  
  dayName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  dayNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  
  activeDayName: {
    color: theme.colors.white,
  },
  
  activeDayNumber: {
    color: theme.colors.white,
  },
  
  // Class Cards
  classCard: {
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
  
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  classTime: {
    backgroundColor: theme.colors.info,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  
  classTimeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  
  classStatus: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginLeft: 'auto',
  },
  
  classStatusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  
  classTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  classLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
  },
  
  attendeeCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  attendeeCountText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  
  classActionButton: {
    backgroundColor: theme.colors.info,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  
  classActionButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  
  // Student Management
  studentListHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.light,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.containerPadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  
  studentListHeaderItem: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  
  studentListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.containerPadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
    backgroundColor: theme.colors.white,
  },
  
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  
  studentInfo: {
    flex: 1,
  },
  
  studentName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  
  studentDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  attendanceButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  
  attendanceButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  
  // Session preparation
  sessionPrepCard: {
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
  
  sessionPrepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  sessionPrepTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  
  sessionPrepStatus: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  
  sessionPrepStatusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  
  sessionPrepDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.info,
    marginBottom: theme.spacing.xs,
  },
  
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Coach profile
  profileSection: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.containerPadding,
    marginBottom: theme.spacing.md,
  },
  
  profileSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  
  profileField: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  
  profileFieldLabel: {
    width: 120,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  profileFieldValue: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  
  editButton: {
    backgroundColor: theme.colors.info,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-end',
  },
  
  editButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
});

export default coachStyles; 
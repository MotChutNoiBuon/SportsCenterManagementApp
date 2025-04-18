import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CoachDashboard = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    completedClasses: 0,
    upcomingClasses: 0,
  });

  // Mock data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // In a real app, you would fetch this data from your API or Firebase
    setRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setTodayClasses([
        {
          id: '1',
          title: 'Yoga cơ bản',
          time: '10:00 AM - 11:00 AM',
          location: 'Phòng Yoga 1',
          participants: 8,
          maxParticipants: 12,
        },
        {
          id: '2',
          title: 'Yoga nâng cao',
          time: '2:00 PM - 3:00 PM',
          location: 'Phòng Yoga 2',
          participants: 5,
          maxParticipants: 8,
        },
      ]);
      
      setUpcomingClasses([
        {
          id: '3',
          title: 'Yoga cho người mới',
          date: '19/10/2023',
          time: '9:00 AM - 10:00 AM',
          location: 'Phòng Yoga 1',
          participants: 3,
          maxParticipants: 12,
        },
        {
          id: '4',
          title: 'Yoga giãn cơ',
          date: '19/10/2023',
          time: '5:30 PM - 6:30 PM',
          location: 'Phòng Yoga 2',
          participants: 6,
          maxParticipants: 10,
        },
        {
          id: '5',
          title: 'Yoga trị liệu',
          date: '20/10/2023',
          time: '10:00 AM - 11:30 AM',
          location: 'Phòng Yoga 1',
          participants: 4,
          maxParticipants: 8,
        },
      ]);
      
      setStudents([
        {
          id: '1',
          name: 'Nguyễn Văn A',
          avatar: 'https://i.pravatar.cc/150?img=1',
          attendance: 8,
          totalClasses: 10,
        },
        {
          id: '2',
          name: 'Trần Thị B',
          avatar: 'https://i.pravatar.cc/150?img=2',
          attendance: 10,
          totalClasses: 10,
        },
        {
          id: '3',
          name: 'Lê Văn C',
          avatar: 'https://i.pravatar.cc/150?img=3',
          attendance: 7,
          totalClasses: 10,
        },
        {
          id: '4',
          name: 'Phạm Thị D',
          avatar: 'https://i.pravatar.cc/150?img=4',
          attendance: 9,
          totalClasses: 10,
        },
      ]);
      
      setStats({
        totalClasses: 45,
        totalStudents: 28,
        completedClasses: 32,
        upcomingClasses: 13,
      });
      
      setRefreshing(false);
    }, 1500);
  };

  const onRefresh = () => {
    loadData();
  };

  const handleClassPress = (classItem) => {
    // Navigate to class details screen
    navigation.navigate('ClassDetails', { classId: classItem.id });
  };

  const handleStudentPress = (student) => {
    // Navigate to student details screen
    navigation.navigate('StudentDetails', { studentId: student.id });
  };

  const renderTodayClassItem = (item) => (
    <TouchableOpacity 
      style={styles.classCard} 
      key={item.id}
      onPress={() => handleClassPress(item)}
    >
      <View style={styles.classTimeContainer}>
        <Icon name="access-time" size={16} color="#4A90E2" />
        <Text style={styles.classTime}>{item.time}</Text>
      </View>
      
      <Text style={styles.classTitle}>{item.title}</Text>
      
      <View style={styles.classInfoRow}>
        <Icon name="room" size={14} color="#666" />
        <Text style={styles.classInfoText}>{item.location}</Text>
      </View>
      
      <View style={styles.classFooter}>
        <View style={styles.participantsContainer}>
          <Icon name="people" size={14} color="#666" />
          <Text style={styles.participantsText}>
            {item.participants}/{item.maxParticipants}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('ClassSession', { classId: item.id })}
        >
          <Text style={styles.startButtonText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => handleStudentPress(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.studentAvatar} />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <View style={styles.attendanceContainer}>
          <Text style={styles.attendanceText}>
            Tham gia: {item.attendance}/{item.totalClasses}
          </Text>
          <View style={styles.attendanceBar}>
            <View 
              style={[
                styles.attendanceFill, 
                { width: `${(item.attendance / item.totalClasses) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào, Huấn luyện viên</Text>
            <Text style={styles.userName}>Nguyễn Thị B</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?img=5' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalClasses}</Text>
            <Text style={styles.statLabel}>Tổng lớp</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Học viên</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedClasses}</Text>
            <Text style={styles.statLabel}>Đã hoàn thành</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.upcomingClasses}</Text>
            <Text style={styles.statLabel}>Sắp diễn ra</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ScheduleClass')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F3FF' }]}>
              <Icon name="event" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.actionText}>Lên lịch</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyClasses')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF5E7' }]}>
              <Icon name="fitness-center" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Lớp học</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Students')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F5FFE8' }]}>
              <Icon name="people" size={24} color="#8BC34A" />
            </View>
            <Text style={styles.actionText}>Học viên</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFE8E8' }]}>
              <Icon name="notifications" size={24} color="#FF5252" />
            </View>
            <Text style={styles.actionText}>Thông báo</Text>
          </TouchableOpacity>
        </View>

        {/* Today's classes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lớp học hôm nay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyClasses')}>
              <Text style={styles.seeAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {todayClasses.length > 0 ? (
            todayClasses.map((item) => renderTodayClassItem(item))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Bạn không có lớp học nào vào hôm nay
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming classes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lớp học sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyClasses')}>
              <Text style={styles.seeAllButton}>Xem lịch</Text>
            </TouchableOpacity>
          </View>

          {upcomingClasses.map((item) => (
            <TouchableOpacity 
              style={styles.upcomingClassItem} 
              key={item.id}
              onPress={() => handleClassPress(item)}
            >
              <View style={styles.upcomingClassDate}>
                <Text style={styles.upcomingClassDateText}>{item.date}</Text>
              </View>
              
              <View style={styles.upcomingClassInfo}>
                <Text style={styles.upcomingClassTitle}>{item.title}</Text>
                
                <View style={styles.upcomingClassDetails}>
                  <View style={styles.upcomingClassDetailItem}>
                    <Icon name="access-time" size={14} color="#666" />
                    <Text style={styles.upcomingClassDetailText}>{item.time}</Text>
                  </View>
                  
                  <View style={styles.upcomingClassDetailItem}>
                    <Icon name="room" size={14} color="#666" />
                    <Text style={styles.upcomingClassDetailText}>{item.location}</Text>
                  </View>
                  
                  <View style={styles.upcomingClassDetailItem}>
                    <Icon name="people" size={14} color="#666" />
                    <Text style={styles.upcomingClassDetailText}>
                      {item.participants}/{item.maxParticipants} học viên
                    </Text>
                  </View>
                </View>
              </View>
              
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Students */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Học viên của bạn</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Students')}>
              <Text style={styles.seeAllButton}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  classTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classTime: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 6,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  classInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  classInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 12,
    textAlign: 'center',
  },
  upcomingClassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  upcomingClassDate: {
    width: 60,
    alignItems: 'center',
  },
  upcomingClassDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  upcomingClassInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  upcomingClassTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  upcomingClassDetails: {
    flexDirection: 'column',
  },
  upcomingClassDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  upcomingClassDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  studentInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  attendanceContainer: {
    marginTop: 2,
  },
  attendanceText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  attendanceBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
  },
  attendanceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});

export default CoachDashboard; 
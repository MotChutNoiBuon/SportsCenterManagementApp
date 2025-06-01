import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MyUserContext } from '../../contexts/UserContext';
import { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoachDashboard = () => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navigation = useNavigation();
  const currentUser = useContext(MyUserContext);
  const userData = currentUser.payload;

  const getDisplayName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData?.username || 'Huấn luyện viên';
  };

  const handleAvatarPress = () => {
    navigation.navigate('Profile', { userData }); // userData là current user
  };

  useEffect(() => {
    loadData();
  }, [userData]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      console.log('Token:', token); // Debug log

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      
      // Fetch today's classes
      const todayResponse = await api.get(API_ENDPOINTS.classes, {
        params: {
          trainer_id: userData.id,
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      });
      console.log('Today classes response:', todayResponse.data); // Debug log
      setTodayClasses(todayResponse.data.results || todayResponse.data);

      // Fetch upcoming classes
      const upcomingResponse = await api.get(API_ENDPOINTS.classes, {
        params: {
          trainer_id: userData.id,
          date_gt: new Date().toISOString().split('T')[0],
          status: 'active',
          ordering: 'start_time'
        }
      });
      console.log('Upcoming classes response:', upcomingResponse.data); // Debug log
      setUpcomingClasses(upcomingResponse.data.results || upcomingResponse.data);

      // Fetch recent students
      const studentsResponse = await api.get(API_ENDPOINTS.students, {
        params: {
          trainer_id: userData.id,
          limit: 4
        }
      });
      console.log('Students response:', studentsResponse.data); // Debug log
      setStudents(studentsResponse.data.results || studentsResponse.data);

      // Fetch stats
      const statsResponse = await api.get(API_ENDPOINTS.trainerStats, {
        params: {
          trainer_id: userData.id
        }
      });
      console.log('Stats response:', statsResponse.data); // Debug log
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (error.response?.status === 401) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadData();
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('CoachClassDetail', { classId: classItem.id });
  };

  const handleStudentPress = (student) => {
    navigation.navigate('StudentDetails', { studentId: student.id });
  };

  const handleMyClassesPress = () => {
    navigation.navigate('CoachClasses');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleViewStudents = () => {
    navigation.navigate('Students', { trainerId: currentUser.id });
  };

  const renderProfileModal = () => (
    <Modal
      visible={showProfileModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowProfileModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri: userData?.avatar?.trim()
                  ? userData.avatar
                  : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
              }}
              style={styles.profileImage}
            />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
              <Text style={styles.infoValue}>{userData?.username || 'Chưa cập nhật'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData?.email || 'Chưa cập nhật'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{userData?.phone || 'Chưa cập nhật'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vai trò:</Text>
              <Text style={styles.infoValue}>
                {userData?.role === 'trainer' ? 'Huấn luyện viên' : 'Chưa cập nhật'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setShowProfileModal(false);
              navigation.navigate('Profile', { userData });
            }}
          >
            <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{getDisplayName()}</Text>
        </View>
        <View style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{
                uri: userData?.avatar?.trim()
                  ? userData.avatar
                  : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderProfileModal()}

      {/* Navigation Buttons */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navItem} onPress={handleMyClassesPress}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196f3" />
          </View>
          <Text style={styles.navText}>Lớp học của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleViewStudents}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="people-outline" size={24} color="#9c27b0" />
          </View>
          <Text style={styles.navText}>Học viên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="time-outline" size={24} color="#ff9800" />
          </View>
          <Text style={styles.navText}>Lịch dạy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
            <Ionicons name="log-out-outline" size={24} color="#f44336" />
          </View>
          <Text style={styles.navText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Classes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lớp học hôm nay</Text>
        <TouchableOpacity onPress={handleMyClassesPress}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      {todayClasses.length > 0 ? (
        todayClasses.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.classCard}
            onPress={() => handleClassPress(item)}
          >
            <View style={styles.classInfo}>
              <Text style={styles.className}>{item.name}</Text>
              <Text style={styles.classTime}>
                {new Date(item.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(item.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <View style={styles.participantsContainer}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.participantsText}>
                  {item.current_capacity || 0}/{item.max_members || 20}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => navigation.navigate('ClassSession', { classId: item.id })}
            >
              <Text style={styles.startButtonText}>Bắt đầu</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Bạn không có lớp học nào vào hôm nay</Text>
        </View>
      )}

      {/* Upcoming Classes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lớp học sắp tới</Text>
        <TouchableOpacity onPress={handleMyClassesPress}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      {upcomingClasses.length > 0 ? (
        upcomingClasses.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.classCard}
            onPress={() => handleClassPress(item)}
          >
            <View style={styles.classInfo}>
              <Text style={styles.className}>{item.name}</Text>
              <Text style={styles.classTime}>
                {new Date(item.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(item.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <View style={styles.participantsContainer}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.participantsText}>
                  {item.current_participants || 0}/{item.max_participants || 20}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Bạn không có lớp học nào sắp tới</Text>
        </View>
      )}

      {/* Recent Students Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Học viên gần đây</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Students')}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      {students.length > 0 ? (
        students.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.studentCard}
            onPress={() => handleStudentPress(item)}
          >
            <Image 
              source={{ uri: item.avatar || 'https://i.pravatar.cc/150?img=' + item.id }} 
              style={styles.studentAvatar} 
            />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.full_name}</Text>
              <View style={styles.attendanceContainer}>
                <Text style={styles.attendanceText}>
                  Tham gia: {item.attendance_count || 0}/{item.total_classes || 0}
                </Text>
                <View style={styles.attendanceBar}>
                  <View 
                    style={[
                      styles.attendanceFill, 
                      { width: `${((item.attendance_count || 0) / (item.total_classes || 1)) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="people-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có học viên nào</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  navText: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#2196f3',
    fontSize: 14,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  attendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  attendanceBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  attendanceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  emptySection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CoachDashboard; 
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

const CustomerDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navigation = useNavigation();
  const currentUser = useContext(MyUserContext);
  const userData = currentUser.payload;

  const getDisplayName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData?.username || 'Khách hàng';
  };

  const handleAvatarPress = () => {
    navigation.navigate('Profile', { userData });
  };

  useEffect(() => {
    loadData();
  }, [userData]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.navigate('Login');
        return;
      }

      const api = authApis(token);
      
      // Fetch today's classes
      const todayResponse = await api.get(API_ENDPOINTS.classes, {
        params: {
          student_id: userData.id,
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      });
      setTodayClasses(todayResponse.data.results || todayResponse.data);

      // Fetch upcoming classes
      const upcomingResponse = await api.get(API_ENDPOINTS.classes, {
        params: {
          student_id: userData.id,
          date_gt: new Date().toISOString().split('T')[0],
          status: 'active',
          ordering: 'start_time'
        }
      });
      setUpcomingClasses(upcomingResponse.data.results || upcomingResponse.data);

      // Fetch available classes
      const availableResponse = await api.get(API_ENDPOINTS.classes, {
        params: {
          status: 'active',
          date_gte: new Date().toISOString().split('T')[0],
          ordering: 'start_time'
        }
      });
      setAvailableClasses(availableResponse.data.results || availableResponse.data);

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
    navigation.navigate('ClassDetails', { classId: classItem.id });
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('access_token');
              await AsyncStorage.removeItem('user');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
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
                {userData?.role === 'student' ? 'Học viên' : 'Chưa cập nhật'}
              </Text>
            </View>
          </View>
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

      {/* Navigation Buttons */}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Classes')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="calendar-outline" size={24} color="#2196f3" />
          </View>
          <Text style={styles.navText}>Lớp học</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('CoachList')}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="fitness-outline" size={24} color="#9c27b0" />
          </View>
          <Text style={styles.navText}>Huấn luyện viên</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Schedule')}>
          <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="time-outline" size={24} color="#ff9800" />
          </View>
          <Text style={styles.navText}>Lịch của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
          <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
            <Ionicons name="trending-up-outline" size={24} color="#4caf50" />
          </View>
          <Text style={styles.navText}>Tiến độ</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Classes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lớp học hôm nay</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      {todayClasses.length > 0 ? (
        <FlatList
          data={todayClasses}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.classCard}
              onPress={() => handleClassPress(item)}
            >
              <View style={styles.classCardHeader}>
                <View style={[styles.classTypeBadge, { backgroundColor: '#e3f2fd' }]}>
                  <Text style={[styles.classTypeText, { color: '#2196f3' }]}>{item.type || 'Lớp học'}</Text>
                </View>
                <Text style={styles.classTime}>{item.start_time}</Text>
              </View>
              <Text style={styles.className}>{item.name}</Text>
              <View style={styles.classInfo}>
                <View style={styles.classInfoItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.classInfoText}>{item.duration || '60'} phút</Text>
                </View>
                <View style={styles.classInfoItem}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.classInfoText}>{item.current_students || 0}/{item.max_students || 10} học viên</Text>
                </View>
              </View>
              <View style={styles.trainerInfo}>
                <Image
                  source={{
                    uri: item.trainer_avatar?.trim()
                      ? item.trainer_avatar
                      : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
                  }}
                  style={styles.trainerAvatar}
                />
                <Text style={styles.trainerName}>HLV: {item.trainer_name}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.classListContainer}
        />
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Không có lớp học nào hôm nay</Text>
          <TouchableOpacity style={styles.findClassButton} onPress={() => navigation.navigate('RegisterClass')}>
            <Text style={styles.findClassText}>Tìm lớp học</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Available Classes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lớp học sắp tới</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      {availableClasses.length > 0 ? (
        <FlatList
          data={availableClasses}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.classCard}
              onPress={() => handleClassPress(item)}
            >
              <View style={styles.classCardHeader}>
                <View style={[styles.classTypeBadge, { backgroundColor: '#e3f2fd' }]}>
                  <Text style={[styles.classTypeText, { color: '#2196f3' }]}>{item.type || 'Lớp học'}</Text>
                </View>
                <Text style={styles.classTime}>{item.start_time}</Text>
              </View>
              <Text style={styles.className}>{item.name}</Text>
              <View style={styles.classInfo}>
                <View style={styles.classInfoItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.classInfoText}>{item.duration || '60'} phút</Text>
                </View>
                <View style={styles.classInfoItem}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.classInfoText}>{item.current_students || 0}/{item.max_students || 10} học viên</Text>
                </View>
              </View>
              <View style={styles.trainerInfo}>
                <Image
                  source={{
                    uri: item.trainer_avatar?.trim()
                      ? item.trainer_avatar
                      : 'https://res.cloudinary.com/du0oc4ky5/image/upload/v1741264222/olhl36hwfzoprvgjg2t6.jpg',
                  }}
                  style={styles.trainerAvatar}
                />
                <Text style={styles.trainerName}>HLV: {item.trainer_name}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.classListContainer}
        />
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Không có lớp học nào sắp tới</Text>
          <TouchableOpacity style={styles.findClassButton} onPress={() => navigation.navigate('RegisterClass')}>
            <Text style={styles.findClassText}>Tìm lớp học</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderProfileModal()}
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
  emptySection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  findClassButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#2196f3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  findClassText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  classListContainer: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  classTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  classTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  classTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  classInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classInfoText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  trainerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  trainerName: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
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
  },
  profileInfo: {
    alignItems: 'center',
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
    color: '#666',
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomerDashboard;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
<<<<<<< Updated upstream
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
=======
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  RefreshControl
>>>>>>> Stashed changes
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import { getClassDetails } from '../../api/classService';

const ClassDetails = ({ route, navigation }) => {
  const { classId } = route.params;
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [bookingLoading, setBookingLoading] = useState(false);
=======
  const [enrolling, setEnrolling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
>>>>>>> Stashed changes

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const data = await getClassDetails(classId);
      setClassData(data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin lớp học:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

<<<<<<< Updated upstream
  const handleBookClass = () => {
    setBookingLoading(true);
    
    // Simulate booking process
    setTimeout(() => {
      // In a real app, this would call an API to book the class
      setBookingLoading(false);
      
      // Navigate to booking confirmation
      navigation.navigate('BookingConfirmation', {
        classId,
        className: classData.title,
      });
    }, 1500);
=======
  const onRefresh = () => {
    setRefreshing(true);
    loadClassData();
  };

  const handleEnroll = async () => {
    if (!classData || enrolling) return;
    setEnrolling(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đăng ký lớp học');
        return;
      }

      const result = await enrollClass(classData.id);
      console.log('Kết quả đăng ký:', result);

      if (result.status === 'already_enrolled') {
        Alert.alert('Thông báo', result.message);
      } else if (result.status === 'success') {
        Alert.alert('Thành công', 'Đăng ký lớp học thành công!');
        loadClassData(); // Reload thông tin lớp học
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      Alert.alert('Lỗi', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setEnrolling(false);
    }
>>>>>>> Stashed changes
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin lớp học...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin lớp học</Text>
      </View>
    );
  }

<<<<<<< Updated upstream
  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={16}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
=======
  // Lấy tên huấn luyện viên
  let trainerName = '';
  if (classData.trainer) {
    trainerName = classData.trainer.full_name || classData.trainer.username || '';
  }

  // Định dạng ngày giờ
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
>>>>>>> Stashed changes
  };

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< Updated upstream
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: classData.thumbnail }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <Text style={styles.levelBadge}>
              {classData.level === 'beginner'
                ? 'Người mới'
                : classData.level === 'intermediate'
                ? 'Trung cấp'
                : 'Nâng cao'}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Class Title and Price */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{classData.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {classData.price.toLocaleString()} đ
              </Text>
              <Text style={styles.priceNote}>/ khóa học</Text>
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="person" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{classData.instructor}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="access-time" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{classData.time}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="event" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{classData.date}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="location-on" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>{classData.location}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="people" size={20} color="#4A90E2" />
              <Text style={styles.infoText}>
                {classData.spotsAvailable} chỗ còn trống
              </Text>
            </View>
          </View>

          {/* Class Description */}
=======
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{classData.name}</Text>
          <View style={styles.statusContainer}>
            <Ionicons 
              name="ellipse" 
              size={8} 
              color={classData.status === 'active' ? '#4CAF50' : '#FFA000'} 
            />
            <Text style={styles.statusText}>
              {classData.status === 'active' ? 'Đang hoạt động' : 'Sắp diễn ra'}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>Huấn luyện viên: {trainerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>Bắt đầu: {formatDateTime(classData.start_time)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>Kết thúc: {formatDateTime(classData.end_time)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>Địa điểm: {classData.location || 'Phòng tập chính'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin lớp học</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>
                  Số học viên: {classData.current_participants || 0}/{classData.max_participants || 20}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={20} color="#007AFF" />
                <Text style={styles.infoText}>
                  Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(classData.price)}
                </Text>
              </View>
            </View>
          </View>

>>>>>>> Stashed changes
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{classData.description || 'Chưa có mô tả'}</Text>
            </View>
          </View>

          {/* Instructor Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Huấn luyện viên</Text>
            <View style={styles.instructorContainer}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=5' }} // Replace with actual instructor image
                style={styles.instructorImage}
              />
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{classData.instructor}</Text>
                <Text style={styles.instructorBio}>{classData.instructorBio}</Text>
              </View>
            </View>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lợi ích</Text>
            {classData.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dụng cụ cần thiết</Text>
            <View style={styles.equipmentContainer}>
              {classData.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AllReviews', { classId })}
              >
                <Text style={styles.viewAllButton}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {classData.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                {renderStars(review.rating)}
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

<<<<<<< Updated upstream
      {/* Booking Button */}
=======
>>>>>>> Stashed changes
      <View style={styles.bottomContainer}>
        <View style={styles.spotsInfo}>
          <Icon name="event-available" size={20} color="#4A90E2" />
          <Text style={styles.spotsText}>
            {classData.spotsAvailable}/{classData.totalSpots} chỗ
          </Text>
        </View>
        
        <CustomButton
          title={bookingLoading ? 'Đang đặt lịch...' : 'Đăng ký tham gia'}
          onPress={handleBookClass}
          loading={bookingLoading}
          disabled={classData.spotsAvailable <= 0 || bookingLoading}
          type="primary"
          width={200}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    color: '#666',
  },
<<<<<<< Updated upstream
  headerContainer: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
=======
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
>>>>>>> Stashed changes
  },
  contentContainer: {
    padding: 16,
  },
<<<<<<< Updated upstream
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceNote: {
    fontSize: 12,
    color: '#999',
  },
  infoContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
=======
>>>>>>> Stashed changes
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
<<<<<<< Updated upstream
=======
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 12,
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
>>>>>>> Stashed changes
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  instructorBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentItem: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 12,
    color: '#4A90E2',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    fontSize: 14,
    color: '#4A90E2',
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  spotsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default ClassDetails; 
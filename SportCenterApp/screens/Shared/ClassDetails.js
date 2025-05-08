import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../components/CustomButton';
import { getClassDetails } from '../../api/classService';

const ClassDetails = ({ route, navigation }) => {
  const { classId } = route.params;
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

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
    }
  };

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
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
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
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{classData.description}</Text>
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

      {/* Booking Button */}
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
    backgroundColor: 'white',
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
  },
  contentContainer: {
    padding: 16,
  },
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
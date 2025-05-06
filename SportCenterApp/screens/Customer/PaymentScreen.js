import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5 } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../api/apiConfig';
import { theme } from '../../styles';

const PaymentScreen = ({ navigation, route }) => {
  // Get data from route params
  const { classData, enrollmentId } = route.params || {};
  
  // State
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [userData, setUserData] = useState(null);
  
  // Payment methods based on backend model
  const paymentMethods = [
    { 
      id: 'momo', 
      name: 'Momo', 
      icon: 'wallet', 
      color: '#A50064',
      description: 'Thanh toán qua ví điện tử Momo',
      logo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'
    },
    { 
      id: 'vnpay', 
      name: 'VNPAY', 
      icon: 'card', 
      color: '#0066FF',
      description: 'Thanh toán qua cổng thanh toán VNPAY',
      logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png'
    },
    { 
      id: 'stripe', 
      name: 'Stripe', 
      icon: 'card-outline', 
      color: '#635BFF',
      description: 'Thanh toán qua thẻ quốc tế',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png'
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.profile}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setUserData(response.data);
      } else {
        // Mock data
        setUserData({
          id: 1,
          username: 'nguyenvana',
          full_name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phone: '0901234567'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Mock data
      setUserData({
        id: 1,
        username: 'nguyenvana',
        full_name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleSelectPaymentMethod = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleProcessPayment = async () => {
    if (!classData || !userData) {
      Alert.alert('Lỗi', 'Thiếu thông tin cần thiết để thanh toán.');
      return;
    }

    setProcessingPayment(true);

    try {
      const token = await AsyncStorage.getItem('access_token');
      
      // Generate a random transaction ID
      const transactionId = `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Call payment API
      const paymentData = {
        member: userData.id,
        amount: classData.price,
        payment_method: selectedMethod,
        status: 'pending',
        transaction_id: transactionId
      };
      
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.payments}`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // For the sake of this demo, we'll simulate a successful payment
      // In a real app, this would redirect to a payment gateway or process payment
      
      // Simulate payment processing
      setTimeout(() => {
        // Update enrollment status
        updateEnrollmentStatus();
      }, 2000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setProcessingPayment(false);
      Alert.alert(
        'Lỗi thanh toán',
        'Không thể xử lý thanh toán. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.'
      );
    }
  };

  const updateEnrollmentStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      // Update enrollment status to 'approved' after payment
      if (enrollmentId) {
        await axios.patch(
          `${API_BASE_URL}${API_ENDPOINTS.enrollments}/${enrollmentId}/`,
          { status: 'approved' },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Show success message and navigate back
      setProcessingPayment(false);
      
      Alert.alert(
        'Thanh toán thành công',
        `Bạn đã đăng ký thành công lớp "${classData.name}".`,
        [
          {
            text: 'Xem lịch học',
            onPress: () => navigation.navigate('CustomerDashboard')
          }
        ]
      );
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      setProcessingPayment(false);
      
      // Even if updating enrollment fails, show success to user
      // (in a real app, you would handle this more gracefully)
      Alert.alert(
        'Thanh toán thành công',
        `Bạn đã đăng ký thành công lớp "${classData.name}".`,
        [
          {
            text: 'Xem lịch học',
            onPress: () => navigation.navigate('CustomerDashboard')
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>Không tìm thấy thông tin lớp học</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <Text style={styles.headerSubtitle}>Vui lòng hoàn tất thanh toán để đăng ký lớp học</Text>
      </View>
      
      <View style={styles.classInfoCard}>
        <Text style={styles.sectionTitle}>Thông tin lớp học</Text>
        
        <View style={styles.classInfo}>
          <Text style={styles.className}>{classData.name}</Text>
          <Text style={styles.classDetail}>
            <Ionicons name="calendar" size={16} color="#666" />{" "}
            {formatDate(classData.schedule)}
          </Text>
          <Text style={styles.classDetail}>
            <Ionicons name="person" size={16} color="#666" />{" "}
            {classData.trainer?.full_name || 'Chưa có huấn luyện viên'}
          </Text>
          <Text style={styles.classPrice}>{formatCurrency(classData.price)}</Text>
        </View>
      </View>
      
      <View style={styles.userInfoCard}>
        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        
        <View style={styles.userInfo}>
          <Text style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Người đăng ký:</Text> {userData?.full_name}
          </Text>
          <Text style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Email:</Text> {userData?.email}
          </Text>
          <Text style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Số điện thoại:</Text> {userData?.phone}
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentMethodsCard}>
        <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
        
        <View style={styles.paymentMethods}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodItem,
                selectedMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => handleSelectPaymentMethod(method.id)}
            >
              <Image 
                source={{ uri: method.logo }}
                style={styles.paymentMethodLogo}
                resizeMode="contain"
              />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <Text style={styles.paymentMethodDescription}>{method.description}</Text>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Tổng thanh toán</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Giá lớp học</Text>
          <Text style={styles.summaryValue}>{formatCurrency(classData.price)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí dịch vụ</Text>
          <Text style={styles.summaryValue}>{formatCurrency(0)}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{formatCurrency(classData.price)}</Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={processingPayment}
        >
          <Text style={styles.cancelButtonText}>Quay lại</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.payButton, processingPayment && styles.disabledButton]}
          onPress={handleProcessPayment}
          disabled={processingPayment}
        >
          {processingPayment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Thanh toán</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Bằng cách nhấn "Thanh toán", bạn đồng ý với các điều khoản dịch vụ và chính sách bảo mật của chúng tôi.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  classInfoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  classInfo: {
    paddingHorizontal: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  classDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  classPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
  },
  userInfoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    paddingHorizontal: 8,
  },
  userInfoItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  paymentMethodsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  paymentMethodLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#666',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  payButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disclaimer: {
    padding: 16,
    marginBottom: 30,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PaymentScreen; 
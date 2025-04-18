import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RoleSelectionScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  // Automatically set customer role
  const [selectedRole, setSelectedRole] = useState('customer');

  const customerRole = {
    id: 'customer',
    title: 'Khách hàng',
    description: 'Đặt lịch tập luyện, tham gia các lớp học, theo dõi tiến trình',
    icon: require('../../assets/customer_icon.png'),
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      
      // Save user role to AsyncStorage
      await AsyncStorage.setItem('userRole', 'customer');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      
      // Restart the app to reload the navigation with updated states
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save user role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Xác nhận vai trò của bạn</Text>
      <Text style={styles.subtitle}>Tài khoản của bạn sẽ được đăng ký với vai trò Khách hàng</Text>

      <View style={styles.rolesContainer}>
        <View
          style={[
            styles.roleCard,
            styles.selectedRole,
          ]}
        >
          <Image source={customerRole.icon} style={styles.roleIcon} />
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>{customerRole.title}</Text>
            <Text style={styles.roleDescription}>{customerRole.description}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>
          {loading ? 'Đang xử lý...' : 'Tiếp tục'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  rolesContainer: {
    marginVertical: 20,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRole: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    backgroundColor: '#F0F8FF',
  },
  roleIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RoleSelectionScreen;

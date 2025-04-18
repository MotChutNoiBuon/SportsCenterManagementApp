// src/screens/Auth/RegisterScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { register } from '../../api/authService';
import styles from './styles/RegisterStyle';

// Đặt là true để sử dụng đăng ký giả lập khi backend chưa sẵn sàng
const DEV_MODE = true;

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [avatar, setAvatar] = useState(null);

  // Hàm đăng ký giả lập cho chế độ phát triển
  const mockRegister = async (userData) => {
    console.log('Sử dụng đăng ký giả lập với data:', userData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          username: userData.username,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: 'member',
        });
      }, 1500);
    });
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !username || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp!');
      return;
    }
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsRegistering(true);

      const userData = {
        username,
        password,
        email,
        firstName,
        lastName,
        phone: '',
        avatar, // Gửi URI ảnh đại diện nếu có
      };

      let result;
      // Sử dụng mockRegister nếu đang ở chế độ phát triển
      if (DEV_MODE) {
        console.log('Đang chạy trong chế độ DEV. Sử dụng đăng ký giả lập.');
        result = await mockRegister(userData);
      } else {
        console.log('Đang chạy trong chế độ PRODUCTION. Gọi API thật.');
        result = await register(userData);
      }

      console.log('Kết quả đăng ký:', result);

      // Lưu thông tin vào AsyncStorage
      await AsyncStorage.setItem('userRole', 'member');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          role: 'member',
          avatar,
        })
      );

      // Hiển thị thông báo thành công
      Alert.alert(
        'Đăng ký thành công', 
        'Chào mừng bạn đến với ứng dụng Sport Center!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Chuyển hướng đến CustomerDashboard
              navigation.reset({
                index: 0,
                routes: [{ name: 'CustomerDashboard' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const errorMessage = 
        error?.response?.data?.detail || 
        error?.message || 
        'Đăng ký không thành công. Vui lòng thử lại sau.';
        
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Bạn cần cho phép ứng dụng truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Đăng ký {DEV_MODE ? '(Dev Mode)' : ''}</Text>

        <TextInput
          label="Họ"
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
          placeholder="VD: Nguyễn"
          placeholderTextColor="gray"
          theme={{ colors: { background: '#f9f9f9' } }}
        />

        <TextInput
          label="Tên"
          value={lastName}
          onChangeText={setLastName}
          mode="outlined"
          style={styles.input}
          placeholder="VD: Văn A"
          placeholderTextColor="gray"
          theme={{ colors: { background: '#f9f9f9' } }}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          placeholder="VD: abc@gmail.com"
          placeholderTextColor="gray"
          theme={{ colors: { background: '#f9f9f9' } }}
        />

        <TextInput
          label="Tên người dùng"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          placeholder="VD: nguyenvana"
          placeholderTextColor="gray"
          theme={{ colors: { background: '#f9f9f9' } }}
        />

        <TextInput
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          mode="outlined"
          style={styles.input}
          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          placeholderTextColor="gray"
          theme={{ colors: { background: '#f9f9f9' } }}
        />

        <TextInput
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          mode="outlined"
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="gray"
          theme={{ colors: { background: '#f9f9f9' } }}
        />

        <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>Chọn ảnh đại diện...</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isRegistering && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
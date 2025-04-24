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
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { register } from '../../api/authService';
import { authStyles, theme } from '../../styles';
import { DEV_MODE } from '../../api/apiConfig';

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
  const [phone, setPhone] = useState('');

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
        phone,
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

      // Hiển thị thông báo thành công
      Alert.alert(
        'Đăng ký thành công', 
        'Vui lòng đăng nhập để tiếp tục!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Chuyển hướng đến LoginScreen
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      const errorMessage = 
        typeof error === 'object' && error.message
          ? error.message
          : 'Đăng ký không thành công. Vui lòng thử lại sau.';
        
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={[authStyles.scrollContainer, { paddingBottom: 150 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <Image source={require('../../assets/icon.png')} style={authStyles.logo} />
            <Text style={authStyles.title}>Đăng ký {DEV_MODE ? '(Dev Mode)' : ''}</Text>

            <TextInput
              label="Họ"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: Nguyễn"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
            />

            <TextInput
              label="Tên"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: Văn A"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: abc@gmail.com"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
            />

            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: 0901234567"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
            />

            <TextInput
              label="Tên người dùng"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: nguyenvana"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
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
              style={authStyles.input}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
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
              style={authStyles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
            />

            <TouchableOpacity onPress={pickAvatar} style={authStyles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={authStyles.avatar} />
              ) : (
                <Text style={authStyles.avatarText}>Chọn ảnh đại diện...</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[authStyles.button, isRegistering && authStyles.disabledButton]}
              onPress={handleRegister}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={authStyles.buttonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={authStyles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
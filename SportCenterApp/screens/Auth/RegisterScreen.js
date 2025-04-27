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
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({});

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

  // Kiểm tra hợp lệ của form
  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!firstName) {
      newErrors.firstName = 'Vui lòng nhập họ';
      isValid = false;
    }

    if (!lastName) {
      newErrors.lastName = 'Vui lòng nhập tên';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Email không hợp lệ';
        isValid = false;
      }
    }

    if (!username) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    // Xóa thông báo lỗi cũ
    setErrorMsg('');
    
    // Kiểm tra hợp lệ
    if (!validate()) {
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
        avatar,
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
      
      // Xử lý lỗi dựa trên phản hồi từ server
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        // Kiểm tra lỗi cụ thể từ server và gán vào các trường tương ứng
        const fieldErrors = {};
        
        if (typeof serverErrors === 'object') {
          // Xử lý lỗi dạng object
          Object.keys(serverErrors).forEach(key => {
            if (key === 'username') fieldErrors.username = serverErrors[key][0];
            else if (key === 'email') fieldErrors.email = serverErrors[key][0];
            else if (key === 'password') fieldErrors.password = serverErrors[key][0];
            else if (key === 'detail') setErrorMsg(serverErrors[key]);
            else if (Array.isArray(serverErrors[key])) {
              fieldErrors[key] = serverErrors[key][0];
            } else {
              fieldErrors[key] = serverErrors[key];
            }
          });
          
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          } else {
            // Nếu không tìm thấy lỗi cụ thể, hiển thị thông báo chung
            setErrorMsg('Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
          }
        } else if (typeof serverErrors === 'string') {
          // Xử lý lỗi dạng string
          setErrorMsg(serverErrors);
        }
      } else if (error.message) {
        // Xử lý lỗi network hoặc lỗi khác
        setErrorMsg(error.message);
      } else {
        // Lỗi không xác định
        setErrorMsg('Đăng ký không thành công. Vui lòng thử lại sau.');
      }
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

  // Xử lý khi nhập giá trị để xóa lỗi
  const handleInputChange = (field, value) => {
    // Cập nhật giá trị
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'email': setEmail(value); break;
      case 'username': setUsername(value); break;
      case 'phone': setPhone(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
    }
    
    // Xóa lỗi cho trường đó
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    // Xóa thông báo lỗi chung
    if (errorMsg) {
      setErrorMsg('');
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
            
            {/* Hiển thị lỗi chung nếu có */}
            {errorMsg ? (
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            ) : null}

            <TextInput
              label="Họ"
              value={firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: Nguyễn"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
              error={!!errors.firstName}
            />
            {errors.firstName ? (
              <Text style={authStyles.fieldError}>{errors.firstName}</Text>
            ) : null}

            <TextInput
              label="Tên"
              value={lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: Văn A"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
              error={!!errors.lastName}
            />
            {errors.lastName ? (
              <Text style={authStyles.fieldError}>{errors.lastName}</Text>
            ) : null}

            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: abc@gmail.com"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
              error={!!errors.email}
            />
            {errors.email ? (
              <Text style={authStyles.fieldError}>{errors.email}</Text>
            ) : null}

            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={(text) => handleInputChange('phone', text)}
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
              onChangeText={(text) => handleInputChange('username', text)}
              autoCapitalize="none"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: nguyenvana"
              placeholderTextColor="gray"
              theme={{ colors: { background: theme.colors.background } }}
              error={!!errors.username}
            />
            {errors.username ? (
              <Text style={authStyles.fieldError}>{errors.username}</Text>
            ) : null}

            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={(text) => handleInputChange('password', text)}
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
              error={!!errors.password}
            />
            {errors.password ? (
              <Text style={authStyles.fieldError}>{errors.password}</Text>
            ) : null}

            <TextInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
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
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword ? (
              <Text style={authStyles.fieldError}>{errors.confirmPassword}</Text>
            ) : null}

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
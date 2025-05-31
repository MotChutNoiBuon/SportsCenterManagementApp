// src/screens/Auth/RegisterScreen.js

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  SafeAreaView, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { authStyles, theme } from '../../styles';
import apiConfig, { DEV_MODE, API_ENDPOINTS } from '../../api/apiConfig';

export default function RegisterScreen({ navigation }) {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [full_name, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({});

  // Tự động cập nhật full_name khi first_name hoặc last_name thay đổi
  useEffect(() => {
    const fullName = `${first_name} ${last_name}`.trim();
    setFullname(fullName);
  }, [first_name, last_name]);

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!first_name) {
      newErrors.first_name = 'Vui lòng nhập họ';
      isValid = false;
    }

    if (!last_name) {
      newErrors.last_name = 'Vui lòng nhập tên';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!username) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
      isValid = false;
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    if (!phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^\d{9,11}$/.test(phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  
  
  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const form = new FormData();
      form.append('first_name', first_name);
      form.append('last_name', last_name);
      form.append('full_name', full_name);
      form.append('username', username);
      form.append('email', email);
      form.append('password', password);
      form.append('password2', confirmPassword);  // sửa ở đây
      form.append('phone', phone);
      form.append('role', 'member');  // Thêm role mặc định là member
      
      if (avatar) {
        form.append('avatar', {
          uri: avatar,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
      }
      
      await apiConfig.post(API_ENDPOINTS['register'], form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert('Thành công', 'Đăng ký thành công!');
      navigation.navigate('Login');
    } catch (ex) {
      console.error(ex);
      if (ex.response?.data?.message) {
        setErrorMsg(ex.response.data.message);
      } else {
        setErrorMsg('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Bạn cần cho phép ứng dụng truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,  // sửa ở đây
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={[authStyles.scrollContainer, { paddingBottom: 150 }]} keyboardShouldPersistTaps="handled">
            <Image source={require('../../assets/icon.png')} style={authStyles.logo} />
            <Text style={authStyles.title}>Đăng ký {DEV_MODE ? '(Dev Mode)' : ''}</Text>

            {errorMsg !== '' && <Text style={authStyles.errorText}>{errorMsg}</Text>}

            <TextInput
              label="Họ"
              value={first_name}
              onChangeText={setFirstName}
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: Nguyễn"
              error={!!errors.first_name}
            />
            {errors.first_name && <Text style={authStyles.fieldError}>{errors.first_name}</Text>}

            <TextInput
              label="Tên"
              value={last_name}
              onChangeText={setLastName}
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: Văn A"
              error={!!errors.last_name}
            />
            {errors.last_name && <Text style={authStyles.fieldError}>{errors.last_name}</Text>}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: abc@gmail.com"
              error={!!errors.email}
            />
            {errors.email && <Text style={authStyles.fieldError}>{errors.email}</Text>}

            <TextInput
              label="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: 0901234567"
              error={!!errors.phone}
            />
            {errors.phone && <Text style={authStyles.fieldError}>{errors.phone}</Text>}

            <TextInput
              label="Tên người dùng"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              mode="outlined"
              style={authStyles.input}
              placeholder="VD: nguyenvana"
              error={!!errors.username}
            />
            {errors.username && <Text style={authStyles.fieldError}>{errors.username}</Text>}

            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
              mode="outlined"
              style={authStyles.input}
              placeholder="Nhập mật khẩu"
              error={!!errors.password}
            />
            {errors.password && <Text style={authStyles.fieldError}>{errors.password}</Text>}

            <TextInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off' : 'eye'} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
              mode="outlined"
              style={authStyles.input}
              placeholder="Nhập lại mật khẩu"
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <Text style={authStyles.fieldError}>{errors.confirmPassword}</Text>}

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
// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { login } from '../../api/authService';
import styles from './styles/LoginStyle';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    try {
      setIsLoading(true);
      const userProfile = await login(username, password);

      // Đăng nhập thành công, chuyển hướng dựa trên vai trò
      if (userProfile.role === 'member') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerDashboard' }],
        });
      } else {
        Alert.alert('Thông báo', 'Tài khoản không có quyền truy cập.');
      }
    } catch (error) {
      Alert.alert(
        'Đăng nhập thất bại',
        error.response?.data?.error_description || 'Sai tên đăng nhập hoặc mật khẩu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Đăng nhập</Text>

      {/* Trường Tên người dùng */}
      <TextInput
        label="Tên người dùng"
        value={username}
        placeholder="VD: nguyenvana"
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
      />

      {/* Trường Mật khẩu */}
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
      />

      {/* Nút Đăng nhập */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>

      {/* Các nút đăng nhập với mạng xã hội */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../../assets/google.png')} style={styles.icon} />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../../assets/facebook.png')} style={styles.icon} />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Liên kết tới màn hình đăng ký */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}
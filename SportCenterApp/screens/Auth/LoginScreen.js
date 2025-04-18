// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { login } from '../../api/authService';
import styles from './styles/LoginStyle';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    try {
      setIsLoading(true);
      const userProfile = await login(username, password);
      
      // Đăng nhập thành công, reset và chuyển tới Dashboard dựa vào vai trò
      if (userProfile.role === 'member') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerDashboard' }],
        });
      } else {
        // Xử lý nếu không phải vai trò khách hàng (hiếm khi xảy ra do chúng ta chỉ đăng ký member)
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

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"  
        value={username} 
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>

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

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

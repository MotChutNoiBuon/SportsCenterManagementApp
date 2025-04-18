// src/screens/Auth/RegisterScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register } from '../../api/authService';
import styles from './styles/RegisterStyle';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    // Kiểm tra các trường dữ liệu
    if (!firstName || !lastName || !email || !username || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp!');
      return;
    }

    try {
      setIsRegistering(true);
      
      // Gọi API đăng ký
      const userData = {
        username,
        password,
        email,
        firstName,
        lastName,
        phone: '',  // Có thể thêm trường số điện thoại vào form nếu cần
      };
      
      await register(userData);
      
      // Đăng nhập ngay sau khi đăng ký
      await AsyncStorage.setItem('userRole', 'member');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      
      // Lưu thông tin người dùng
      await AsyncStorage.setItem('userData', JSON.stringify({
        firstName,
        lastName,
        username,
        email,
        role: 'member',
      }));
      
      // Đặt lại stack và chuyển trực tiếp đến CustomerDashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerDashboard' }],
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          'Đăng ký không thành công. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', errorMessage);
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />

      <Text style={styles.title}>Đăng ký</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Tên"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
     
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
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity 
        style={[styles.button, isRegistering && styles.disabledButton]} 
        onPress={handleRegister}
        disabled={isRegistering}
      >
        {isRegistering ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

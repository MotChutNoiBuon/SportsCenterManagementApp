// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import styles from './styles/LoginStyle';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');  // Thay đổi tên state từ email thành username
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Gọi API đăng nhập hoặc xác thực OAuth2
    console.log('Username:', username, 'Password:', password);  // Cập nhật ở đây để phù hợp với tên người dùng
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />

      <Text style={styles.title}>Đăng nhập</Text>

      {/* Thay đổi từ Email thành Tên người dùng */}
      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"  
        value={username} 
        onChangeText={setUsername} 
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
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

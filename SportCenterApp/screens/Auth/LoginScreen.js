// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from './styles/LoginStyle';
import { TextInput } from 'react-native-paper';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // State để quản lý loading khi đăng nhập

  const handleLogin = () => {
    if (!username || !password) {
      alert('Vui lòng nhập tên người dùng và mật khẩu');
      return;
    }

    setIsLoading(true);  // Bắt đầu loading

    // TODO: Gọi API đăng nhập hoặc xác thực OAuth2
    console.log('Username:', username, 'Password:', password); // In ra username và password

    // Giả lập API đăng nhập
    setTimeout(() => {
      setIsLoading(false);  // Tắt loading khi nhận được phản hồi từ API
      navigation.navigate('Home');  // Chuyển hướng tới màn hình chính (Home) sau khi đăng nhập thành công
    }, 2000); // Giả lập thời gian đăng nhập
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
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />  // Hiển thị loading indicator
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>  // Hiển thị văn bản đăng nhập
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

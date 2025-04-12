// src/screens/Auth/RegisterScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import styles from './styles/RegisterStyle';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');  // Thêm state cho "Họ"
  const [lastName, setLastName] = useState('');    // Thêm state cho "Tên"
  const [username, setUsername] = useState('');    // Thêm state cho "Tên người dùng"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    // TODO: Gọi API tạo tài khoản
    console.log({ firstName, lastName, username, email, password });
    navigation.navigate('RoleSelection'); // chuyển qua màn chọn vai trò
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />

      <Text style={styles.title}>Đăng ký</Text>

      {/* Tách "Họ và tên" thành 2 ô: "Họ" và "Tên" */}
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
      />
     
      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={username}
        onChangeText={setUsername}
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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

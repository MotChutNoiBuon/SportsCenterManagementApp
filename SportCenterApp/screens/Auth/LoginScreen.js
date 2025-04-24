// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { login } from '../../api/authService';
import { authStyles, theme } from '../../styles';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={[authStyles.scrollContainer, { paddingBottom: 120 }]}
            keyboardShouldPersistTaps="handled" 
            showsVerticalScrollIndicator={true}
          >
            <Image source={require('../../assets/icon.png')} style={authStyles.logo} />
            <Text style={authStyles.title}>Đăng nhập</Text>

            {/* Trường Tên người dùng */}
            <TextInput
              label="Tên người dùng"
              value={username}
              placeholder="VD: nguyenvana"
              onChangeText={setUsername}
              mode="outlined"
              style={authStyles.input}
              autoCapitalize="none"
              theme={{ colors: { background: theme.colors.background } }}
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
              style={authStyles.input}
              theme={{ colors: { background: theme.colors.background } }}
            />

            {/* Nút Đăng nhập */}
            <TouchableOpacity
              style={[authStyles.button, isLoading && authStyles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={authStyles.buttonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <Text style={authStyles.orText}>Hoặc đăng nhập bằng</Text>

            {/* Các nút đăng nhập với mạng xã hội */}
            <View style={authStyles.socialContainer}>
              <TouchableOpacity style={authStyles.socialButton}>
                <Image source={require('../../assets/google.png')} style={authStyles.socialIcon} />
                <Text style={authStyles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={authStyles.socialButton}>
                <Image source={require('../../assets/facebook.png')} style={authStyles.socialIcon} />
                <Text style={authStyles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Liên kết tới màn hình đăng ký */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={authStyles.registerLink}>Chưa có tài khoản? Đăng ký</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
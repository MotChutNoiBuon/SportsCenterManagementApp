// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { login } from '../../api/authService';
import { authStyles, theme } from '../../styles';
import { useUser } from '../../contexts/UserContext';

export default function LoginScreen({ navigation }) {
  const { login: userLogin } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validate = () => {
    if (!username) {
      setErrorMsg('Vui lòng nhập tên đăng nhập');
      return false;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    // Xóa thông báo lỗi cũ
    setErrorMsg('');
    
    // Kiểm tra đầu vào
    if (!validate()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Gọi API đăng nhập
      const response = await login(username, password);
      
      // Lưu thông tin người dùng vào UserContext
      await userLogin(
        response,
        response.access,
        response.role || 'member'
      );
      
      console.log('Đăng nhập thành công!', response);
      
      // Điều hướng được xử lý tự động qua UserContext trong App.js
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Lỗi từ server
        if (error.response.data && error.response.data.detail) {
          setErrorMsg(error.response.data.detail);
        } else if (error.response.data && error.response.data.error_description) {
          setErrorMsg(error.response.data.error_description);
        } else {
          setErrorMsg('Sai tên đăng nhập hoặc mật khẩu');
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Lỗi trong quá trình thiết lập request
        setErrorMsg(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[authStyles.scrollContainer, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="never" 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ width: '100%' }}>
              <Image source={require('../../assets/icon.png')} style={authStyles.logo} />
              <Text style={authStyles.title}>Đăng nhập</Text>
              
              {/* Hiển thị lỗi nếu có */}
              {errorMsg ? (
                <Text style={authStyles.errorText}>{errorMsg}</Text>
              ) : null}

              {/* Trường Tên người dùng */}
              <TextInput
                label="Tên người dùng"
                value={username}
                placeholder="VD: nguyenvana"
                onChangeText={(text) => {
                  setUsername(text);
                  setErrorMsg('');
                }}
                mode="outlined"
                style={authStyles.input}
                autoCapitalize="none"
                theme={{ colors: { background: theme.colors.background } }}
                error={errorMsg && !username}
              />

              {/* Trường Mật khẩu */}
              <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMsg('');
                }}
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
                error={errorMsg && !password}
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
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
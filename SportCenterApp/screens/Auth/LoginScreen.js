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
  ActivityIndicator,
  Alert
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { login } from '../../api/authService';
import { authStyles, theme } from '../../styles';
import { useUser } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLIENT_ID, CLIENT_SECRET } from '../../api/apiConfig';

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
    try {
      setIsLoading(true);
      setErrorMsg('');

      if (!validate()) {
        return;
      }

      // Gọi API đăng nhập Token Authentication
      const result = await login({
        username: username.trim(),
        password: password.trim()
      });

      console.log('Kết quả đăng nhập:', result);

      // Lưu thông tin đăng nhập vào AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      await AsyncStorage.setItem('access_token', result.tokens.access);
      await AsyncStorage.setItem('userRole', result.user.role);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      
      if (result.tokens.refresh) {
        await AsyncStorage.setItem('refresh_token', result.tokens.refresh);
      }

      // Cập nhật UserContext
      await userLogin(result.user, result.tokens.access, result.user.role);

      // Hiển thị thông báo thành công
      Alert.alert(
        'Đăng nhập thành công',
        `Xin chào ${result.user.username}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // UserContext sẽ tự động chuyển hướng dựa trên isLoggedIn và userRole
            }
          }
        ]
      );

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (error.response) {
        if (error.response.status === 401 || 
            (error.response.status === 400 && error.response.data.error === 'invalid_grant')) {
          errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      }
      
      setErrorMsg(errorMessage);
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
                disabled={isLoading}
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
                disabled={isLoading}
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